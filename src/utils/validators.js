const { FILES } = require('./constants');

const isValidPDF = (buf) => {
  return Buffer.isBuffer(buf) && 
         buf.length > 4 && 
         buf.subarray(0, 4).equals(FILES.MAGIC_BYTES);
};

const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const sanitizeFilename = (name) => {
  if (typeof name !== 'string') return 'unnamed_file';
  
  return name
    .replace(/[^\w.-]/g, '_') 
    .substring(0, 255) || 'unnamed_file';
};

function validateReportData(data) {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['El objeto de datos está vacío o es inválido'] };
  }

  const checks = {
    id: (val) => isValidUUID(val),
    pdf_url: (val) => isValidURL(val),
    processed_at: (val) => !isNaN(Date.parse(val)) 
  };

  Object.entries(checks).forEach(([field, validator]) => {
    if (!data[field] || !validator(data[field])) {
      errors.push(`Campo inválido o faltante: ${field}`);
    }
  });

  if (Array.isArray(data.assets)) {
    data.assets.forEach((asset, i) => {
      if (!isValidURL(asset.url)) {
        errors.push(`Asset en índice ${i} tiene una URL inválida`);
      }
      if (typeof asset.page !== 'number') {
        errors.push(`Asset en índice ${i} no tiene número de página válido`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  isValidPDF,
  isValidUUID,
  isValidURL,
  sanitizeFilename,
  validateReportData
};