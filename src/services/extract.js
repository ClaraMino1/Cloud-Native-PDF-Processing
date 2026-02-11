const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const config = require('../config/config');
const { TIMEOUTS } = require("../utils/constants");

const client = new DocumentProcessorServiceClient({ keyFilename: config.gcp.credentialsPath });

async function extractVetData(pdfBuffer) {

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUTS.LONG);

  try {
    const name = `projects/${config.gcp.projectId}/locations/${config.gcp.location}/processors/${config.gcp.processorId}`;
    
    const [result] = await client.processDocument({
      name,
      rawDocument: { content: pdfBuffer.toString('base64'), mimeType: 'application/pdf' }
    }, { signal: controller.signal });

    clearTimeout(timer);

    const { document } = result;
    const text = document.text;
    
    const extracted = {
      patient: null,
      owner: null,
      diagnosis: null,
      recommendations: null,
      veterinarian: null
    };

    //entities
    document.entities?.forEach(entity => {
      const type = entity.type.toLowerCase();
      const val = entity.mentionText;

      if (type.includes('paciente') || type.includes('patient')) extracted.patient = val;
      if (type.includes('tutor') || type.includes('propietario') || type.includes('owner')) extracted.owner = val;
      if (type.includes('diagnóstico') || type.includes('diagnosis') || type.includes('conclusion')) extracted.diagnosis = val;
      if (type.includes('recomendacion') || type.includes('recommendation') || type.includes('notas')) extracted.recommendations = val;
      if (type.includes('derivante') || type.includes('referido por') || type.includes('profesional')) extracted.veterinarian = val;
    });

    // Fallback
    extracted.patient = extracted.patient || (text.match(/Paciente:\s*([^\n\r]*)/i)?.[1].trim());
    extracted.owner = extracted.owner || (text.match(/(?:Tutor|Propietario):\s*([^\n\r]*)/i)?.[1].trim());
    extracted.diagnosis = extracted.diagnosis || (text.match(/(?:DIAGNÓSTICO RADIOGRÁFICO|CONCLUSION)([\s\S]*?)(?=Notas:|Dr\.|$)/i)?.[1].trim());
    extracted.veterinarian = extracted.veterinarian || (text.match(/(?:derivante|referido por|profesional):\s*([^\n\r]*)/i)?.[1].trim());
    extracted.recommendations = extracted.recommendations || (text.match(/(?:notas|recomendaciones?):\s*([\s\S]*?)(?=\n[A-Z]|$)/i)?.[1].trim());

    return { ...extracted, originalDocument: document };
  } catch (error) {
      clearTimeout(timer);
      const msg = error.name === 'AbortError' ? 'Tiempo de espera agotado' : error.message;
      throw new Error(`Error en Document AI: ${msg}`);
  }
}

module.exports = { extractVetData };