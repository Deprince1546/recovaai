import { defineChain } from "viem";

export type NetworkKey = "testnet" | "mainnet";

export const xLayerMainnet = defineChain({
  id: 196,
  name: "X Layer Mainnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.xlayer.tech", "https://xlayerrpc.okx.com"] },
  },
  blockExplorers: {
    default: { name: "OKX Explorer", url: "https://www.okx.com/web3/explorer/xlayer" },
  },
});

export const xLayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testrpc.xlayer.tech/terigon", "https://xlayertestrpc.okx.com/terigon"],
    },
  },
  blockExplorers: {
    default: { name: "OKX Explorer", url: "https://www.okx.com/web3/explorer/xlayer-test" },
  },
  testnet: true,
});

export const NETWORKS = {
  testnet: xLayerTestnet,
  mainnet: xLayerMainnet,
} as const;

export const CHAIN_HEX: Record<NetworkKey, string> = {
  testnet: "0x7a0",
  mainnet: "0xc4",
};

export function networkKeyFromChainId(chainId: number): NetworkKey | null {
  if (chainId === 196) return "mainnet";
  if (chainId === 1952) return "testnet";
  return null;
}

export function explorerAddressUrl(network: NetworkKey, address: string) {
  return `${NETWORKS[network].blockExplorers.default.url}/address/${address}`;
}

export function explorerTxUrl(network: NetworkKey, hash: string) {
  return `${NETWORKS[network].blockExplorers.default.url}/tx/${hash}`;
}

/** Params for wallet_addEthereumChain */
export function addChainParams(network: NetworkKey) {
  const chain = NETWORKS[network];
  return {
    chainId: CHAIN_HEX[network],
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: [...chain.rpcUrls.default.http],
    blockExplorerUrls: [chain.blockExplorers.default.url],
  };
}
