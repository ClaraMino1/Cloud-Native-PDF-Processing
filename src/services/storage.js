const { storage } = require("../config/gcp");

const bucket = storage.bucket(process.env.BUCKET_NAME);

async function uploadFile(fileBuffer, fileName) {
  const blob = bucket.file(`reports/${Date.now()}-${fileName}`);
  await blob.save(fileBuffer);

  const [url] = await blob.getSignedUrl({
    action: "read",
    expires: Date.now() + 3600000,
  });

  return url;
}

module.exports = { uploadFile };
