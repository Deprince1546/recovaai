import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address");
const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash");
const networkSchema = z.enum(["testnet", "mainnet"]);

export const recordDeployment = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        contractAddress: addressSchema,
        txHash: txHashSchema,
        deployer: addressSchema,
        network: networkSchema,
        name: z.string().min(1).max(64),
        symbol: z.string().min(1).max(16),
        decimals: z.number().int().min(0).max(36),
        supply: z.string().regex(/^\d{1,40}$/),
        description: z.string().max(1000).nullable().optional(),
        imageUrl: z.string().max(2_000_000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { enforceRateLimit } = await import("./rate-limit.server");
    await enforceRateLimit("recordDeployment", 30, 3600);

    const { clientFor } = await import("./scan.shared");
    const { NETWORKS } = await import("./networks");
    const artifact = (await import("@/contracts/RecovaSafeToken.artifact.json")).default;

    // Only accept records that are provably real on-chain deployments by this deployer.
    try {
      const client = clientFor(data.network);
      const receipt = await client.getTransactionReceipt({
        hash: data.txHash as `0x${string}`,
      });
      const sameDeployer = receipt.from.toLowerCase() === data.deployer.toLowerCase();
      const sameContract =
        (receipt.contractAddress ?? "").toLowerCase() === data.contractAddress.toLowerCase();
      if (receipt.status !== "success" || !sameDeployer || !sameContract) {
        return { saved: false as const, error: "Deployment could not be verified on-chain." };
      }
    } catch {
      return { saved: false as const, error: "Deployment could not be verified on-chain." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("deployments").insert({
      contract_address: data.contractAddress,
      transaction_hash: data.txHash,
      wallet_address: data.deployer,
      owner_address: data.deployer,
      network: data.network,
      chain_id: NETWORKS[data.network].id,
      token_name: data.name,
      token_symbol: data.symbol,
      decimals: data.decimals,
      supply: Number(data.supply),
      description: data.description ?? null,
      logo: data.imageUrl ?? null,
      source_code: artifact.sourceCode,
      source_hash: artifact.sourceHash,
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployed_bytecode: artifact.deployedBytecode,
      compiler_version: artifact.compilerVersion,
      openzeppelin_version: artifact.openZeppelinVersion,
      optimizer: artifact.optimizer,
      optimizer_runs: artifact.optimizerRuns,
    });
    if (error) {
      console.error("[deployments] insert failed", error);
      return { saved: false as const, error: "Could not save the deployment record." };
    }
    return { saved: true as const };
  });

export const listDeployments = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ network: networkSchema }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Public listing intentionally excludes wallet/owner addresses.
    const { data: rows, error } = await supabaseAdmin
      .from("deployments")
      .select("contract_address, token_name, token_symbol, network, created_at")
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
        contractAddress: addressSchema,
        network: networkSchema,
        result: z.record(z.string(), z.unknown()),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { enforceRateLimit } = await import("./rate-limit.server");
    await enforceRateLimit("recordScan", 120, 3600);

    const { NETWORKS } = await import("./networks");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("scans").insert({
      contract_address: data.contractAddress,
      network: data.network,
      chain_id: NETWORKS[data.network].id,
      result: data.result as never,
    });
    if (error) console.error("[scans] insert failed", error);
    return { saved: !error };
  });
