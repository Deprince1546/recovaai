import {
  createPublicClient,
  http,
  parseAbi,
  toFunctionSelector,
  type AbiFunction,
} from "viem";
import { NETWORKS, type NetworkKey } from "./networks";
import artifact from "@/contracts/RecovaSafeToken.artifact.json";

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

/** Recovery entry points, derived from the compiled RecovaSafeToken ABI — never hardcoded. */
export const RECOVERY_FUNCTION_NAMES = [
  "recoverNative",
  "recoverAllNative",
  "recoverERC20",
  "recoverAllERC20",
] as const;

export type RecoveryFunctionName = (typeof RECOVERY_FUNCTION_NAMES)[number];

const abiFunctions = (artifact.abi as unknown as AbiFunction[]).filter(
  (item) => item.type === "function",
);

/** selector -> human signature, computed from the compilation artifact. */
export const RECOVERY_SELECTORS: Record<string, string> = Object.fromEntries(
  abiFunctions
    .filter((fn) => (RECOVERY_FUNCTION_NAMES as readonly string[]).includes(fn.name))
    .map((fn) => {
      const signature = `${fn.name}(${fn.inputs.map((i) => i.type).join(",")})`;
      return [toFunctionSelector(fn).slice(2).toLowerCase(), signature];
    }),
);

export function clientFor(network: NetworkKey) {
  const chain = NETWORKS[network];
  return createPublicClient({ chain, transport: http(chain.rpcUrls.default.http[0]) });
}
