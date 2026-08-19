import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type ChatResult = { text: string; provider: string };

async function chat(system: string, user: string, json = true): Promise<ChatResult> {
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

function parseJson<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

export const generateTokenIdea = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ hint: z.string().max(400).optional() }).parse(data))
  .handler(async ({ data }) => {
    const { text, provider } = await chat(
      "You invent ERC-20 token concepts for the X Layer blockchain. Reply with strict JSON only: {\"name\":string,\"symbol\":string,\"description\":string,\"imagePrompt\":string}. Symbol is 3-5 uppercase letters. Description is max 240 characters.",
      `Create one original token concept${data.hint ? ` about: ${data.hint}` : ""}.`,
    );
    const idea = parseJson<{
      name: string;
      symbol: string;
      description: string;
      imagePrompt: string;
    }>(text);
    return {
      ...idea,
      symbol: idea.symbol.toUpperCase().slice(0, 6),
      supply: 1_000_000_000,
      decimals: 18,
      provider,
    };
  });

export const generateTokenLogo = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ prompt: z.string().min(3).max(400) }).parse(data))
  .handler(async ({ data }) => {
    const key = process.env["POLLINATION_API_KEY"];
    const prompt = `Minimal circular crypto token logo, ${data.prompt}, flat vector, high contrast, black background`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&model=flux`;
    const headers: Record<string, string> = {};
    if (key) headers["Authorization"] = `Bearer ${key}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Image generation failed (${res.status}).`);
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength < 1000) throw new Error("Image generation returned an empty image.");
    let binary = "";
    for (let i = 0; i < buf.length; i += 8192) {
      binary += String.fromCharCode(...buf.subarray(i, i + 8192));
    }
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    return { dataUrl: `data:${contentType};base64,${btoa(binary)}`, provider: "pollination" };
  });

const analysisInput = z.object({
  contractAddress: z.string(),
  network: z.string(),
  chainId: z.number(),
  tokenName: z.string().nullable(),
  symbol: z.string().nullable(),
  owner: z.string().nullable(),
  creator: z.string().nullable(),
  nativeBalance: z.string(),
  isRecovaContract: z.boolean(),
  detectedFunctions: z.array(z.string()),
  hasCode: z.boolean(),
});

export const analyzeContract = createServerFn({ method: "POST" })
  .inputValidator((data) => analysisInput.parse(data))
  .handler(async ({ data }) => {
    const { text, provider } = await chat(
      'You are a blockchain contract analyst. Only reason about the verified on-chain facts supplied. Never invent balances, addresses, prices or links. Reply with strict JSON only: {"summary":string,"recoveryStatus":string,"recoveryReason":string,"potentialStuckValue":string,"risk":string,"confidence":string}.',
      JSON.stringify(data),
    );
    return { ...parseJson<Record<string, string>>(text), provider };
  });

export const researchProject = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ query: z.string().min(2).max(120), address: z.string() }).parse(d),
  )
  .handler(async ({ data }) => {
    const firecrawl = process.env["FIRECRAWL_API_KEY"];
    if (!firecrawl) return { available: false as const, results: [] };
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firecrawl}`,
        },
        body: JSON.stringify({ query: `${data.query} ${data.address} X Layer token`, limit: 5 }),
      });
      if (!res.ok) return { available: false as const, results: [] };
      const json = (await res.json()) as {
        data?: Array<{ url?: string; title?: string; description?: string }>;
      };
      return {
        available: true as const,
        results: (json.data ?? []).map((r) => ({
          url: r.url ?? "",
          title: r.title ?? "",
          description: r.description ?? "",
        })),
      };
    } catch {
      return { available: false as const, results: [] };
    }
  });
