const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const models = await genAI.listModels();
        console.log("--- MODELOS DISPONIBLES ---");
        models.models.forEach(m => {
            console.log(`Nombre: ${m.name}, Métodos: ${m.supportedGenerationMethods.join(', ')}`);
        });
        console.log("---------------------------");
    } catch (error) {
        console.error("Error listando modelos:", error.message);
    }
}

listModels();
