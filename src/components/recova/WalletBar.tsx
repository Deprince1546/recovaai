import { useState } from "react";
import { toast } from "sonner";
import { useWallet, shortAddress, type WalletId } from "@/lib/wallet";
import { NETWORKS, type NetworkKey } from "@/lib/networks";

const WALLETS: Array<{ id: WalletId; label: string; hint: string }> = [
  { id: "okx", label: "OKX Wallet", hint: "Recommended for X Layer" },
  { id: "metamask", label: "MetaMask", hint: "Injected EVM wallet" },
  { id: "injected", label: "Other EVM Wallet", hint: "Any injected provider" },
];

export function NetworkToggle() {
  const { network, setNetwork, address, switchNetwork } = useWallet();

  async function pick(next: NetworkKey) {
    setNetwork(next);
    if (address) {
      try {
        await switchNetwork(next);
        toast.success(`Wallet on ${NETWORKS[next].name}`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    }
  }

  return (
    <div className="glass-pill flex items-center rounded-full p-0.5 text-[0.68rem] tracking-[0.18em] uppercase">
      {(["testnet", "mainnet"] as NetworkKey[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => pick(key)}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            network === key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}

export function ConnectWallet() {
  const { address, connect, disconnect, connecting, wrongNetwork, switchNetwork, network } =
    useWallet();
  const [open, setOpen] = useState(false);

  async function handleConnect(id: WalletId) {
    try {
      await connect(id);
      setOpen(false);
      toast.success("Wallet connected");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (address) {
    return (
      <div className="flex items-center gap-2">
        {wrongNetwork && (
          <button
            type="button"
            onClick={async () => {
              try {
                await switchNetwork(network);
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="glass-pill rounded-full px-3 py-2 text-xs text-warning"
          >
            Wrong network — switch
          </button>
        )}
        <button
          type="button"
          onClick={disconnect}
          className="glass-pill rounded-full px-4 py-2 font-mono text-xs text-foreground"
          title="Disconnect"
        >
          {shortAddress(address)}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={connecting}
        className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {open && (
        <div className="glass-panel absolute right-0 z-50 mt-2 w-64 rounded-2xl p-2">
          <p className="eyebrow px-3 py-2">Connect wallet</p>
          {WALLETS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleConnect(w.id)}
              className="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
            >
              <span className="block text-sm text-foreground">{w.label}</span>
              <span className="block text-xs text-muted-foreground">{w.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
