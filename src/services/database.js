const { firestore } = require("../config/gcp");

async function saveReportData(reportId, data) {
  try {
    await firestore
      .collection("reports")
      .doc(reportId)
      .set({
        ...data,
        createdAt: new Date().toISOString(),
      });

    return reportId;
  } catch (error) {
    console.error("Error guardando en Firestore:", error);
    throw error;
  }
}

async function getReportById(reportId) {
  try {
    const doc = await firestore
      .collection("reports")
      .doc(reportId)
      .get();

    if (!doc.exists) return null;
    return doc.data();
  } catch (error) {
    console.error("Error leyendo Firestore:", error);
    throw error;
  }
}

module.exports = {
  saveReportData,
  getReportById,
};
