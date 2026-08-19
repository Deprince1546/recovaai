import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroVideo } from "@/components/recova/HeroVideo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RECOVA — Recoverable Tokens & Asset Recovery on X Layer" },
      {
        name: "description",
        content:
          "RECOVA deploys recoverable ERC-20 tokens, scans X Layer contracts with AI and recovers trapped assets — wallet-authorized, on-chain, verifiable.",
      },
      { property: "og:title", content: "RECOVA — Recoverable Tokens on X Layer" },
      {
        property: "og:description",
        content: "Deploy recoverable tokens, scan contracts and recover trapped assets on X Layer.",
      },
    ],
  }),
  component: Landing,
});

const STATS = [
  { value: "196", label: "X Layer Mainnet" },
  { value: "1952", label: "X Layer Testnet" },
  { value: "0.8.20", label: "Solidity compiler" },
  { value: "ERC-20", label: "Recoverable standard" },
];

const CAPABILITIES = [
  {
    title: "Create Token",
    body: "Deploy the compiled RecovaSafeToken contract with built-in native and ERC-20 recovery, straight from your wallet.",
    to: "/create",
    cta: "Deploy a token",
  },
  {
    title: "Contract Scanner",
    body: "Read live X Layer state — balances, ownership, trapped ERC-20 assets — then let the AI analyst grade recoverability.",
    to: "/scan",
    cta: "Scan a contract",
  },
];

function Landing() {
  return (
    <main className="relative bg-background">
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5">
        <HeroVideo />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center pt-24 text-center">
          <span
            className="glass-pill rise inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.7rem] tracking-[0.2em] uppercase"
            style={{ animationDelay: "80ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Live on X Layer
          </span>

          <h1
            className="display-serif metal-text rise mt-7 text-[clamp(2.9rem,9vw,6.5rem)] leading-[0.95]"
            style={{ animationDelay: "180ms" }}
          >
            Tokens that can
            <br />
            <em className="italic">always come back</em>
          </h1>

          <p
            className="rise mt-6 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            RECOVA deploys recoverable ERC-20 contracts, scans X Layer for trapped value and lets
            authorized owners pull assets back on-chain.
          </p>

          <div
            className="rise mt-9 flex flex-col items-center gap-3 sm:flex-row"
            style={{ animationDelay: "420ms" }}
          >
            <Link
              to="/create"
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Create a token
            </Link>
            <Link
              to="/scan"
              className="glass-pill rounded-full px-7 py-3.5 text-sm text-foreground transition-transform hover:scale-[1.03]"
            >
              Scan a contract
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-16 grid w-full max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-glass-border md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="glass-pill fade-slow flex flex-col items-center gap-1 rounded-none px-4 py-6"
              style={{ animationDelay: `${600 + i * 90}ms` }}
            >
              <span className="display-serif text-2xl text-foreground">{s.value}</span>
              <span className="eyebrow text-center">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="h-16" />
      </section>

      <section className="relative border-t border-border px-5 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">Capabilities</p>
          <h2 className="display-serif mt-3 text-[clamp(2rem,5vw,3.2rem)] leading-[1.05] text-foreground">
            Everything runs against real chain state
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <Link
                key={c.title}
                to={c.to}
                className="glass-panel group flex flex-col rounded-3xl p-7 transition-transform hover:-translate-y-1"
              >
                <span className="display-serif text-2xl text-foreground">{c.title}</span>
                <span className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</span>
                <span className="mt-6 text-xs tracking-[0.18em] text-foreground uppercase">
                  {c.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-muted-foreground">
          <span>RECOVA</span>
          <span>Built on X Layer</span>
        </div>
      </footer>
    </main>
  );
}
