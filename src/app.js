const express = require("express");
const multer = require("multer");

const { extractVetData } = require("./services/extract");
const { saveReportData, getReportById } = require("./services/database");
const { uploadFile } = require("./services/storage");
const { extractAndUploadImages } = require("./services/imageService");

const uuidv4 = () => require("crypto").randomUUID();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

app.post("/upload", upload.single("report"), async (req, res) => {
  try {
    if (!req.file) throw new Error("No se subió ningún archivo");
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Solo PDFs" });
    }

    const reportId = uuidv4();
    const pdfBuffer = req.file.buffer;

    const structuredData = await extractVetData(pdfBuffer);
    const assetUrls = await extractAndUploadImages(pdfBuffer, reportId);
    const pdfUrl = await uploadFile(pdfBuffer, req.file.originalname);

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

    await saveReportData(reportId, finalData);
    res.status(201).json(finalData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/reports/:id", async (req, res) => {
  const data = await getReportById(req.params.id);
  if (!data) return res.status(404).send("No encontrado");
  res.json(data);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Servidor escuchando en el puerto ${PORT}`)
);
