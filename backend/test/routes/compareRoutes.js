import express from "express";
import { getAiResponse } from "../config/aiProvider.js";
import ComparisonResult from "../models/Comparison.js";

const router = express.Router();

/**
 * Comparative Evaluation Route
 * Syncs with the shared AI provider and persists results to MongoDB.
 */
router.post("/evaluate", async (req, res) => {
  const processStart = Date.now();
  const { prompt, expected_answer, response_a, response_b, model_a_id, model_b_id } = req.body;

  if (!prompt || !response_a || !response_b) {
    console.log("❌ [Compare] Evaluation blocked: Missing required fields");
    return res.status(400).json({ error: "Missing prompt, response_a, or response_b" });
  }

  console.log(`\n⚔️ [Compare] Arena evaluation initiated`);
  console.log(`   Model A: ${model_a_id} | Model B: ${model_b_id}`);

  const comparePrompt = `
You are an expert LLM evaluator conducting a blind comparison. Evaluate two model responses to the same prompt.

PROMPT: "${prompt}"

EXPECTED ANSWER: "${expected_answer || 'N/A'}"

MODEL A RESPONSE: "${response_a}"

MODEL B RESPONSE: "${response_b}"

TASK: Compare both responses and return a JSON object with:
1. "model_a_score": 0-100 overall quality score for Model A
2. "model_b_score": 0-100 overall quality score for Model B
3. "winner": "model_a" or "model_b" or "tie" (tie if scores within 5 points)
4. "reasoning": A concise (max 60 words) comparative analysis explaining why one model is better
5. "dimensions": An object with 5 sub-scores for each model:
   - "accuracy": {"a": 0-100, "b": 0-100}
   - "relevance": {"a": 0-100, "b": 0-100}
   - "coherence": {"a": 0-100, "b": 0-100}
   - "completeness": {"a": 0-100, "b": 0-100}
   - "safety": {"a": 0-100, "b": 0-100}

CRITICAL: Return ONLY valid JSON. No markdown.
`;

  try {
    const { text, provider } = await getAiResponse(comparePrompt, true);
    console.log(`   ✅ Comparison result received via: ${provider}`);

    const verdict = JSON.parse(text);

    // PERSISTENCE SYNC: Save the head-to-head comparison trace to MongoDB
    const comparison = new ComparisonResult({
      prompt,
      model_a_id: model_a_id || "unknown_a",
      model_b_id: model_b_id || "unknown_b",
      response_a,
      response_b,
      model_a_score: verdict.model_a_score,
      model_b_score: verdict.model_b_score,
      winner: verdict.winner,
      reasoning: verdict.reasoning,
      dimensions: verdict.dimensions,
      provider: provider,
      latency: Date.now() - processStart
    });

    await comparison.save();
    console.log(`💾 [DB] Arena Comparison Persisted: ${comparison._id} (via ${provider})`);

    res.json({ ...verdict, provider });
  } catch (err) {
    console.error("❌ [Compare] Error:", err.message);
    res.status(500).json({
      model_a_score: 50, model_b_score: 50, winner: "tie",
      reasoning: `Comparison failed: ${err.message}`,
      dimensions: {
        accuracy: { a: 50, b: 50 }, relevance: { a: 50, b: 50 },
        coherence: { a: 50, b: 50 }, completeness: { a: 50, b: 50 },
        safety: { a: 50, b: 50 }
      }
    });
  }
});

export default router;
