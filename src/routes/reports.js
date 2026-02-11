const express = require("express");
const router = express.Router();
const multer = require("multer");
const { randomUUID } = require("crypto");
const { extractVetData } = require("../services/extract");
const { saveReportData, getReportById } = require("../services/database");
const { uploadFile } = require("../services/storage");
const { extractAndUploadImages } = require("../services/imageService");
const { isValidPDF,validateReportData } = require("../utils/validators");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("report"), async (req, res) => {

  if (!req.file || !isValidPDF(req.file.buffer)) {
    return res.status(400).json({ error: "invalid pdf" });
  }

  const reportId = randomUUID();
  const pdfBuffer = req.file.buffer;

  // Parallel processes: data extraction, image upload, and PDF upload
  const [structuredData, assetUrls, pdfUrl] = await Promise.all([
    extractVetData(pdfBuffer),
    extractAndUploadImages(pdfBuffer, reportId),
    uploadFile(pdfBuffer, req.file.originalname)
  ]);

  const finalData = {
    id: reportId,
    patient_name: structuredData.patient || "No detectado",
    owner_name: structuredData.owner || "No detectado",
    diagnosis: structuredData.diagnosis || "Consultar informe",
    veterinarian: structuredData.veterinarian || "No detectado",
    recommendations: structuredData.recommendations || "N/A",
    pdf_url: pdfUrl,
    assets: assetUrls,
    processed_at: new Date().toISOString()
  };
  
  const validation = validateReportData(finalData);
  if (!validation.valid) {
      console.error("invalid data:", validation.errors);
      return res.status(500).json({ error: "Error in the structure of the generated report" });
  }

  await saveReportData(reportId, finalData);
  res.status(201).json(finalData);
});

router.get("/reports/:id", async (req, res) => {
  const data = await getReportById(req.params.id);
  if (!data) return res.status(404).json({ error: "No encontrado" });
  res.json(data);
});

module.exports = router;