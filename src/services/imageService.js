const pdfjsLib = require("pdfjs-dist/build/pdf.js");
const sharp = require("sharp");
const { uploadImage } = require("./storage");
const { TIMEOUTS } = require("../utils/constants");

pdfjsLib.GlobalWorkerOptions.workerSrc = undefined;

async function extractAndUploadImages(pdfBuffer, reportId) {
  try {
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true
    }).promise;

    const allAssets = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const pageAssets = await processPage(pdf, i, reportId);
      allAssets.push(...pageAssets);
    }

    await pdf.destroy();
    return allAssets;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

//search img
async function processPage(pdf, pageNum, reportId) {
  let page = null;
  try {
    page = await pdf.getPage(pageNum);
    
    const ops = await page.getOperatorList();

    const imgIndices = ops.fnArray
      .map((fn, idx) => fn === pdfjsLib.OPS.paintImageXObject ? idx : -1)
      .filter(idx => idx !== -1);

    if (imgIndices.length === 0) return [];

    const results = [];
    for (const idx of imgIndices) {
      const asset = await processImage(page, ops, idx, pageNum, reportId);
      if (asset) results.push(asset);
    }

    page.cleanup();
    return results;
  } catch (err) {
    console.error(`Error procesando página ${pageNum}:`, err);
    return [];
  }
}

async function processImage(page, ops, imgIndex, pageNum, reportId) {
  const imgName = ops.argsArray[imgIndex][0];

  return new Promise((resolve) => {
    // Timeout 
    const timer = setTimeout(() => {
      console.warn(`Timeout procesando imagen ${imgName}`);
      resolve(null);
    }, TIMEOUTS.SHORT || 5000);

    page.objs.get(imgName, async (img) => {
      try {
        if (!img?.data) return resolve(null);

        const { width, height } = img;
        const aspectRatio = width / height;

        // logos
        if (width < 350 || height < 350) return resolve(null);

        // page blank
        if (Math.abs(width - 700) < 10 && Math.abs(height - 991) < 10) {
          return resolve(null);
        }

        if (aspectRatio > 4 || aspectRatio < 0.25) return resolve(null);

        const channels = Math.round(img.data.length / (width * height));
        
        if (![1, 3, 4].includes(channels)) {
          console.log(`[Filtro] Canales no soportados (${channels}) en p${pageNum}`);
          return resolve(null);
        }

        const imageBuffer = await sharp(img.data, {
          raw: { width, height, channels }
        })
        .png()
        .toBuffer();

        const fileName = `p${pageNum}_img${imgIndex}_${Date.now()}.png`;
        const url = await uploadImage(imageBuffer, fileName, reportId);

        clearTimeout(timer);
        resolve({ page: pageNum, url });
      } catch (err) {
        console.error("Error en procesamiento Sharp:", err.message);
        clearTimeout(timer);
        resolve(null);
      }
    });
  });
}

module.exports = { extractAndUploadImages };