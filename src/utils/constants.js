const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;

module.exports = {
  TIMEOUTS: {
    LONG: 3 * MINUTES,
    SHORT: 30 * SECONDS
  },
  FILES: {
    MIN_IMG_DIM: 150,
    EXPIRATION: 24 * HOURS
  },
  MIME_TYPES: { 
    pdf: 'application/pdf', 
    png: 'image/png', 
    jpg: 'image/jpeg', 
    jpeg: 'image/jpeg' 
  },
};