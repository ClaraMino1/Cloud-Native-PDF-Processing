const { Storage } = require("@google-cloud/storage");
const { Firestore } = require("@google-cloud/firestore");
const config = require("./config");

const storage = new Storage({ 
  keyFilename: config.gcp.credentialsPath 
});

const firestore = new Firestore({
  keyFilename: config.gcp.credentialsPath,
  projectId: config.gcp.projectId,
});

module.exports = { storage, firestore };