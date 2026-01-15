const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Użycie portu podanego przez Railway lub 3000 lokalnie
const PORT = process.env.PORT || 3000;

// Inicjalizacja klienta OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint POST do chatu
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Brak wiadomości" });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
      temperature: 0.7
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Błąd GPT:", error);
    res.status(500).json({ error: "Błąd serwera GPT" });
  }
});

// Test endpoint
app.get('/', (req, res) => res.send('GPT Chatbot działa!'));

app.listen(PORT, () => console.log(`Server działa na porcie ${PORT}`));
