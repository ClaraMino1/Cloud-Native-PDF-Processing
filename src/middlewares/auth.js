const config = require('../config/config');

const authenticate = (req, res, next) => {
  const apiKey = req.header('x-api-key');

  if (!apiKey) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'missing x-api-key'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      error: 'Invalid Credentials',
      message: 'The API key provided is incorrect or has expired.'
    });
  }

  next();
};

module.exports = authenticate;