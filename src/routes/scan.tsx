import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { isAddress, parseUnits, type Address } from "viem";
import { toast } from "sonner";
import { useWallet } from "@/lib/wallet";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/networks";
import { scanContract, getMarketData } from "@/lib/scan.functions";
import { analyzeContract } from "@/lib/ai.functions";
import { recordScan } from "@/lib/deployments.functions";
import artifact from "@/contracts/RecovaSafeToken.artifact.json";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Contract Scanner & Asset Recovery — RECOVA" },
      {
        name: "description",
        content:
          "Scan any X Layer contract for trapped native and ERC-20 assets, get an AI recoverability analysis and execute owner-authorized recovery.",
      },
      { property: "og:title", content: "Contract Scanner & Asset Recovery — RECOVA" },
      {
        property: "og:description",
        content: "Read real X Layer contract state and recover trapped assets with your wallet.",
      },
    ],
  }),
  component: ScanPage,
});

type ScanResult = Awaited<ReturnType<typeof scanContract>>;
type Analysis = Record<string, string>;

function ScanPage() {
  const { address, network, publicClient, getWalletClient, wrongNetwork, switchNetwork } =
    useWallet();
  const runScan = useServerFn(scanContract);
  const runAnalyze = useServerFn(analyzeContract);
  const runMarket = useServerFn(getMarketData);
  const saveScan = useServerFn(recordScan);

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [market, setMarket] = useState<Awaited<ReturnType<typeof getMarketData>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

  async function handleScan() {
    if (!isAddress(query.trim())) {
      toast.error("Enter a valid contract address.");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    setMarket(null);
    try {
      const res = await runScan({ data: { address: query.trim(), network } });
      setResult(res);
      void saveScan({
        data: {
          contractAddress: res.address,
          network,
          result: res as unknown as Record<string, unknown>,
        },
      }).catch(() => undefined);
      void runMarket({ data: { address: res.address, chainId: res.chainId } })
        .then(setMarket)
        .catch(() => undefined);
      const a = await runAnalyze({
        data: {
          contractAddress: res.address,
          network,
          chainId: res.chainId,
          tokenName: res.token?.name ?? null,
          symbol: res.token?.symbol ?? null,
          owner: res.owner,
          creator: res.creator,
          nativeBalance: res.nativeBalanceFormatted,
          isRecovaContract: res.isRecovaContract,
          detectedFunctions: res.detectedFunctions,
          hasCode: res.hasCode,
        },
      });
      setAnalysis(a as Analysis);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const isOwner =
    !!address && !!result?.owner && address.toLowerCase() === result.owner.toLowerCase();

  async function recoverNative() {
    if (!result || !address) return;
    setRecovering(true);
    try {
      if (wrongNetwork) await switchNetwork(network);
      const wallet = getWalletClient();
      const hash = await wallet.writeContract({
        address: result.address as Address,
        abi: artifact.abi,
        functionName: "recoverAllNative",
        args: [address],
        account: address,
        chain: null,
      });
      toast.info("Recovery submitted");
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Native assets recovered");
      void handleScan();
    } catch (e) {
      toast.error((e as Error).message.split("\n")[0] ?? "Recovery failed");
    } finally {
      setRecovering(false);
    }
  }

  async function recoverToken(token: { address: string; balance: string; decimals: number }) {
    if (!result || !address) return;
    setRecovering(true);
    try {
      if (wrongNetwork) await switchNetwork(network);
      const wallet = getWalletClient();
      const hash = await wallet.writeContract({
        address: result.address as Address,
        abi: artifact.abi,
        functionName: "recoverERC20",
        args: [token.address as Address, address, parseUnits(token.balance, token.decimals)],
        account: address,
        chain: null,
      });
      toast.info("Recovery submitted");
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success(`Recovered ${token.balance}`);
      void handleScan();
    } catch (e) {
      toast.error((e as Error).message.split("\n")[0] ?? "Recovery failed");
    } finally {
      setRecovering(false);
    }
  }

  return (
    <main className="min-h-screen px-5 pt-32 pb-24">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Scanner</p>
        <h1 className="display-serif mt-3 text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.02] text-foreground">
          Find what is trapped
        </h1>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="0x… contract address"
            className="flex-1 rounded-full border border-input bg-transparent px-5 py-3.5 font-mono text-sm outline-none focus:border-ring"
          />
          <button
            type="button"
            onClick={handleScan}
            disabled={loading}
            className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Reading live state from X Layer {network}.
        </p>

        {result && (
          <>
            <section className="glass-panel mt-8 rounded-3xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-sm break-all text-foreground">{result.address}</p>
                <a
                  className="glass-pill rounded-full px-4 py-2 text-xs"
                  href={explorerAddressUrl(network, result.address)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explorer
                </a>
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Row label="Contract code" value={result.hasCode ? "Present" : "None (EOA)"} />
                <Row label="Token" value={result.token?.name ?? "Not an ERC-20"} />
                <Row label="Symbol" value={result.token?.symbol ?? "—"} />
                <Row label="Total supply" value={result.token?.totalSupply ?? "—"} />
                <Row label="Owner" value={result.owner ?? "No owner() function"} mono />
                <Row label="Native balance" value={`${result.nativeBalanceFormatted} OKB`} />
                <Row
                  label="RECOVA contract"
                  value={result.isRecovaContract ? "Verified bytecode match" : "No"}
                />
                <Row
                  label="Recovery functions"
                  value={result.detectedFunctions.join(", ") || "None detected"}
                />
                {market?.available && (
                  <>
                    <Row label="Price" value={market.price ?? "—"} />
                    <Row label="24h volume" value={market.volume24h ?? "—"} />
                  </>
                )}
              </dl>
            </section>

            {analysis && (
              <section className="glass-panel mt-5 rounded-3xl p-6">
                <p className="eyebrow">AI analysis</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {analysis["summary"]}
                </p>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Row label="Recovery status" value={analysis["recoveryStatus"] ?? "—"} />
                  <Row label="Reason" value={analysis["recoveryReason"] ?? "—"} />
                  <Row
                    label="Potential stuck value"
                    value={analysis["potentialStuckValue"] ?? "—"}
                  />
                  <Row label="Risk" value={analysis["risk"] ?? "—"} />
                  <Row label="Confidence" value={analysis["confidence"] ?? "—"} />
                </dl>
              </section>
            )}

            <section className="glass-panel mt-5 rounded-3xl p-6">
              <p className="eyebrow">Recovery</p>
              {!result.isRecovaContract ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  This contract does not match the RECOVA bytecode, so RECOVA cannot execute
                  recovery on it. Only the contract's own functions can move its assets.
                </p>
              ) : !address ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Connect the owner wallet to execute recovery.
                </p>
              ) : !isOwner ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Connected wallet is not the contract owner. Recovery calls will be rejected
                  on-chain.
                </p>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={recoverNative}
                    disabled={recovering || result.nativeBalance === "0"}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    Recover {result.nativeBalanceFormatted} OKB
                  </button>
                  {result.erc20.map((t) => (
                    <button
                      key={t.address}
                      type="button"
                      onClick={() => recoverToken(t)}
                      disabled={recovering}
                      className="glass-pill rounded-full px-6 py-3 text-sm disabled:opacity-50"
                    >
                      Recover {t.balance} {t.symbol}
                    </button>
                  ))}
                </div>
              )}
              {result.erc20.length > 0 && (
                <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
                  {result.erc20.map((t) => (
                    <li key={`bal-${t.address}`} className="font-mono break-all">
                      {t.symbol}: {t.balance} — {t.address}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className={`mt-1 text-sm break-all text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
