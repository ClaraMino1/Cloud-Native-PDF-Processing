const pdfjsLib = require("pdfjs-dist/build/pdf.js");
const sharp = require("sharp");
const { uploadImage } = require("./storage");
const { TIMEOUTS } = require("../utils/constants");

// Importante para entornos de servidor
pdfjsLib.GlobalWorkerOptions.workerSrc = undefined;

//search paintImageXObject(img)

async function extractAndUploadImages(pdfBuffer, reportId) {
  try {
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true
    }).promise;

    const pageNumbers = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
    const allAssets = [];

    //process the pages one by one to avoid overloading the memory
    for (const num of pageNumbers) {
      const pageAssets = await processPage(pdf, num, reportId);
      allAssets.push(...pageAssets);
    }

    await pdf.destroy();

    return allAssets;
  } catch (error) {
    throw new Error(`Error en extracción de imágenes: ${error.message}`);
  }
}

async function processPage(pdf, pageNum, reportId) {
  let page = null;
  try {
    page = await pdf.getPage(pageNum);
    const ops = await page.getOperatorList();

    const imgIndices = ops.fnArray
      .map((fn, idx) => fn === pdfjsLib.OPS.paintImageXObject ? idx : -1)
      .filter(idx => idx !== -1);

    if (imgIndices.length === 0) return [];

    const results = await Promise.all(
      imgIndices.map(idx => processImage(page, ops, idx, pageNum, reportId))
    );

    //delete the page's temporary data once we've taken the photos
    page.cleanup();

    return results.filter(Boolean);
  } catch (err) {
    return [];
  }
}

async function processImage(page, ops, imgIndex, pageNum, reportId) {
  const imgName = ops.argsArray[imgIndex][0];

  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), TIMEOUTS.SHORT);

    page.objs.get(imgName, async (img) => {
      try {
        if (!img?.data) return resolve(null);

        const { width, height } = img;
        const area = width * height;
        const aspectRatio = width / height;

        // logos
        if (width < 350 || height < 350) return resolve(null);

        //page blank background
        if (Math.abs(width - 700) < 5 && Math.abs(height - 991) < 5) {
          console.log(`[Filtro] Fondo de página detectado y omitido: ${width}x${height}`);
          return resolve(null);
        }

        const pageViewport = page.getViewport({ scale: 1 });
        if (width >= pageViewport.width * 0.9 && height >= pageViewport.height * 0.9) {
          return resolve(null);
        }

        if (aspectRatio > 4 || aspectRatio < 0.25) return resolve(null);

        const channels = img.data.length / (width * height);

        const imageBuffer = await sharp(img.data, {
          raw: { width, height, channels }
        })
          .png()
          .toBuffer()

        const fileName = `p${pageNum}_img${imgIndex}.png`;
        const url = await uploadImage(imageBuffer, fileName, reportId);

        clearTimeout(timer);
        resolve({ page: pageNum, url });
      } catch (err) {
        clearTimeout(timer);
        resolve(null);
      }
    });
  });
}

module.exports = { extractAndUploadImages };