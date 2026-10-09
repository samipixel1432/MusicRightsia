# MusicRights AI

Agente de IA que asesora a Sony Music y Warner Music sobre propiedad intelectual, ética y riesgos de la IA generativa musical (Suno, Udio).

- `PROMPT.md` — prompt completo del agente (rol, tarea, restricciones, formato).
- `index.html` — página de chat del agente. Responde en tres formatos: análisis completo, tabla comparativa o exposición de 3 minutos.

- `api/chat.js` — función de Vercel que llama a la API de Claude con el prompt del agente.

## Publicar en Vercel

1. En vercel.com → **Add New → Project**, importa este repositorio (sin framework, sin build).
2. En **Settings → Environment Variables** añade `ANTHROPIC_API_KEY` con tu clave de console.anthropic.com.
3. Redespliega. Opcional: `ANTHROPIC_MODEL` para cambiar el modelo (por defecto `claude-sonnet-5-5`).

Dentro de claude.ai la página usa la cuenta de Claude del visitante; en Vercel usa la clave de la API (cada consulta tiene coste).
