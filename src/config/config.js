require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  gcp: {
    projectId: process.env.PROJECT_ID,
    location: process.env.LOCATION,
    processorId: process.env.PROCESSOR_ID,
    bucketName: process.env.BUCKET_NAME,
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
  },
  //24h
  urlExpiration: {
    pdf: 24 * 60 * 60 * 1000,
    image: 24 * 60 * 60 * 1000
  }
};