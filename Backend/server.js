import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Test route to confirm server is working
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend is working fine!" });
});

// Chat route
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let aiResponse = completion.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
