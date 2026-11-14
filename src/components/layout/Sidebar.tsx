"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Bot,
  CalendarCheck,
  Target,
  UserCheck,
  CreditCard,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Transactions", href: "/transactions", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: PieChart },
  { name: "Fin-Lit AI", href: "/ai-assistant", icon: Bot, isSpecial: true },
  { name: "Subscriptions", href: "/subscriptions", icon: CalendarCheck },
  { name: "Savings Goals", href: "/savings-goals", icon: Target },
  { name: "Profile & Settings", href: "/settings", icon: UserCheck },
  { name: "Onboarding Wizard", href: "/onboarding", icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 transition-colors">
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md font-semibold"
                    : item.isSpecial
                    ? "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "" : item.isSpecial ? "text-emerald-500" : "text-slate-400"}`} />
                <span>{item.name}</span>
                {item.isSpecial && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* UPI & Passbook card */}
        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-900 text-white relative overflow-hidden border border-slate-800 shadow-lg">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UPI Passbook Active</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Direct simulated feed for Google Pay, PhonePe, Paytm & BHIM.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Security: Zero-Credential</span>
            <span className="text-emerald-400 font-mono font-bold">100% INR</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-2 py-2 flex justify-around">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name.replace("My ", "")}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
