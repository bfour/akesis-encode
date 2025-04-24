import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ComprehendMedicalClient, DetectEntitiesCommand, DetectPHICommand } from '@aws-sdk/client-comprehendmedical';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AWS Medical Comprehend client
const comprehendMedical = new ComprehendMedicalClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET || '',
  },
});

// Routes
app.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Detect medical entities
    const entitiesCommand = new DetectEntitiesCommand({
      Text: text,
    });

    // Detect PHI (Protected Health Information)
    const phiCommand = new DetectPHICommand({
      Text: text,
    });

    // Execute both commands in parallel
    const [entitiesResponse, phiResponse] = await Promise.all([
      comprehendMedical.send(entitiesCommand),
      comprehendMedical.send(phiCommand),
    ]);

    res.json({
      entities: entitiesResponse.Entities,
      phi: phiResponse.Entities,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 