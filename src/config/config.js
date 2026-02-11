require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8080,
  apiKey: process.env.API_KEY,
  gcp: {
    projectId: process.env.PROJECT_ID,
    location: process.env.LOCATION,
    processorId: process.env.PROCESSOR_ID,
    bucketName: process.env.BUCKET_NAME,
  },
  //24h
  urlExpiration: {
    pdf: 24 * 60 * 60 * 1000,
    image: 24 * 60 * 60 * 1000
  }
};