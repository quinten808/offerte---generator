"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/klanten", label: "Klanten", icon: "◉" },
  { href: "/offertes", label: "Offertes", icon: "▤" },
  { href: "/instellingen", label: "Instellingen", icon: "⚙" },
];

function Navigation({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Hoofdnavigatie">
      <ul className={compact ? "grid grid-cols-4" : "space-y-1"}>
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={
                  compact
                    ? `flex flex-col items-center gap-1 px-1 py-2 text-xs font-medium ${isActive ? "text-blue-700" : "text-slate-500"}`
                    : `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`
                }
                href={item.href}
              >
                <span aria-hidden="true" className={compact ? "text-base leading-none" : "text-lg leading-none"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-6 lg:flex lg:flex-col">
        <Link className="mb-10 flex items-center gap-3 px-2" href="/dashboard">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">O</span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">Offertegenerator</span>
            <span className="block text-xs text-slate-500">Uw klusbedrijf</span>
          </span>
        </Link>
        <Navigation />
        <p className="mt-auto px-3 text-xs leading-5 text-slate-400">Eenvoudig inzicht in uw klanten en offertes.</p>
      </aside>

      <main className="min-h-screen pb-20 lg:ml-64 lg:pb-0">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">{children}</div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <Navigation compact />
      </div>
    </div>
  );
}
