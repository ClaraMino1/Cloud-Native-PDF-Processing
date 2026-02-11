const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;

module.exports = {
  TIMEOUTS: {
    LONG: 3 * MINUTES,
    SHORT: 30 * SECONDS
  },
  FILES: {
    ALLOWED_MIME: 'application/pdf',
    MAGIC_BYTES: Buffer.from([0x25, 0x50, 0x44, 0x46]), 
    MAX_SIZE: 10 * 1024 * 1024,
    MIN_IMG_DIM: 350,
    EXPIRATION: 24 * HOURS
  },
  MIME_TYPES: { 
    pdf: 'application/pdf', 
    png: 'image/png', 
    jpg: 'image/jpeg', 
    jpeg: 'image/jpeg' 
  },
};