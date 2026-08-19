import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type EIP1193Provider,
} from "viem";
import {
  CHAIN_HEX,
  NETWORKS,
  addChainParams,
  networkKeyFromChainId,
  type NetworkKey,
} from "./networks";

export type WalletId = "okx" | "metamask" | "injected";

type Eip1193 = EIP1193Provider & { isOkxWallet?: boolean; isMetaMask?: boolean };

declare global {
  interface Window {
    okxwallet?: Eip1193;
    ethereum?: Eip1193 & { providers?: Eip1193[] };
  }
}

export function getProvider(id: WalletId): Eip1193 | null {
  if (typeof window === "undefined") return null;
  if (id === "okx") return window.okxwallet ?? null;
  const eth = window.ethereum;
  if (!eth) return null;
  const list = eth.providers ?? [eth];
  if (id === "metamask") return list.find((p) => p.isMetaMask) ?? null;
  return eth;
}

type WalletState = {
  address: Address | null;
  chainId: number | null;
  walletId: WalletId | null;
  connecting: boolean;
  network: NetworkKey;
  wrongNetwork: boolean;
  setNetwork: (n: NetworkKey) => void;
  connect: (id: WalletId) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (n?: NetworkKey) => Promise<void>;
  getWalletClient: () => ReturnType<typeof createWalletClient>;
  publicClient: ReturnType<typeof createPublicClient>;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletId, setWalletId] = useState<WalletId | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [network, setNetworkState] = useState<NetworkKey>("testnet");

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: NETWORKS[network],
        transport: http(NETWORKS[network].rpcUrls.default.http[0]),
      }),
    [network],
  );

  // Never auto-connect: we only attach listeners for an already-authorised session.
  useEffect(() => {
    if (!walletId) return;
    const provider = getProvider(walletId);
    if (!provider) return;
    const onAccounts = (accounts: unknown) => {
      const list = accounts as string[];
      setAddress(list?.[0] ? (list[0] as Address) : null);
      if (!list?.length) setWalletId(null);
    };
    const onChain = (hex: unknown) => setChainId(Number.parseInt(hex as string, 16));
    provider.on?.("accountsChanged", onAccounts as never);
    provider.on?.("chainChanged", onChain as never);
    return () => {
      provider.removeListener?.("accountsChanged", onAccounts as never);
      provider.removeListener?.("chainChanged", onChain as never);
    };
  }, [walletId]);

  const connect = useCallback(async (id: WalletId) => {
    const provider = getProvider(id);
    if (!provider) {
      throw new Error(
        id === "okx"
          ? "OKX Wallet was not detected."
          : id === "metamask"
            ? "MetaMask was not detected."
            : "No EVM wallet was detected.",
      );
    }
    setConnecting(true);
    try {
      // Direct user action -> real wallet popup.
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      if (!accounts?.length) throw new Error("Wallet connection rejected.");
      const hex = (await provider.request({ method: "eth_chainId" })) as string;
      setAddress(accounts[0] as Address);
      setChainId(Number.parseInt(hex, 16));
      setWalletId(id);
    } catch (e) {
      const err = e as { code?: number; message?: string };
      if (err.code === 4001) throw new Error("Wallet connection rejected.");
      throw new Error(err.message ?? "Wallet connection failed.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setWalletId(null);
  }, []);

  const switchNetwork = useCallback(
    async (target?: NetworkKey) => {
      const next = target ?? network;
      const provider = walletId ? getProvider(walletId) : null;
      if (!provider) throw new Error("Connect a wallet first.");
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_HEX[next] }],
        } as never);
      } catch (e) {
        const err = e as { code?: number; message?: string };
        if (err.code === 4902 || /Unrecognized chain/i.test(err.message ?? "")) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [addChainParams(next)],
          } as never);
        } else if (err.code === 4001) {
          throw new Error("Network switch rejected.");
        } else {
          throw new Error(err.message ?? "Network switch failed.");
        }
      }
      // Only trust the wallet's own report of the active chain.
      const hex = (await provider.request({ method: "eth_chainId" })) as string;
      const confirmed = Number.parseInt(hex, 16);
      setChainId(confirmed);
      const key = networkKeyFromChainId(confirmed);
      if (key) setNetworkState(key);
    },
    [network, walletId],
  );

  const getWalletClient = useCallback(() => {
    const provider = walletId ? getProvider(walletId) : null;
    if (!provider || !address) throw new Error("Wallet is not connected.");
    return createWalletClient({
      account: address,
      chain: NETWORKS[network],
      transport: custom(provider),
    });
  }, [address, network, walletId]);

  const value: WalletState = {
    address,
    chainId,
    walletId,
    connecting,
    network,
    wrongNetwork: address != null && chainId !== NETWORKS[network].id,
    setNetwork: setNetworkState,
    connect,
    disconnect,
    switchNetwork,
    getWalletClient,
    publicClient,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

export function shortAddress(a?: string | null) {
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";
}
