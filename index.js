import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("GamModel chatbot API działa");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Jesteś pomocnym doradcą sklepu GamModel. Odpowiadasz krótko i po polsku."
        },
        { role: "user", content: message }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });
  } catch (e) {
    res.status(500).json({ error: "Błąd API" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server działa");
});
