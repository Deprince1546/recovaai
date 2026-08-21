export type MarketData =
  | { available: false }
  | {
      available: true;
      source: "okx" | "dexscreener";
      price: string | null;
      marketCap: string | null;
      volume24h: string | null;
      priceChange24h: string | null;
    };

async function hmacBase64(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

/** OKX Onchain (DEX) price info. Requires key + secret + passphrase + project id. */
export async function okxMarketData(address: string, chainId: number): Promise<MarketData> {
  const apiKey = process.env["OKX_API_KEY"];
  const secret = process.env["OKX_SECRET_KEY"];
  const passphrase = process.env["OKX_PASSPHRASE"];
  const projectId = process.env["OKX_PROJECT_ID"];
  if (!apiKey || !secret || !passphrase || !projectId) return { available: false };

  const path = "/api/v5/dex/market/price-info";
  const body = JSON.stringify([
    { chainIndex: String(chainId), tokenContractAddress: address.toLowerCase() },
  ]);
  const timestamp = new Date().toISOString();
  const sign = await hmacBase64(secret, `${timestamp}POST${path}${body}`);

  try {
    const res = await fetch(`https://web3.okx.com${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OK-ACCESS-KEY": apiKey,
        "OK-ACCESS-SIGN": sign,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": passphrase,
        "OK-ACCESS-PROJECT": projectId,
      },
      body,
    });
    if (!res.ok) return { available: false };
    const json = (await res.json()) as { data?: unknown[] };
    const row = (json.data?.[0] ?? null) as null | Record<string, string>;
    if (!row || !row["price"]) return { available: false };
    return {
      available: true,
      source: "okx",
      price: row["price"] ?? null,
      marketCap: row["marketCap"] ?? null,
      volume24h: row["volume24H"] ?? null,
      priceChange24h: row["priceChange24H"] ?? null,
    };
  } catch {
    return { available: false };
  }
}

/** Public Dexscreener fallback — no credentials required. */
export async function dexscreenerMarketData(address: string): Promise<MarketData> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    if (!res.ok) return { available: false };
    const json = (await res.json()) as {
      pairs?: Array<{
        priceUsd?: string;
        fdv?: number;
        marketCap?: number;
        volume?: { h24?: number };
        priceChange?: { h24?: number };
        liquidity?: { usd?: number };
      }>;
    };
    const pairs = json.pairs ?? [];
    if (!pairs.length) return { available: false };
    const best = pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0]!;
    return {
      available: true,
      source: "dexscreener",
      price: best.priceUsd ?? null,
      marketCap: (best.marketCap ?? best.fdv)?.toString() ?? null,
      volume24h: best.volume?.h24?.toString() ?? null,
      priceChange24h: best.priceChange?.h24?.toString() ?? null,
    };
  } catch {
    return { available: false };
  }
}

export async function marketData(address: string, chainId: number): Promise<MarketData> {
  const okx = await okxMarketData(address, chainId);
  if (okx.available) return okx;
  return dexscreenerMarketData(address);
}
