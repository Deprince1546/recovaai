import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createPublicClient,
  formatUnits,
  getAddress,
  http,
  isAddress,
  parseAbi,
  type Address,
} from "viem";
import { NETWORKS, type NetworkKey } from "./networks";
import artifact from "@/contracts/RecovaSafeToken.artifact.json";

const erc20Abi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function owner() view returns (address)",
]);

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" as const;

// Function selectors that indicate a possible withdrawal/recovery mechanism.
const RECOVERY_SELECTORS: Record<string, string> = {
  "0x": "",
  ce6ed23a: "recoverNative(address,uint256)",
  "8f5e51ca": "recoverAllNative(address)",
  "9b1b4c4a": "recoverERC20(address,address,uint256)",
  "3ccfd60b": "withdraw()",
  "51cff8d9": "withdraw(address)",
  db2e21bc: "emergencyWithdraw()",
  "01681a62": "sweep(address)",
};

function clientFor(network: NetworkKey) {
  const chain = NETWORKS[network];
  return createPublicClient({ chain, transport: http(chain.rpcUrls.default.http[0]) });
}

export const scanContract = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        address: z.string().refine((a) => isAddress(a), "Invalid contract address"),
        network: z.enum(["testnet", "mainnet"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const network = data.network as NetworkKey;
    const chain = NETWORKS[network];
    const client = clientFor(network);
    const address = getAddress(data.address) as Address;

    const [bytecode, nativeBalance] = await Promise.all([
      client.getCode({ address }),
      client.getBalance({ address }),
    ]);

    const hasCode = Boolean(bytecode && bytecode !== "0x");
    if (!hasCode) {
      return {
        address,
        network,
        chainId: chain.id,
        hasCode: false,
        token: null,
        owner: null,
        creator: null,
        nativeBalance: "0",
        nativeBalanceFormatted: formatUnits(nativeBalance, 18),
        erc20: [] as Array<{ address: string; symbol: string; balance: string; decimals: number }>,
        detectedFunctions: [] as string[],
        isRecovaContract: false,
        recoveryMechanism: false,
        artifactHash: artifact.sourceHash,
      };
    }

    const runtime = artifact.deployedBytecode.toLowerCase();
    const isRecovaContract = Boolean(bytecode && bytecode.toLowerCase() === runtime);

    const detectedFunctions = Object.entries(RECOVERY_SELECTORS)
      .filter(([sel, sig]) => sig && bytecode!.toLowerCase().includes(sel))
      .map(([, sig]) => sig);

    const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
      client.readContract({ address, abi: erc20Abi, functionName: "name" }).catch(() => null),
      client.readContract({ address, abi: erc20Abi, functionName: "symbol" }).catch(() => null),
      client.readContract({ address, abi: erc20Abi, functionName: "decimals" }).catch(() => null),
      client.readContract({ address, abi: erc20Abi, functionName: "totalSupply" }).catch(() => null),
      client.readContract({ address, abi: erc20Abi, functionName: "owner" }).catch(() => null),
    ]);

    // Discover ERC-20 assets that were transferred INTO this contract.
    let erc20: Array<{ address: string; symbol: string; balance: string; decimals: number }> = [];
    try {
      const latest = await client.getBlockNumber();
      const fromBlock = latest > 40000n ? latest - 40000n : 0n;
      const rawLogs = (await client.request({
        method: "eth_getLogs",
        params: [
          {
            fromBlock: `0x${fromBlock.toString(16)}`,
            toBlock: `0x${latest.toString(16)}`,
            topics: [
              TRANSFER_TOPIC,
              null,
              `0x${address.slice(2).toLowerCase().padStart(64, "0")}`,
            ],
          },
        ],
      } as never)) as Array<{ address: string }>;
      const logs = rawLogs ?? [];
      const tokens = [...new Set(logs.map((l) => getAddress(l.address)))]
        .filter((t) => t !== address)
        .slice(0, 12);
      const balances = await Promise.all(
        tokens.map(async (token) => {
          try {
            const [bal, sym, dec] = await Promise.all([
              client.readContract({
                address: token,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [address],
              }),
              client
                .readContract({ address: token, abi: erc20Abi, functionName: "symbol" })
                .catch(() => "?"),
              client
                .readContract({ address: token, abi: erc20Abi, functionName: "decimals" })
                .catch(() => 18),
            ]);
            if (bal === 0n) return null;
            return {
              address: token as string,
              symbol: sym as string,
              decimals: Number(dec),
              balance: formatUnits(bal as bigint, Number(dec)),
            };
          } catch {
            return null;
          }
        }),
      );
      erc20 = balances.filter(Boolean) as typeof erc20;
    } catch {
      erc20 = [];
    }

    return {
      address,
      network,
      chainId: chain.id,
      hasCode: true,
      token:
        name || symbol
          ? {
              name: (name as string) ?? null,
              symbol: (symbol as string) ?? null,
              decimals: decimals != null ? Number(decimals) : null,
              totalSupply:
                totalSupply != null && decimals != null
                  ? formatUnits(totalSupply as bigint, Number(decimals))
                  : null,
            }
          : null,
      owner: (owner as string) ?? null,
      creator: null as string | null,
      nativeBalance: nativeBalance.toString(),
      nativeBalanceFormatted: formatUnits(nativeBalance, 18),
      erc20,
      detectedFunctions,
      isRecovaContract,
      recoveryMechanism: isRecovaContract || detectedFunctions.length > 0,
      artifactHash: artifact.sourceHash,
    };
  });

export const getMarketData = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ address: z.string(), chainId: z.number() }).parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["OKX_API_KEY"];
    const secret = process.env["OKX_SECRET_KEY"];
    const passphrase = process.env["OKX_PASSPHRASE"];
    if (!apiKey || !secret || !passphrase) return { available: false as const };

    const path = `/api/v5/dex/market/price-info`;
    const body = JSON.stringify([
      { chainIndex: String(data.chainId), tokenContractAddress: data.address.toLowerCase() },
    ]);
    const timestamp = new Date().toISOString();
    const prehash = `${timestamp}POST${path}${body}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(prehash));
    const sign = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));

    try {
      const res = await fetch(`https://web3.okx.com${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "OK-ACCESS-KEY": apiKey,
          "OK-ACCESS-SIGN": sign,
          "OK-ACCESS-TIMESTAMP": timestamp,
          "OK-ACCESS-PASSPHRASE": passphrase,
        },
        body,
      });
      if (!res.ok) return { available: false as const };
      const json = (await res.json()) as { code?: string; data?: unknown[] };
      const row = (json.data?.[0] ?? null) as null | Record<string, string>;
      if (!row) return { available: false as const };
      return {
        available: true as const,
        price: row["price"] ?? null,
        marketCap: row["marketCap"] ?? null,
        volume24h: row["volume24H"] ?? null,
        priceChange24h: row["priceChange24H"] ?? null,
      };
    } catch {
      return { available: false as const };
    }
  });
