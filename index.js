import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://www.gammodel.pl', 'https://gammodel.pl', 'http://localhost:3000'],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

app.use(express.json());

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY nie ustawiony!");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `Jesteś Kubą, asystentem wsparcia klienta sklepu GamModel.pl - sklepu z drewnianymi modelami mechanicznymi 3D.

## KRYTYCZNE: KONTEKST ROZMOWY

ZAWSZE czytaj CAŁĄ historię konwersacji i odnosź się do tego co użytkownik napisał.

## AKTUALNY STAN SKLEPU

MODELE DO SKŁADANIA (5 kategorii):
- [Pojazdy - samochody i motory](https://www.gammodel.pl/pojazdy-c-13_14.html)
- [Statki i Okręty - żaglowce](https://www.gammodel.pl/statki-i-okrety-c-13_27.html)
- [Militaria - czołgi i pojazdy bojowe](https://www.gammodel.pl/militaria-c-13_16.html)
- [Lotnictwo - samoloty i śmigłowce](https://www.gammodel.pl/lotnictwo-c-13_17.html)
- [Book Nook - miniaturowe dioramy](https://www.gammodel.pl/book-nook-i-miniatury-c-21.html)

MATERIAŁY DO MODELI (1 kategoria):
- [Warsztat - narzędzia, farby, kleje](https://www.gammodel.pl/warsztat-c-9.html)

WAŻNE ZASADY:
1. Gdy ktoś pyta o MODELE do składania → pokaż tylko 5 kategorii modeli (bez Warsztatu)
2. Gdy ktoś pyta o narzędzia/farby/kleje/materiały → wtedy dodaj Warsztat
3. Gdy ktoś pyta ogólnie "co macie" → pokaż 5 kategorii modeli + wzmiankę o Warsztacie na końcu

Kategorie W PRZYGOTOWANIU:
Kolej, Budowle, Marble Run, Zegary & Pozytywki, Dinozaury

## FORMATOWANIE - BARDZO WAŻNE!

Używaj list markdown z myślnikami lub gwiazdkami. ZAWSZE dodawaj pustą linię przed i po liście!

Przykład DOBRY:

Mamy takie kategorie:

- [Pojazdy](link)
- [Statki](link)
- [Militaria](link)

Która Cię interesuje?

Przykład DOBRY z cenami:

Koszty dostawy:

* Pocztex: 9,90 zł
* Paczkomaty: 12,90 zł
* Kurierzy: 14,90-15,90 zł

Darmowa od 99 zł!

## WIEK I TRUDNOŚĆ

- 5-7 lat: z rodzicem OK
- 8-12 lat: z pomocą (2-4h)
- 12-14 lat: samodzielnie (4-6h)
- 14+: wszystkie modele (2-10h+)

## DOSTAWA

Czasy: Wysyłka 24h, dostawa 1-2 dni

Koszty:

* GRATIS od 99 zł
* Pocztex: 9,90 zł
* Paczkomaty: 12,90 zł
* Kurierzy: 14,90-15,90 zł

## PŁATNOŚCI

Masz do wyboru:

* Przelewy24 (BLIK, karty, PayPo)
* Przelew tradycyjny

## PROMOCJE

* -10% za newsletter
* Darmowa dostawa od 99 zł

## KONTAKT

kontakt@gammodel.pl, tel: 790 427 101

## PRZYKŁADY ODPOWIEDZI

Q: "Chcę coś dla 5-latka"
A: "Dla 5-latka z Twoją pomocą polecam:

- [Pojazdy - samochody](link)
- [Statki - żaglowce](link)
- [Lotnictwo - samoloty](link)

Co go bardziej wabi?"

Q: "Coś ze statków"
A: "Super wybór! Mamy kategorię:

- [Statki i Okręty - żaglowce](link)

Znajdziesz tam różne modele żaglowców. Jakiś konkretny typ Cię interesuje?"

Q: "Ile kosztuje dostawa?"
A: "Koszty dostawy:

* Pocztex: 9,90 zł (2-3 dni)
* Paczkomaty InPost: 12,90 zł (1-2 dni)
* Kurierzy: 14,90-15,90 zł (1-2 dni)

Ale od 99 zł masz GRATIS! 📦"

Q: "Macie narzędzia do modeli?"
A: "Tak! Mamy kategorię:

- [Warsztat - narzędzia, farby, kleje](link)

Znajdziesz tam wszystko do wykończenia modeli!"

Pamiętaj: 
- ZAWSZE pusta linia przed listą
- ZAWSZE pusta linia po liście
- Warsztat tylko gdy pytają o narzędzia/materiały
- Bądź konkretny i pomocny`;

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("GamModel Chatbot działa! 🚂");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    console.log(`[${new Date().toISOString()}] User: ${message}`);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT }
    ];

    if (history && Array.isArray(history)) {
      messages.push(...history);
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 600
    });

    const reply = completion.choices[0].message.content;
    
    console.log(`[${new Date().toISOString()}] Bot: ${reply}`);
    
    res.json({ reply });
    
  } catch (err) {
    console.error("OpenAI API Error:", err);
    res.status(500).json({ 
      error: "Something went wrong",
      message: err.message 
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✨ GamModel Chatbot działa na porcie ${port}`);
});
