import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!message || message.length > 1000) {
    return res.status(400).json({
      error: "Enter a message under 1000 characters."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  try {
    if (!ai) {
      throw new Error("AI API key not configured");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are BreatheWise AI, an urban air quality assistant.

Explain air pollution in simple language.
Give practical, cautious suggestions.
Never invent live AQI readings.
Do not diagnose medical conditions.

User question: ${message}
`
    });

    return res.status(200).json({
      reply: response.text || "I could not generate an answer."
    });
  } catch (error) {
    console.log("Gemini unavailable. Using backup assistant:", error.message);

    const question = message.toLowerCase();
    let reply =
      "I'm BreatheWise AI. Ask me about AQI, air pollution, PM2.5, PM10, or ways to protect yourself.";

    if (question.includes("aqi")) {
      reply =
        "AQI stands for Air Quality Index. It tells us how clean or polluted the air is. A higher AQI means poorer air quality.";
    } else if (question.includes("pm2.5")) {
      reply =
        "PM2.5 refers to tiny particles in the air that can travel deep into the lungs.";
    } else if (question.includes("pm10")) {
      reply = "PM10 refers to airborne particles such as dust and pollen.";
    } else if (question.includes("pollution")) {
      reply =
        "Air pollution comes from vehicles, industries, construction dust, and burning waste. Cleaner transport and avoiding waste burning can help.";
    } else if (question.includes("protect")) {
      reply =
        "Check your local AQI before outdoor activities. When pollution is high, reduce prolonged outdoor exposure.";
    }

    return res.status(200).json({
      reply: reply,
      source: "BreatheWise Backup Assistant"
    });
  }
}
