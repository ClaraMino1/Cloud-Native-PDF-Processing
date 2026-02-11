const { storage } = require("../config/gcp");
const config = require("../config/config");
const { TIMEOUTS,MIME_TYPES } = require("../utils/constants");
const { sanitizeFilename } = require("../utils/validators");

const bucket = storage.bucket(config.gcp.bucketName);

async function uploadFile(fileBuffer, fileName, folder = 'reports', expiration = config.urlExpiration.pdf,timeout = TIMEOUTS.LONG) {
  
  const cleanName = sanitizeFilename(fileName);
  const destination = `${folder}/${Date.now()}-${cleanName}`;
  const blob = bucket.file(destination);
  const extension = fileName.split('.').pop().toLowerCase();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    await blob.save(fileBuffer, {
      contentType: MIME_TYPES[extension] || 'application/octet-stream',
      resumable: false,
      signal: controller.signal
    });
    
    clearTimeout(timer);

    const [url] = await blob.getSignedUrl({
      version: 'v4',
      action: "read",
      expires: Date.now() + expiration,
    });

    return url;
  } catch (error) {
    const msg = error.name === 'AbortError' ? 'Tiempo de espera agotado' : error.message;
    throw new Error(`Error en Storage: ${msg}`);
  }
}

const uploadImage = (buf, name, id) => 
  uploadFile(buf, name, `assets/${id}`, config.urlExpiration.image, TIMEOUTS.LONG);

module.exports = { uploadFile, uploadImage };