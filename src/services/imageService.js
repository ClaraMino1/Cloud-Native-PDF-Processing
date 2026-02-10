const pdfjsLib = require("pdfjs-dist/build/pdf.js");
pdfjsLib.GlobalWorkerOptions.workerSrc = undefined;

const { storage } = require("../config/gcp");
const fs = require("fs");
const sharp = require("sharp");
const os = require("os");
const path = require("path");

const bucket = storage.bucket(process.env.BUCKET_NAME);

async function extractAndUploadImages(pdfBuffer, reportId) {
  const assetUrls = [];

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
  }).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const ops = await page.getOperatorList();

    console.log(`Página ${pageNum}: ${
      ops.fnArray.filter(f => f === pdfjsLib.OPS.paintImageXObject).length
    } imágenes`);

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] !== pdfjsLib.OPS.paintImageXObject) continue;

      const imgName = ops.argsArray[i][0];
      let done = false;

      await Promise.race([
        new Promise(resolve => {
          page.objs.get(imgName, async img => {
            if (done) return;
            done = true;

            if (!img?.data) return resolve();
            if (img.width < 300 || img.height < 300) return resolve();

            const channels = img.data.length / (img.width * img.height);
            if (![1,3,4].includes(channels)) return resolve();

            const localPath = path.join(
              os.tmpdir(),
              `${reportId}_p${pageNum}_${i}.png`
            );

            await sharp(img.data, {
              raw: { width: img.width, height: img.height, channels },
            }).png().toFile(localPath);

            const dest = `assets/${reportId}/p${pageNum}_${i}.png`;
            await bucket.upload(localPath, { destination: dest });

            const [url] = await bucket.file(dest).getSignedUrl({
              action: "read",
              expires: Date.now() + 86400000,
            });

            assetUrls.push({ page: pageNum, url });
            fs.unlinkSync(localPath);
            resolve();
          });
        }),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
    }
  }

  return assetUrls;
}

module.exports = { extractAndUploadImages };
