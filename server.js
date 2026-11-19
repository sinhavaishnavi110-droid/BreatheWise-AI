import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Request logger
app.use((req, res, next) => {
  console.log("Request received:", req.method, req.url, req.headers.origin);
  next();
});

// CORS configuration
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://10.201.141.200:5500"
  ]
}));

app.use(express.json({ limit: "10kb" }));

// Gemini AI configuration
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Backend health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "BreatheWise backend is running",
    aiConfigured: Boolean(ai)
  });
});

// Chat API
app.post("/api/chat", async (req, res) => {
  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

  if (!message || message.length > 1000) {
    return res.status(400).json({
      error: "Enter a message under 1000 characters."
    });
  }

  if (!ai) {
    return res.status(503).json({
      error: "AI API key is not configured."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
You are BreatheWise AI, an urban air quality assistant.

Explain air pollution in simple language.
Give practical, cautious suggestions.
Never invent live AQI readings.
Do not diagnose medical conditions.

User question: ${message}
`
    });

    res.json({
      reply: response.text || "I could not generate an answer."
    });

  } catch (error) {
    console.log("Gemini unavailable. Using backup assistant.");

    const question = message.toLowerCase();

    let reply = "I'm BreatheWise AI. Ask me about AQI, air pollution, PM2.5, PM10, or ways to protect yourself.";

    if (question.includes("aqi")) {
      reply = "AQI stands for Air Quality Index. It tells us how clean or polluted the air is. A higher AQI means poorer air quality.";
    }
    else if (question.includes("pm2.5")) {
      reply = "PM2.5 refers to tiny particles in the air that can travel deep into the lungs.";
    }
    else if (question.includes("pm10")) {
      reply = "PM10 refers to airborne particles such as dust and pollen.";
    }
    else if (question.includes("pollution")) {
      reply = "Air pollution comes from vehicles, industries, construction dust, and burning waste. Cleaner transport and avoiding waste burning can help.";
    }
    else if (question.includes("protect")) {
      reply = "Check your local AQI before outdoor activities. When pollution is high, reduce prolonged outdoor exposure.";
    }

    res.json({
      reply: reply,
      source: "BreatheWise Backup Assistant"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`BreatheWise backend running on port ${PORT}`);
});
