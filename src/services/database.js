const { firestore } = require("../config/gcp");
const { TIMEOUTS } = require("../utils/constants");

const reportsCol = firestore.collection("reports");

async function saveReportData(reportId, data) {
  try {
    const dataToSave = {
      ...data,
      updatedAt: new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString()
    };

    // timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUTS.SHORT);

    await reportsCol.doc(reportId).set(dataToSave, { signal: controller.signal });
    
    clearTimeout(timer);
    return reportId;
  } catch (error) {
    throw new Error(`Error al guardar reporte: ${error.message}`);
  }
}

async function getReportById(reportId) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUTS.SHORT);

    const doc = await reportsCol.doc(reportId).get({ signal: controller.signal });
    
    clearTimeout(timer);
    return doc.exists ? doc.data() : null;
  } catch (error) {
    throw new Error(`Error al obtener reporte: ${error.message}`);
  }
}

module.exports = { saveReportData, getReportById };