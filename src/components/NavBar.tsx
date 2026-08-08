"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/transactions", label: "Transactions" },
  { href: "/import", label: "Import" },
  { href: "/categories", label: "Category Map" },
  { href: "/accounts", label: "Accounts" },
  { href: "/reports/profit-loss", label: "P&L" },
  { href: "/reports/balance-sheet", label: "Balance Sheet" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-slate-900">Lion&apos;s Share Bookkeeping</span>
          <nav className="flex gap-4">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    "text-sm font-medium " +
                    (active ? "text-slate-900" : "text-slate-500 hover:text-slate-800")
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-800">
          Sign out
        </button>
      </div>
    </header>
  );
}
