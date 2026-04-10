import fetch from "node-fetch";

/**
 * Shared AI Provider Utility
 * Handles Gemini primary call with Mistral as automatic fallback.
 */

// Gemini Call
async function callGemini(prompt, isJson = true) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
  
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: isJson ? { response_mime_type: "application/json" } : {}
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini Error: ${response.status} - ${JSON.stringify(data).substring(0, 100)}`);
  }

  return data.candidates[0].content.parts[0].text;
}

// Mistral Call
async function callMistral(prompt, isJson = true) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY missing");

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: isJson ? "You are a JSON-only forensic AI auditor. Always respond with valid JSON." : "You are a helpful AI assistant." },
        { role: "user", content: prompt }
      ],
      response_format: isJson ? { type: "json_object" } : { type: "text" }
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Mistral Error: ${response.status} - ${JSON.stringify(data).substring(0, 100)}`);
  }

  return data.choices[0].message.content;
}

/**
 * Smart AI Call with fallback
 */
export async function getAiResponse(prompt, isJson = true) {
  // Try Gemini First
  try {
    console.log(`   🌐 [AI Provider] Attempting Gemini...`);
    const text = await callGemini(prompt, isJson);
    return { text, provider: "Gemini" };
  } catch (err) {
    console.log(`   ⚠️ [AI Provider] Gemini failed (${err.message}). Trying Mistral...`);
    // Fallback to Mistral
    try {
      const text = await callMistral(prompt, isJson);
      return { text, provider: "Mistral" };
    } catch (mistralErr) {
      console.error(`   ❌ [AI Provider] All providers failed.`);
      throw new Error(`AI Providers failed: Gemini(${err.message}), Mistral(${mistralErr.message})`);
    }
  }
}
