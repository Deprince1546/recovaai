import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { serverSupabase } from "./supabase-server";

export const recordDeployment = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        contractAddress: z.string(),
        txHash: z.string(),
        deployer: z.string(),
        network: z.string(),
        name: z.string(),
        symbol: z.string(),
        decimals: z.number(),
        supply: z.string(),
        description: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const supabase = serverSupabase();
    const { error } = await supabase.from("deployments").insert({
      contract_address: data.contractAddress,
      tx_hash: data.txHash,
      deployer: data.deployer,
      network: data.network,
      name: data.name,
      symbol: data.symbol,
      decimals: data.decimals,
      total_supply: data.supply,
      description: data.description ?? null,
      image_url: data.imageUrl ?? null,
    });
    if (error) return { saved: false as const, error: error.message };
    return { saved: true as const };
  });

export const listDeployments = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ network: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = serverSupabase();
    const { data: rows, error } = await supabase
      .from("deployments")
      .select("contract_address, name, symbol, network, created_at")
      .eq("network", data.network)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return { rows: [] as NonNullable<typeof rows> };
    return { rows: rows ?? [] };
  });

export const recordScan = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        contractAddress: z.string(),
        network: z.string(),
        result: z.record(z.string(), z.unknown()),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const supabase = serverSupabase();
    const { error } = await supabase.from("scans").insert({
      contract_address: data.contractAddress,
      network: data.network,
      result: data.result,
    });
    return { saved: !error };
  });
