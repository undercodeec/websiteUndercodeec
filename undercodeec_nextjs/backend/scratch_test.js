const axios = require('axios');
require('dotenv').config();

async function check() {
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    console.log("AVAILABLE MODELS:");
    res.data.models.forEach(m => console.log(m.name));
  } catch(e) {
    console.log("ERROR:", e.response?.data || e.message);
  }
}
check();
