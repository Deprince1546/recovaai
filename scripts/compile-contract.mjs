// Compiles contracts/RecovaSafeToken.sol with pinned solc 0.8.20 + OpenZeppelin 5.0.2
// and emits the single authoritative artifact used by the app (ABI + bytecode).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const solc = require("solc");
const ozPkg = require("@openzeppelin/contracts/package.json");

const root = process.cwd();
const sourcePath = path.join(root, "contracts/RecovaSafeToken.sol");
const sourceCode = fs.readFileSync(sourcePath, "utf8");

function findImport(importPath) {
  try {
    return { contents: fs.readFileSync(require.resolve(importPath), "utf8") };
  } catch (e) {
    return { error: `Not found: ${importPath} (${e.message})` };
  }
}

const optimizerRuns = 200;
const evmVersion = "paris";

const input = {
  language: "Solidity",
  sources: { "RecovaSafeToken.sol": { content: sourceCode } },
  settings: {
    optimizer: { enabled: true, runs: optimizerRuns },
    evmVersion,
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));
const errors = (output.errors ?? []).filter((e) => e.severity === "error");
if (errors.length) {
  console.error(errors.map((e) => e.formattedMessage).join("\n"));
  process.exit(1);
}

const contract = output.contracts["RecovaSafeToken.sol"]["RecovaSafeToken"];
const artifact = {
  contractName: "RecovaSafeToken",
  sourceCode,
  sourceHash: "0x" + crypto.createHash("sha256").update(sourceCode).digest("hex"),
  compilerVersion: solc.version(),
  openZeppelinVersion: ozPkg.version,
  optimizer: true,
  optimizerRuns,
  evmVersion,
  abi: contract.abi,
  bytecode: "0x" + contract.evm.bytecode.object,
  deployedBytecode: "0x" + contract.evm.deployedBytecode.object,
  constructorSignature: "constructor(string name_, string symbol_, uint256 initialSupply_, address initialOwner_)",
  compiledAt: new Date().toISOString(),
};

const out = path.join(root, "src/contracts/RecovaSafeToken.artifact.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(artifact, null, 2));
console.log("Compiled", artifact.compilerVersion, "OZ", artifact.openZeppelinVersion, "bytecode bytes:", (artifact.bytecode.length - 2) / 2);
