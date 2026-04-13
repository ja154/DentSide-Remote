import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Basic security headers, but allow inline scripts/styles for Vite dev
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // BYOK API Endpoint for AI Matchmaker
  app.post('/api/match', async (req, res) => {
    try {
      const { apiKey, profile } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: 'API Key is required (BYOK)' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        Given this dentist profile: ${JSON.stringify(profile)}
        Suggest 3 remote gig opportunities tailored to them.
        Return ONLY a JSON array of objects with the following keys:
        - title (string)
        - company (string)
        - type (string, e.g., "Insurance", "Freelance", "Teledentistry")
        - rate (string, e.g., "$85/hr")
        - match (string, e.g., "98%")
        - tags (array of strings)
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '[]';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error('AI Match Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate matches' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static serving for production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
