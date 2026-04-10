# Sentimnetal AUDIT - Sentiment Analysis Model Audit

A comprehensive audit platform for comparing sentiment analysis accuracy between base and fine-tuned LLM models.

## Features

- **24 Sentiment Tests** across 6 categories:
  - Product Reviews (4 tests)
  - Social Media (4 tests)
  - Customer Feedback (4 tests)
  - News Headlines (4 tests)
  - Mixed Sentiment (4 tests)
  - Sarcasm Detection (4 tests)

- **Audit Pipeline**:
  1. Query both models via HuggingFace Inference API
  2. Classify sentiment responses
  3. Calculate accuracy per category with weighted scoring
  4. Detect accuracy degradation
  5. Generate AI-powered diagnostics for degraded categories

## Tech Stack

- **Backend**: FastAPI + Python
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **APIs**: HuggingFace Inference API, Groq (for nuanced sentiment analysis)

## Setup

### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn httpx python-dotenv

# Configure environment (.env already has HF_TOKEN set)
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Running Locally

### Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Access the app at **http://localhost:5173**

## Environment Variables

### Backend (.env)
```env
HF_TOKEN=your_huggingface_token
GROQ_API_KEY=your_groq_api_key (optional, for nuanced diagnostics)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/audit` | Run sentiment audit |
| GET | `/health` | Health check |
| GET | `/report` | Get last audit results |

### Audit Request
```json
{
  "base_model_id": "cardiffnlp/twitter-roberta-base-sentiment",
  "ft_model_id": "username/my-sentiment-model",
  "dataset_description": "Fine-tuned on customer support conversations"
}
```

## Example Model Pairs to Test

### Twitter RoBERTa Family
- Base: `cardiffnlp/twitter-roberta-base-sentiment`
- FT: `your-username/twitter-sentiment-finetuned`

### DistilBERT Family
- Base: `distilbert-base-uncased-finetuned-sst-2-english`
- FT: `your-username/distilbert-sentiment-finetuned`

### BERT Family
- Base: `nlptown/bert-base-multilingual-uncased-sentiment`
- FT: `your-username/bert-multilingual-sentiment`

## Sentiment Categories

| Category | Weight | Description |
|----------|--------|-------------|
| Product Reviews | 20% | E-commerce and product feedback |
| Social Media | 15% | Tweets and social posts |
| Customer Feedback | 15% | Support and service reviews |
| News Headlines | 15% | Factual news sentiment |
| Mixed Sentiment | 20% | Texts with both positive and negative |
| Sarcasm Detection | 15% | Sarcastic and ironic statements |

## Health Status

| Accuracy | Status |
|----------|--------|
| > 85% | Excellent |
| 70-85% | Good |
| 50-70% | Fair |
| < 50% | Poor |

## Deployment

### Railway (Backend)
1. Connect repository to Railway
2. Add environment variables
3. Deploy

### Vercel (Frontend)
1. Deploy to Vercel
2. Update vercel.json with Railway URL

## License

MIT
