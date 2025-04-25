import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
    ComprehendMedicalClient,
    DetectEntitiesV2Command,
    DetectPHICommand,
    InferSNOMEDCTCommand,
} from '@aws-sdk/client-comprehendmedical';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error('API_KEY environment variable is not set');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateApiKey = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== API_KEY) {
        return res
            .status(401)
            .json({ error: 'Unauthorized: Invalid or missing API key' });
    }

    next();
};

// Initialize AWS Medical Comprehend client
const comprehendMedical = new ComprehendMedicalClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET || '',
    },
});

// Routes
app.post('/analyze', authenticateApiKey, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Detect medical entities
        const entitiesCommand = new DetectEntitiesV2Command({
            Text: text,
        });

        // Detect PHI (Protected Health Information)
        const phiCommand = new DetectPHICommand({
            Text: text,
        });

        // Detect SNOMED CT codes
        const snomedCommand = new InferSNOMEDCTCommand({
            Text: text,
        });

        // Execute all commands in parallel
        const [entitiesResponse, phiResponse, snomedResponse] =
            await Promise.all([
                comprehendMedical.send(entitiesCommand),
                comprehendMedical.send(phiCommand),
                comprehendMedical.send(snomedCommand),
            ]);

        res.json({
            entities: entitiesResponse,
            phi: phiResponse,
            snomed: snomedResponse,
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
