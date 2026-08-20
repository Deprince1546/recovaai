export type ChatResult = { text: string; provider: string };

/**
 * RECOVA AI reasoning runs on OpenRouter only.
 * No Lovable AI, no Groq fallback for reasoning — a missing/failing OpenRouter
 * configuration surfaces as a clear server error.
 */
export async function chat(system: string, user: string, json = true): Promise<ChatResult> {
  const openrouter = process.env["OPENROUTER_API_KEY"];
  if (!openrouter) {
    throw new Error("RECOVA AI is not configured: OPENROUTER_API_KEY is missing on the server.");
  }

  const model = process.env["OPENROUTER_MODEL"] ?? "openai/gpt-4o-mini";
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openrouter}`,
      "X-Title": "RECOVA",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`RECOVA AI (OpenRouter) failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("RECOVA AI (OpenRouter) returned an empty response.");
  return { text, provider: "openrouter" };
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
