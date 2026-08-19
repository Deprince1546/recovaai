import { createPublicClient, http, parseAbi } from "viem";
import { NETWORKS, type NetworkKey } from "./networks";

export const erc20Abi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function owner() view returns (address)",
]);

export const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" as const;

/** Function selectors that indicate a possible withdrawal/recovery mechanism. */
export const RECOVERY_SELECTORS: Record<string, string> = {
  ce6ed23a: "recoverNative(address,uint256)",
  "8f5e51ca": "recoverAllNative(address)",
  "9b1b4c4a": "recoverERC20(address,address,uint256)",
  "3ccfd60b": "withdraw()",
  "51cff8d9": "withdraw(address)",
  db2e21bc: "emergencyWithdraw()",
  "01681a62": "sweep(address)",
};

export function clientFor(network: NetworkKey) {
  const chain = NETWORKS[network];
  return createPublicClient({ chain, transport: http(chain.rpcUrls.default.http[0]) });
}
