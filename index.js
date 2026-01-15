// index.js
import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "*", // pozwala na połączenia z każdej domeny (na start)
  methods: ["POST"]
}));
app.use(express.json());

// Sprawdź, czy klucz jest ustawiony
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY nie ustawiony!");
  process.exit(1);
}

// Konfiguracja OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Endpoint POST /chat
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/", (req, res) => {
  res.send("GamModel Chatbot is running");
});

app.listen(port, () => {
  console.log(`Server działa na porcie ${port}`);
});
