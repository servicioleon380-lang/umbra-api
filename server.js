import express from "express";

const app = express();
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

let memoria = {};

app.post("/api", async (req, res) => {
  const pregunta = req.body.pregunta;
  const user = req.ip;

  if (!memoria[user]) memoria[user] = [];

  memoria[user].push({ role: "user", content: pregunta });

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Sos PROYECTO UMBRA.

Respondé como una persona real que conoce información sensible.
Explicá bien, natural, sin repetir respuestas.`
          },
          ...memoria[user]
        ]
      })
    });

    const data = await r.json();
    const texto = data.choices[0].message.content;

    memoria[user].push({ role: "assistant", content: texto });

    res.json({ respuesta: texto });

  } catch {
    res.json({ respuesta: "⚠️ Error en conexión con IA" });
  }
});

app.listen(3000);
