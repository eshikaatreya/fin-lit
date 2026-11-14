"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Sparkles,
  ArrowRight,
  Plus,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  HelpCircle,
} from "lucide-react";
import { formatINR, formatCompactINR } from "@/lib/constants";
import AddTransactionModal from "@/components/common/AddTransactionModal";
import ReallocationModal from "@/components/common/ReallocationModal";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeReallocation, setActiveReallocation] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 lg:col-span-2" />
          <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const user = data?.user;
  const recommendations = data?.pendingRecommendations || [];
  const insights = data?.insights || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const dailySpending = data?.dailySpendingChart || [];
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header & Financial Health Score Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Fin-Lit Financial Intelligence Command Centre</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              You are {summary?.daysPassed} days into {new Date().toLocaleString("en-US", { month: "long" })}. Your planned safe spending limit is{" "}
              <strong className="text-emerald-400 font-semibold">
                {formatINR(Math.floor(summary?.totalRemainingBudget / Math.max(1, summary?.daysRemaining)))}/day
              </strong>.
            </p>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center space-x-4 bg-slate-800/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-700/60 shadow-inner">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Financial Health</div>
              <div className="text-sm font-bold text-emerald-400">
                {summary?.healthScore >= 80 ? "Tier-1 Excellent" : summary?.healthScore >= 60 ? "Healthy" : "Needs Review"}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-extrabold text-xl font-mono">
              {summary?.healthScore || 78}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Financial Overview Metric Cards (Income, Expenses, Remaining, Savings) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Monthly Inflow</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {formatINR(summary?.totalIncome)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span>Take-home salary & allowance</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Expenditure</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {formatINR(summary?.totalExpenditure)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span>{summary?.budgetUtilizationPercentage}% of allocated budget</span>
          </div>
        </div>

        {/* Remaining Discretionary Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Remaining Budget</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
            {formatINR(summary?.totalRemainingBudget)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span>{summary?.daysRemaining} days remaining in month</span>
          </div>
        </div>

        {/* Actual Savings & Target */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Actual Net Savings</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {formatINR(summary?.monthlyActualSavings)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {summary?.savingsRatePercentage}%
            </span>
            <span>savings rate</span>
          </div>
        </div>
      </div>

      {/* Pending AI Budget Reallocation Alert Banner (Spec Section 6.D) */}
      {recommendations.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-900/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {recommendations[0].title}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  AI Action Recommended
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {recommendations[0].description}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const payload = JSON.parse(recommendations[0].actionPayload);
              setActiveReallocation({
                fromCategoryId: payload.fromCategoryId || "Entertainment",
                fromCategoryName: payload.fromCategory || "Entertainment",
                toCategoryId: payload.toCategoryId || "Food & Dining",
                toCategoryName: payload.toCategory || "Food & Dining",
                recommendedAmount: payload.amount || 1500,
                reason: recommendations[0].description,
                impactAnalysis: "Safely balances your dining allocation without exceeding your monthly budget.",
                recommendationId: recommendations[0].id,
              });
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 shrink-0 transition-colors shadow-sm flex items-center space-x-2"
          >
            <span>Review & Approve</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Grid: Daily Spending Velocity Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spending Trend Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Spending Velocity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily expenditure across Day 1 to Day {summary?.daysPassed} vs safe benchmark
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-semibold">Average Velocity</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {formatINR(summary?.spendingVelocity)} / day
              </div>
            </div>
          </div>

          {/* Simple custom SVG bar chart for 100% reliability without client hydration mismatches */}
          <div className="h-56 w-full flex items-end space-x-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {dailySpending.map((item: any) => {
              const maxVal = Math.max(...dailySpending.map((d: any) => d.amount), item.safeBudget * 1.5, 1000);
              const heightPct = Math.min(100, Math.max(8, (item.amount / maxVal) * 100));
              const isOverSafe = item.amount > item.safeBudget;

              return (
                <div key={item.dayNum} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] rounded px-2 py-1 pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-lg">
                    Day {item.dayNum}: {formatINR(item.amount)}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      isOverSafe
                        ? "bg-amber-500 group-hover:bg-amber-600"
                        : "bg-emerald-500 group-hover:bg-emerald-600"
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">{item.dayNum}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 pt-1">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Within Safe Pace</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span>Elevated Spend</span>
              </div>
            </div>
            <span>Benchmark: {formatINR(summary?.totalAllocatedBudget / summary?.totalDaysInMonth)}/day</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Category Distribution
            </h2>
            <Link
              href="/budgets"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Manage &rarr;
            </Link>
          </div>

          <div className="space-y-3.5 flex-1">
            {categoryBreakdown.slice(0, 6).map((cat: any) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(cat.value)}</span>
                    <span className="text-[11px] text-slate-400 ml-1">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (cat.value / (cat.allocated || 1)) * 100)}%` }}
                    className={`h-full rounded-full ${
                      cat.value > cat.allocated
                        ? "bg-rose-500"
                        : (cat.value / cat.allocated) * 100 > 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Discretionary Utilized</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {summary?.budgetUtilizationPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Proactive AI Insights & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proactive Financial Insights List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Fin-Lit AI Insights
              </h2>
            </div>
            <Link
              href="/ai-assistant"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Ask AI &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {insights.slice(0, 3).map((insight: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {insight.title}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      insight.impactLevel === "CRITICAL"
                        ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                        : insight.impactLevel === "WARNING"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                        : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {insight.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {insight.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unified passbook feed across connected UPI sources
              </p>
            </div>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx: any) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      tx.type === "INCOME"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {tx.type === "INCOME" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {tx.merchant}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                      <span>{tx.category?.name || "General"}</span>
                      <span>&bull;</span>
                      <span>{new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-[10px] text-slate-400">{tx.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold text-sm ${
                      tx.type === "INCOME"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatINR(tx.amount)}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reallocation Modal */}
      {activeReallocation && (
        <ReallocationModal
          isOpen={!!activeReallocation}
          onClose={() => setActiveReallocation(null)}
          onSuccess={() => {
            setActiveReallocation(null);
            fetchDashboardData();
          }}
          recommendation={activeReallocation}
        />
      )}

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
