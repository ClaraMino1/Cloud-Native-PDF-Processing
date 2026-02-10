const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
require('dotenv').config();

const client = new DocumentProcessorServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'credentials.json'
});

async function extractVetData(pdfBuffer) {
    const bufferData = Buffer.from(pdfBuffer);

    const request = {
        name: `projects/${process.env.PROJECT_ID}/locations/${process.env.LOCATION}/processors/${process.env.PROCESSOR_ID}`,
        rawDocument: {
            content: bufferData.toString('base64'),
            mimeType: 'application/pdf',
        },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    const fullText = document.text;
    const extractedData = {
        patient: null,
        owner: null,
        diagnosis: null,
        recommendations: null,
        veterinarian: null
    };

        if (document.entities) {
        for (const entity of document.entities) {
            const type = entity.type.toLowerCase();
            const value = entity.mentionText;
            
            if (type.includes('paciente') || type.includes('patient')) extractedData.patient = value;
            if (type.includes('tutor') || type.includes('propietario') || type.includes('owner')) extractedData.owner = value;
            if (type.includes('diagnóstico') || type.includes('diagnosis')) extractedData.diagnosis = value;
            if (type.includes('recomendación') || type.includes('recommendation')) extractedData.recommendations = value;
            if (type.includes('veterinario') || type.includes('profesional')) extractedData.veterinarian = value;
        }
    }

    // Regex
    if (!extractedData.patient) {
        const match = fullText.match(/Paciente:\s*([^\n\r]*)/i);
        if (match) extractedData.patient = match[1].trim();
    }
    
    if (!extractedData.owner) {
        const match = fullText.match(/Tutor:\s*([^\n\r]*)/i) || fullText.match(/Propietario:\s*([^\n\r]*)/i);
        if (match) extractedData.owner = match[1].trim();
    }

    if (!extractedData.diagnosis) {
        const match = fullText.match(/DIAGNÓSTICO RADIOGRÁFICO([\s\S]*?)(?=Notas:|$)/i) || fullText.match(/CONCLUSION([\s\S]*?)(?=Dr\.|$)/i);
        if (match) extractedData.diagnosis = match[1].trim();
    }

    return {
        patient: extractedData.patient,
        owner: extractedData.owner,
        diagnosis: extractedData.diagnosis,
        veterinarian: extractedData.veterinarian,
        recommendations: extractedData.recommendations,
        originalDocument: document 
    };
}

module.exports = { extractVetData };