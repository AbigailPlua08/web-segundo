const fetch = require('node-fetch');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function checkAvailableModels() {
  console.log('🔍 Consultando modelos disponibles para tu API key...\n');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.models) {
      console.log('📋 MODELOS DISPONIBLES:\n');
      
      data.models.forEach(model => {
        const name = model.name.replace('models/', '');
        const methods = model.supportedGenerationMethods || [];
        const hasGenerate = methods.includes('generateContent');
        
        if (hasGenerate) {
          console.log(`✅ ${name}`);
          console.log(`   Métodos: ${methods.join(', ')}`);
          console.log('');
        }
      });
    } else {
      console.log('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Error consultando API:', error.message);
  }
}

checkAvailableModels();
