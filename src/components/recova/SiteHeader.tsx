import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { RecovaLogo } from "./Logo";
import { ConnectWallet, NetworkToggle } from "./WalletBar";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/create", label: "Create Token" },
  { to: "/scan", label: "Scanner" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link to="/" className="glass-pill rounded-full px-4 py-2.5">
          <RecovaLogo />
        </Link>

        <nav className="glass-pill hidden rounded-full px-1.5 py-1.5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-4 py-2 text-[0.82rem] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <NetworkToggle />
          <ConnectWallet />
        </div>

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="glass-pill flex h-11 w-11 items-center justify-center rounded-full md:hidden"
        >
          <span className="relative block h-3 w-4">
            <span
              className={`absolute left-0 block h-px w-4 bg-foreground transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 block h-px w-4 bg-foreground transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="glass-panel mx-auto mt-3 max-w-6xl rounded-3xl p-4 md:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <NetworkToggle />
            <ConnectWallet />
          </div>
        </div>
      )}
    </header>
  );
}
