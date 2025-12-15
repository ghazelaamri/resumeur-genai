import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.API_KEY;
console.log("🔑 API KEY:", API_KEY ? "OK" : "MISSING");

app.use(express.static(path.join(__dirname, "public")));

app.post("/api/summarize", async (req, res) => {
  try {
    const { text, length } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Texte requis" });
    }

    let instruction =
      "Résume le texte suivant en français en conservant les idées principales.";
    if (length === "short") instruction += " 1 à 2 phrases.";
    if (length === "medium") instruction += " 3 à 4 phrases.";
    if (length === "long") instruction += " 6 à 8 phrases.";

    const prompt = `${instruction}\n\n${text}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const raw = await response.text();
    console.log("🟡 RAW RESPONSE:", raw);

    if (!response.ok) {
      return res.status(500).json({ error: "Erreur API OpenAI" });
    }

    const data = JSON.parse(raw);

    // ✅ extraction SAFE du texte
    let summary = "";

    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.content) {
          for (const c of item.content) {
            if (c.type === "output_text") {
              summary += c.text;
            }
          }
        }
      }
    }

    if (!summary) {
      summary = "Résumé non généré (réponse vide)";
    }

    res.json({ summary });

  } catch (err) {
    console.error("❌ ERREUR SERVEUR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
