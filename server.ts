import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.APP_URL || '*' : '*',
    methods: ['GET', 'POST']
  }));
  
  // Basic security headers, gate CSP to prod only
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));

  // Schema Validation
  const ProfileSchema = z.object({
    experience: z.string().max(100).optional(),
    licenses: z.array(z.string().max(100)).max(20).optional(),
    availability: z.string().max(100).optional(),
    interests: z.array(z.string().max(100)).max(20).optional()
  });

  const MatchRequestSchema = z.object({
    apiKey: z.string().max(150),
    profile: ProfileSchema
  });

  const ExpectedAISchema = z.array(z.object({
    title: z.string(),
    company: z.string(),
    type: z.string(),
    rate: z.string(),
    match: z.string(),
    tags: z.array(z.string()).optional()
  }));

  // BYOK API Endpoint for AI Matchmaker
  app.post('/api/match', async (req, res) => {
    try {
      const parsedData = MatchRequestSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ error: 'Invalid payload structure', details: parsedData.error.errors });
      }

      const { apiKey, profile } = parsedData.data;

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
      
      const parsedJSON = JSON.parse(cleaned);
      const validatedMatches = ExpectedAISchema.parse(parsedJSON);
      
      res.json(validatedMatches);
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
