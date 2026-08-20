export type ChatResult = { text: string; provider: string };



export async function chat(system: string, user: string, json = true): Promise<ChatResult> {
  const openrouter = process.env["OPENROUTER_API_KEY"];
  const groq = process.env["GROQ_API_KEY"];
  const lovable = process.env["LOVABLE_API_KEY"];

  const attempts: Array<{ provider: string; url: string; key?: string; model: string }> = [];
  if (openrouter)
    attempts.push({
      provider: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: openrouter,
      model: "openai/gpt-4o-mini",
    });
  if (groq)
    attempts.push({
      provider: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: groq,
      model: "llama-3.3-70b-versatile",
    });
  if (lovable)
    attempts.push({
      provider: "lovable",
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      key: lovable,
      model: "google/gemini-2.5-flash",
    });

  let lastError = "No AI provider configured.";
  for (const a of attempts) {
    try {
      const res = await fetch(a.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${a.key}`,
        },
        body: JSON.stringify({
          model: a.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          ...(json ? { response_format: { type: "json_object" } } : {}),
        }),
      });
      if (!res.ok) {
        lastError = `${a.provider}: ${res.status} ${await res.text()}`;
        continue;
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content;
      if (text) return { text, provider: a.provider };
      lastError = `${a.provider}: empty response`;
    } catch (e) {
      lastError = `${a.provider}: ${(e as Error).message}`;
    }
  }
  throw new Error(lastError);
}

export function parseJson<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

