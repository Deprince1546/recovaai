import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { formatUnits, getAddress, isAddress, type Address } from "viem";
import { NETWORKS, type NetworkKey } from "./networks";
import { RECOVERY_SELECTORS, TRANSFER_TOPIC, clientFor, erc20Abi } from "./scan.shared";
import artifact from "@/contracts/RecovaSafeToken.artifact.json";

export const scanContract = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        address: z.string().refine((a) => isAddress(a, { strict: false }), "Invalid address"),
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
    const { marketData } = await import("./market.server");
    return marketData(data.address, data.chainId);
  });

