const path = require("path");
const { Storage } = require("@google-cloud/storage");
const { Firestore } = require("@google-cloud/firestore");

const credentialsPath = path.join(__dirname, "../../credentials.json");

const storage = new Storage({ keyFilename: credentialsPath });

const firestore = new Firestore({
  keyFilename: credentialsPath,
  projectId: process.env.PROJECT_ID,
});

module.exports = { storage, firestore };
