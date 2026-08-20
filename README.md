RECOVA AI

AI-Powered Onchain Recovery & Token Infrastructure

RECOVA AI is an AI-powered onchain infrastructure platform designed to help users create recovery-enabled EVM tokens, scan token contracts for accidentally trapped assets, identify recoverable balances, and execute authorized recovery transactions.

Built with a primary focus on X Layer, RECOVA combines blockchain infrastructure, AI-powered analysis, automated contract inspection, and wallet-based transaction signing into one platform.

> Create. Scan. Detect. Recover.



🚀 Live Demo

Live Application:
[recova.vercel.app](https://recova.vercel.app/?utm_source=chatgpt.com)

GitHub Repository:
[github.com/Deprince1546/recovaai](https://github.com/Deprince1546/recovaai?utm_source=chatgpt.com)




✨ What RECOVA Does

RECOVA is built around two core systems:

1. Safe Token Creation

Users can create ERC-20 tokens with a built-in recovery mechanism.

Token creators can provide:

Token name

Token symbol

Initial supply

Token logo

Description

Creator/owner wallet

Network selection

Testnet/Mainnet deployment


The deployed token uses the RecovaSafeToken smart contract, which supports recovery of:

Native X Layer OKB accidentally sent to the contract

ERC-20 tokens accidentally sent to the contract


Recovery functions are owner-controlled and require the appropriate wallet authorization.




2. AI-Powered Contract Scanner

Users can paste an X Layer contract address into RECOVA's scanner.

The platform analyzes available onchain and offchain information to identify:

Token name

Token symbol

Token logo

Contract address

Creator/owner information

Native asset balance

ERC-20 balances

Potentially recoverable assets

Recovery methods exposed by the contract

Liquidity information

Market information

Social profiles and project links


RECOVA uses both backend blockchain infrastructure and AI-powered analysis to organize this information into an easy-to-understand recovery report.

Recovery Status

The scanner distinguishes between:

Recoverable

The contract exposes a supported recovery mechanism and the required authority is available.

Not Recoverable

RECOVA cannot identify a valid authorized recovery path.

> RECOVA never bypasses contract ownership, wallet signatures, blockchain permissions, or protocol security.






🧠 RECOVA AI

RECOVA uses AI to transform raw blockchain and web data into useful intelligence.

The AI layer can assist with:

Contract analysis

Token identification

Creator identification

Project/social discovery

Recovery-path analysis

Token metadata generation

Token concept generation

Natural-language explanations


AI does not override blockchain permissions.

The blockchain remains the final authority.




⚡ X Layer

RECOVA is primarily built for X Layer, the EVM-compatible Layer 2 ecosystem.

The platform supports:

X Layer Mainnet

Chain ID: 196

Native asset: OKB


X Layer Testnet

Chain ID: 1952

Native asset: OKB


Users can switch between Testnet and Mainnet through the application.

All transactions require actual wallet authorization.




🔐 Wallet Security

RECOVA does not treat clicking Connect Wallet as authorization.

Wallet interactions require the user's wallet to approve/sign the relevant operation.

Supported EVM wallet functionality includes:

Wallet connection

Account detection

Network detection

Transaction signing

Contract deployment

Recovery authorization


Private keys are never requested by RECOVA's frontend.




🛠️ Smart Contract Architecture

RECOVA's token creation system is based on:

RecovaSafeToken.sol

The contract provides:

ERC-20 Token
      │
      ├── Native OKB Recovery
      │     ├── recoverNative()
      │     └── recoverAllNative()
      │
      └── ERC-20 Recovery
            ├── recoverERC20()
            └── recoverAllERC20()

The contract uses OpenZeppelin components including:

ERC20

Ownable

SafeERC20

ReentrancyGuard


Single Source of Truth

RECOVA generates the ABI and bytecode from the actual Solidity compilation artifact.

The frontend does not rely on manually maintained function selectors or mismatched ABI definitions.

This helps ensure that:

Solidity Source
      ↓
Compilation
      ↓
ABI + Bytecode
      ↓
Deployment
      ↓
Scanner
      ↓
Recovery Transactions

all correspond to the same contract implementation.




💰 Recovery Fee

RECOVA uses a simple fixed platform fee:

10%

For every successfully completed recovery through RECOVA:

Recovered Value
      │
      ├── 90% → Authorized recipient
      │
      └── 10% → RECOVA platform fee

The exact fee implementation and transaction flow should always be visible to the user before signing.

RECOVA does not claim or withdraw assets without the authorization required by the underlying blockchain or smart contract.




🧩 AI Token Generator

RECOVA also provides an AI-assisted token creation experience.

Users can generate a token concept automatically.

The AI can generate:

Token name

Token symbol

Token description

Token artwork/logo

Default supply of 1,000,000,000


Users can then:

Regenerate

Edit the generated information

Accept the result

Deploy the token


The AI-generated information is only a starting point. The user remains responsible for reviewing the token configuration before deployment.




🔎 Contract Recovery Flow

A typical recovery workflow looks like:

1. Paste Contract Address
          ↓
2. RECOVA scans blockchain
          ↓
3. Identify contract + balances
          ↓
4. Inspect ABI / recovery capabilities
          ↓
5. Identify authorized recovery path
          ↓
6. Calculate potentially recoverable amount
          ↓
7. Show recovery details
          ↓
8. User connects authorized wallet
          ↓
9. User reviews transaction
          ↓
10. User signs transaction
          ↓
11. Blockchain confirms recovery
          ↓
12. RECOVA applies 10% platform fee




🗺️ Roadmap

Phase 1 — X Layer Foundation ✅

[x] X Layer integration

[x] X Layer Testnet

[x] X Layer Mainnet support

[x] ERC-20 token creation

[x] Recovery-enabled token contracts

[x] Native OKB recovery

[x] ERC-20 recovery

[x] Wallet connection

[x] Contract scanning

[x] AI-powered analysis

[x] AI token generation

[x] Production deployment infrastructure





Phase 2 — Advanced X Layer Intelligence 🚧

[ ] Deeper X Layer contract intelligence

[ ] Automated recovery-path detection

[ ] Advanced token liquidity analysis

[ ] Historical contract analysis

[ ] Creator-wallet intelligence

[ ] Recovery opportunity monitoring

[ ] Automated alerts

[ ] Recovery history dashboard

[ ] Portfolio of discovered recovery opportunities





☀️ Phase 3 — Solana Recovery

RECOVA's next major expansion is a Solana recovery system, with a focus on Token-2022 accounts and eligible excess lamports.

Solana's Token-2022 program provides the WithdrawExcessLamports instruction for withdrawing excess lamports from eligible Token-2022 accounts. The operation requires the appropriate authority/signature; RECOVA will therefore use AI to identify the relevant authority and recovery path rather than bypassing authorization. 

Planned capabilities

Solana wallet integration

Token-2022 detection

Mint-address scanning

Excess-lamport detection

Token authority analysis

Creator/authority wallet discovery

AI-powered mint intelligence

Recovery eligibility detection

Authorized withdraw_excess_lamports transactions

Recovery opportunity discovery

Solana recovery history

10% RECOVA platform fee


Planned flow

Token/Mint Address
        ↓
RECOVA AI
        ↓
Token-2022 Detection
        ↓
Authority Discovery
        ↓
Excess Lamport Detection
        ↓
Recovery Eligibility
        ↓
Authorized Wallet
        ↓
User Signs Transaction
        ↓
Recovery
        ↓
90% Recipient / 10% RECOVA

Token-2022 is an extensible version of Solana's token program and uses extensions for additional mint/account functionality. 




💡 Recovery Opportunity Marketplace

A longer-term RECOVA goal is to create an ecosystem where users can discover legitimate, authorized recovery opportunities.

Potential future functionality:

Public recovery opportunity discovery

AI-ranked opportunities

Creator/authority identification

Recovery-value estimation

Opportunity claiming

Automated fee calculation

Recovery history

Reputation system

Onchain proof of completed recovery


The goal is to allow participants to earn from providing recovery services only where the underlying protocol/account permissions allow the recovery.




🔮 Future Vision

RECOVA aims to evolve from a recovery tool into an AI-powered onchain recovery network.

RECOVA AI
                  │
       ┌──────────┴──────────┐
       │                     │
    X Layer               Solana
       │                     │
       ▼                     ▼
 EVM Recovery         Token-2022 Recovery
       │                     │
       └──────────┬──────────┘
                  ▼
          Recovery Network
                  │
                  ▼
          AI Opportunity
             Discovery

The long-term vision is to make accidentally trapped onchain value easier to identify, understand, and recover through transparent, permission-aware infrastructure.




🧑‍💻 Tech Stack

RECOVA is built using modern Web3 and AI technologies.

Frontend

TypeScript

React

TanStack Start

Tailwind CSS

HTML5

CSS3


Blockchain

Solidity ^0.8.20

EVM

X Layer

viem / EVM wallet tooling

OpenZeppelin Contracts


Backend

TypeScript

TanStack server routes

REST/API architecture

Supabase


AI

OpenRouter

Groq

Coasty AI

Pollination


Data & Automation

Firecrawl

OKX Onchain APIs

Blockchain RPC endpoints


Planned Solana Stack

Solana

Token-2022

Solana Web3 tooling

withdraw_excess_lamports

AI-powered authority discovery





📁 Project Structure

A simplified architecture:

RECOVA
├── frontend
│   ├── UI
│   ├── Token Creator
│   ├── AI Generator
│   ├── Scanner
│   └── Wallet
│
├── backend
│   ├── API
│   ├── Blockchain Scanner
│   ├── AI Services
│   └── Data Services
│
├── contracts
│   └── RecovaSafeToken.sol
│
├── deployment
│   └── Contract Deployment
│
└── recovery
    ├── EVM Recovery
    └── Solana Recovery [Roadmap]




🚀 Getting Started

Prerequisites

You should have:

Node.js 18+

npm / pnpm

Git

An EVM-compatible wallet

X Layer Testnet OKB for development

Required API credentials





Installation

Clone the repository:

git clone https://github.com/Deprince1546/recovaai.git
cd recovaai

Install dependencies:

npm install

Create your environment file:

cp .env.example .env

Add the required environment variables.

Never commit private keys, API secrets, service-role keys, or encryption keys to GitHub.




Development

Start the development server:

npm run dev

Then open the local application in your browser.




Production Build

npm run build

Run the production server using the project's configured production command.

Before deployment, verify that:

Contract compilation succeeds

ABI is generated correctly

Bytecode is generated correctly

API routes work

Wallet connection works

Testnet deployment works

Recovery transactions work

Required production environment variables are configured





🔑 Environment Variables

Depending on the enabled features, RECOVA may require:

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CONFIG_ENCRYPTION_KEY=

OPENROUTER_API_KEY=
COASTY_API_KEY=
FIRECRAWL_API_KEY=
POLLINATION_API_KEY=
GROQ_API_KEY=

OKX_API_KEY=
OKX_SECRET_KEY=
OKX_PASSPHRASE=
OKX_PROJECT_ID
Never expose server-side secrets in frontend JavaScript.




🤝 Contributing

Contributions are welcome.

1. Fork the repository

git fork https://github.com/Deprince1546/recovaai

2. Create a branch

git checkout -b feature/your-feature

3. Make your changes

Follow the existing project architecture and coding conventions.

4. Test your changes

At minimum:

npm run build

Also test any affected blockchain transaction flows on Testnet before submitting a PR.

5. Commit

git commit -m "feat: add your feature"

6. Push

git push origin feature/your-feature

7. Open a Pull Request

Explain:

What you changed

Why you changed it

How you tested it

Any blockchain/network implications





🔒 Security

RECOVA interacts with blockchain assets and smart contracts. Security is therefore a core requirement.

Please:

Never share private keys

Never commit secrets

Never bypass wallet authorization

Never attempt to bypass contract ownership

Never assume an asset is recoverable without verifying the protocol's permissions

Test contracts on Testnet before Mainnet deployment

Review transactions before signing


Reporting a Vulnerability

If you discover a security vulnerability, please do not immediately publish exploit details publicly.

Contact the project maintainers privately with:

Vulnerability description

Affected component

Reproduction steps

Potential impact

Suggested mitigation




⚠️ Disclaimer

RECOVA provides blockchain analysis and recovery infrastructure.

A detected balance does not automatically mean that the balance is legally or technically recoverable.

Recovery depends on the underlying blockchain protocol, smart-contract implementation, account ownership, authority configuration, and required wallet signatures.

Users are responsible for reviewing transactions before signing them.

RECOVA does not guarantee recovery of any asset.



📜 License

This project is currently under active development.

See the repository for the applicable license and usage terms.




🌐 Links

Website / Demo: [RECOVA AI](https://recova.vercel.app/?utm_source=chatgpt.com)

GitHub: [RECOVA AI on GitHub](https://github.com/Deprince1546/recovaai?utm_source=chatgpt.com)



RECOVA AI

Create. Scan. Detect. Recover.

*Building safer infrastructure for the onchain world.*
