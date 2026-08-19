import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { parseUnits, type Address } from "viem";
import { toast } from "sonner";
import { useWallet } from "@/lib/wallet";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/networks";
import { generateTokenIdea, generateTokenLogo } from "@/lib/ai.functions";
import { recordDeployment } from "@/lib/deployments.functions";
import artifact from "@/contracts/RecovaSafeToken.artifact.json";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a Recoverable Token — RECOVA" },
      {
        name: "description",
        content:
          "Deploy the compiled RecovaSafeToken ERC-20 contract to X Layer with AI-assisted naming and built-in asset recovery.",
      },
      { property: "og:title", content: "Create a Recoverable Token — RECOVA" },
      {
        property: "og:description",
        content: "Deploy a recoverable ERC-20 contract to X Layer directly from your wallet.",
      },
    ],
  }),
  component: CreatePage,
});

type Deployed = { address: string; hash: string };

function CreatePage() {
  const { address, network, connect, getWalletClient, publicClient, wrongNetwork, switchNetwork } =
    useWallet();
  const idea = useServerFn(generateTokenIdea);
  const logo = useServerFn(generateTokenLogo);
  const record = useServerFn(recordDeployment);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("1000000000");
  const [decimals, setDecimals] = useState("18");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState<"idea" | "logo" | "deploy" | null>(null);
  const [deployed, setDeployed] = useState<Deployed | null>(null);

  async function handleIdea() {
    setBusy("idea");
    try {
      const res = await idea({ data: { hint: hint || undefined } });
      setName(res.name);
      setSymbol(res.symbol);
      setDescription(res.description);
      setSupply(String(res.supply));
      toast.success(`Concept generated via ${res.provider}`);
      setBusy("logo");
      const img = await logo({ data: { prompt: res.imagePrompt } });
      setImageUrl(img.dataUrl);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function handleDeploy() {
    if (!address) {
      toast.error("Connect a wallet first.");
      return;
    }
    if (!name.trim() || !symbol.trim()) {
      toast.error("Name and symbol are required.");
      return;
    }
    setBusy("deploy");
    try {
      if (wrongNetwork) await switchNetwork(network);
      const wallet = getWalletClient();
      const dec = Number(decimals);
      const hash = await wallet.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode as `0x${string}`,
        account: address,
        chain: null,
        args: [name.trim(), symbol.trim().toUpperCase(), dec, parseUnits(supply || "0", dec), address],
      });
      toast.info("Transaction submitted — waiting for confirmation");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (!receipt.contractAddress) throw new Error("Deployment failed: no contract address.");
      setDeployed({ address: receipt.contractAddress, hash });
      toast.success("Token deployed");
      await record({
        data: {
          contractAddress: receipt.contractAddress,
          txHash: hash,
          deployer: address as Address,
          network,
          name: name.trim(),
          symbol: symbol.trim().toUpperCase(),
          decimals: dec,
          supply,
          description: description || null,
          imageUrl,
        },
      }).catch(() => undefined);
    } catch (e) {
      toast.error((e as Error).message.split("\n")[0] ?? "Deployment failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen px-5 pt-32 pb-24">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Create</p>
        <h1 className="display-serif mt-3 text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.02] text-foreground">
          Deploy a recoverable token
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Compiled from <code className="text-foreground">RecovaSafeToken.sol</code> with solc
          0.8.20. Recovery functions are owner-only and enforced on-chain.
        </p>

        <section className="glass-panel mt-10 rounded-3xl p-6">
          <p className="eyebrow">Generate with AI</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Optional theme, e.g. deep-sea salvage"
              className="flex-1 rounded-full border border-input bg-transparent px-5 py-3 text-sm outline-none focus:border-ring"
            />
            <button
              type="button"
              onClick={handleIdea}
              disabled={busy !== null}
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy === "idea" ? "Thinking..." : busy === "logo" ? "Drawing logo..." : "Generate"}
            </button>
          </div>
        </section>

        <section className="glass-panel mt-5 grid gap-5 rounded-3xl p-6 sm:grid-cols-2">
          <Field label="Name" value={name} onChange={setName} placeholder="Recova Salvage" />
          <Field
            label="Symbol"
            value={symbol}
            onChange={(v) => setSymbol(v.toUpperCase())}
            placeholder="RSV"
          />
          <Field label="Total supply" value={supply} onChange={setSupply} placeholder="1000000000" />
          <Field label="Decimals" value={decimals} onChange={setDecimals} placeholder="18" />
          <div className="sm:col-span-2">
            <label className="eyebrow">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm outline-none focus:border-ring"
            />
          </div>
          {imageUrl && (
            <div className="sm:col-span-2 flex items-center gap-4">
              <img
                src={imageUrl}
                alt={`${name || "Token"} logo`}
                className="h-20 w-20 rounded-2xl border border-border object-cover"
              />
              <span className="text-xs text-muted-foreground">
                AI-generated logo (stored with your deployment record).
              </span>
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {address ? (
            <button
              type="button"
              onClick={handleDeploy}
              disabled={busy !== null}
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy === "deploy" ? "Deploying..." : `Deploy on X Layer ${network}`}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => connect("okx").catch((e) => toast.error((e as Error).message))}
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground"
            >
              Connect wallet to deploy
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            Gas is paid in OKB. You will be asked to sign in your wallet.
          </span>
        </div>

        {deployed && (
          <section className="glass-panel mt-8 rounded-3xl p-6">
            <p className="eyebrow">Deployed</p>
            <p className="mt-2 font-mono text-sm break-all text-foreground">{deployed.address}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <a
                className="glass-pill rounded-full px-4 py-2"
                href={explorerAddressUrl(network, deployed.address)}
                target="_blank"
                rel="noreferrer"
              >
                View contract
              </a>
              <a
                className="glass-pill rounded-full px-4 py-2"
                href={explorerTxUrl(network, deployed.hash)}
                target="_blank"
                rel="noreferrer"
              >
                View transaction
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="eyebrow">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm outline-none focus:border-ring"
      />
    </div>
  );
}
