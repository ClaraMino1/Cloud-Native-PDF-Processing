const { Storage } = require("@google-cloud/storage");
const { Firestore } = require("@google-cloud/firestore");
const config = require("./config");

// const storage = new Storage({
//   projectId: config.gcp.projectId
// });

// const firestore = new Firestore({
//   projectId: config.gcp.projectId,
// });

const storage = new Storage();
const firestore = new Firestore();

module.exports = { storage, firestore };