# Medical Comprehend API

A REST API that uses AWS Medical Comprehend to analyze medical text and extract medical entities and protected health information (PHI).

## Prerequisites

- Node.js (v14 or higher)
- AWS Account with Medical Comprehend access
- AWS credentials (Access Key ID and Secret Access Key)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your AWS credentials:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   PORT=3000
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### POST /analyze
Analyzes medical text and returns detected entities and PHI information.

Request body:
```json
{
  "text": "Patient John Doe presented with symptoms of diabetes and high blood pressure."
}
```

Response:
```json
{
  "entities": [
    {
      "Id": 0,
      "Type": "DIAGNOSIS",
      "Text": "diabetes",
      "Score": 0.99
    },
    {
      "Id": 1,
      "Type": "DIAGNOSIS",
      "Text": "high blood pressure",
      "Score": 0.98
    }
  ],
  "phi": [
    {
      "Id": 0,
      "Type": "NAME",
      "Text": "John Doe",
      "Score": 0.99
    }
  ]
}
```

### GET /health
Health check endpoint.

Response:
```json
{
  "status": "ok"
}
``` 