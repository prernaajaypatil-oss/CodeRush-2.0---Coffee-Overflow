import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

// Add your Gemini API Key here or via .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY' });

let complaintsDB = [];

// GET API
app.get('/api/complaints', (req, res) => {
  res.json(complaintsDB);
});

// POST API (AI Triage)
app.post('/api/complaints', async (req, res) => {
  try {
    const { rawText, language, latitude, longitude } = req.body;

    const prompt = `
      Analyze this citizen complaint for an Indian municipality: "${rawText}" (Language: ${language}).
      Respond ONLY in raw JSON:
      {
        "translatedText": "English translation here",
        "category": "Road Damage | Sanitation | Water Supply | Electricity | Other",
        "priority": "CRITICAL | HIGH | MEDIUM | LOW",
        "summary": "Short 5-word title"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const cleanJson = response.text.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(cleanJson);

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      originalText: rawText,
      translatedText: aiData.translatedText,
      title: aiData.summary,
      category: aiData.category,
      priority: aiData.priority,
      status: 'Pending',
      latitude: latitude || 21.1458,
      longitude: longitude || 79.0882,
      createdAt: new Date().toISOString(),
    };

    complaintsDB.unshift(newTicket);
    res.status(201).json({ success: true, ticket: newTicket });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// PATCH API
app.patch('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  complaintsDB = complaintsDB.map((t) => (t.id === id ? { ...t, status } : t));
  res.json({ success: true });
});

app.listen(5000, () => console.log('🚀 Backend running at http://localhost:5000'));