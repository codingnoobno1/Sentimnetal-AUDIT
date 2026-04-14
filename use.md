# Sentimnetal AUDIT - Usage Guide

This document provides instructions on how to interact with the model audit backend.

## 🚀 API Access

The backend is currently running and accessible at the following URLs:

- **Local Development**: `http://localhost:5000`
- **Public URL (ngrok)**: `https://untutelary-francisco-overtrustfully.ngrok-free.dev`

## 📚 API Documentation (Swagger)

FastAPI provides an interactive UI to test all endpoints:
- **Swagger UI**: [https://untutelary-francisco-overtrustfully.ngrok-free.dev/docs](https://untutelary-francisco-overtrustfully.ngrok-free.dev/docs)

---

## 🛠️ Endpoints

### 1. Run Model Audit
**Endpoint**: `POST /audit`

This endpoint compares a base model and a fine-tuned model across multiple sentiment categories.

**Request Body Example**:
```json
{
  "base_model_id": "cardiffnlp/twitter-roberta-base-sentiment",
  "ft_model_id": "distilbert-base-uncased-finetuned-sst-2-english",
  "dataset_description": "General sentiment analysis dataset"
}
```

### 2. Get Last Report
**Endpoint**: `GET /report`

Retrieves the results of the most recent audit run. Returns `available: false` if no audit has been run since the server started.

### 3. Health Check
**Endpoint**: `GET /health`

Returns a simple `{"status": "ok"}` to verify the server is alive.

---

## 🔑 Configuration (.env)

Ensure your `.env` file in the `backend/` directory has the following tokens:
- `HF_TOKEN`: Required for querying models on Hugging Face.
- `GROQ_API_KEY`: Required for generating AI-powered diagnostics for degraded model performance.

---

## 🧪 Quick Test (cURL)

You can run this in your terminal to test the API:

```bash
curl -X 'POST' \
  'https://untutelary-francisco-overtrustfully.ngrok-free.dev/audit' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "base_model_id": "cardiffnlp/twitter-roberta-base-sentiment",
  "ft_model_id": "distilbert-base-uncased-finetuned-sst-2-english",
  "dataset_description": "Test dataset"
}'
```
