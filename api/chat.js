// Función serverless de Vercel: reenvía la conversación a la API de Claude
// con el prompt del agente MusicRights AI. Requiere la variable de entorno ANTHROPIC_API_KEY.
const RULES = require("./_rules.js");

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MAX_TURNS = 10;
const MAX_CHARS = 8000;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "missing_api_key" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  let messages = Array.isArray(body?.messages) ? body.messages : [];
  messages = messages
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "invalid_request" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 4000, system: RULES, messages }),
    });
    const data = await r.json();
    if (!r.ok) {
      const code = r.status === 429 ? "rate_limited" : "upstream_error";
      return res.status(r.status === 429 ? 429 : 502).json({ error: code, detail: data?.error?.message });
    }
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    return res.status(200).json({ text, truncated: data.stop_reason === "max_tokens" });
  } catch (e) {
    return res.status(502).json({ error: "upstream_error" });
  }
};
