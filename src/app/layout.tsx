import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Fin-Lit | AI-Powered Personal Financial Intelligence Platform",
  description:
    "Understand your money. Control your spending. Build your financial future. Production-grade financial manager, intelligent budgeting, unified passbook, and AI financial assistant tailored for India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#070D1F] text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 pb-20 lg:pb-8 px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
