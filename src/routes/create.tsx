import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { type Address } from "viem";
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

/** RecovaSafeToken inherits OpenZeppelin ERC20 — decimals are fixed at 18. */
const TOKEN_DECIMALS = 18;

function CreatePage() {
  const { address, network, connect, getWalletClient, publicClient, wrongNetwork, switchNetwork } =
    useWallet();
  const idea = useServerFn(generateTokenIdea);
  const logo = useServerFn(generateTokenLogo);
  const record = useServerFn(recordDeployment);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("1000000000");
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
      toast.success("Token details generated with RECOVA AI");
      setBusy("logo");
      const img = await logo({ data: { prompt: res.imagePrompt } });
      setImageUrl(img.dataUrl);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function handleUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(String(reader.result));
      toast.success("Logo uploaded");
    };
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
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
    const wholeSupply = (supply || "0").replace(/[^0-9]/g, "");
    if (!wholeSupply || BigInt(wholeSupply) <= 0n) {
      toast.error("Enter a whole-number total supply greater than zero.");
      return;
    }
    setBusy("deploy");
    try {
      if (wrongNetwork) await switchNetwork(network);
      const wallet = getWalletClient();
      // Constructor: (string name_, string symbol_, uint256 initialSupply_, address initialOwner_)
      const hash = await wallet.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode as `0x${string}`,
        account: address,
        chain: null,
        args: [name.trim(), symbol.trim().toUpperCase(), BigInt(wholeSupply), address],
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
          decimals: TOKEN_DECIMALS,
          supply: wholeSupply,
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
    <main className="min-h-screen px-4 pt-28 pb-24 sm:px-6 sm:pt-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <p className="eyebrow">Create</p>
          <h1 className="display-serif mt-3 text-[clamp(2rem,6vw,3.6rem)] leading-[1.02] text-foreground">
            Deploy a recoverable token
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Compiled from <code className="text-foreground">RecovaSafeToken.sol</code> with solc
            0.8.20. Recovery functions are owner-only and enforced on-chain.
          </p>

          <section className="glass-panel mt-10 rounded-3xl p-5 sm:p-6">
            <p className="eyebrow">Generate with RECOVA AI</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Optional theme, e.g. deep-sea salvage"
                className="min-w-0 flex-1 rounded-full border border-input bg-transparent px-5 py-3 text-sm outline-none focus:border-ring"
              />
              <button
                type="button"
                onClick={handleIdea}
                disabled={busy !== null}
                className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {busy === "idea" ? "Thinking..." : busy === "logo" ? "Drawing logo..." : "Generate"}
              </button>
            </div>
          </section>

          <section className="glass-panel mt-5 grid gap-5 rounded-3xl p-5 sm:grid-cols-2 sm:p-6">
            <Field label="Name" value={name} onChange={setName} placeholder="Recova Salvage" />
            <Field
              label="Symbol"
              value={symbol}
              onChange={(v) => setSymbol(v.toUpperCase())}
              placeholder="RSV"
            />
            <Field
              label="Total supply (whole tokens)"
              value={supply}
              onChange={setSupply}
              placeholder="1000000000"
            />
            <div>
              <label className="eyebrow">Decimals</label>
              <p className="mt-2 w-full rounded-2xl border border-input px-4 py-3 text-sm text-muted-foreground">
                18 (fixed by the contract)
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="eyebrow">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm outline-none focus:border-ring"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="eyebrow">Token logo</label>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`${name || "Token"} logo`}
                    className="h-20 w-20 rounded-2xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-border text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
                    No logo
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="glass-pill rounded-full px-5 py-2.5 text-sm"
                >
                  Upload image
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="rounded-full px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Upload your own logo (PNG/JPG/SVG, max 2 MB) or let RECOVA AI draw one. Stored with
                your deployment record.
              </p>
            </div>
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
            <section className="glass-panel mt-8 rounded-3xl p-5 sm:p-6">
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
