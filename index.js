import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]  // Dodaj GET dla healthchecku
}));
app.use(express.json());

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY nie ustawiony!");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Healthcheck
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Homepage
app.get("/", (req, res) => {
  res.send("GamModel Chatbot działa!");
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// WAŻNE: 0.0.0.0 dla Railway
app.listen(port, "0.0.0.0", () => {
  console.log(`Server działa na porcie ${port}`);
});
