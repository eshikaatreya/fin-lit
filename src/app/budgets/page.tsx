"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Edit2,
  Clock,
  Layers,
} from "lucide-react";
import { formatINR, getCurrentMonthString } from "@/lib/constants";
import ReallocationModal from "@/components/common/ReallocationModal";

export default function BudgetsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reallocation, setReallocation] = useState<any>(null);
  const [isReallocModalOpen, setIsReallocModalOpen] = useState(false);
  const [editingAlloc, setEditingAlloc] = useState<any>(null);
  const [newAllocAmount, setNewAllocAmount] = useState("");
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatAllocation, setNewCatAllocation] = useState("");

  useEffect(() => {
    fetchBudgetData();
    fetchReallocationSuggestion();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/budgets");
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

  const fetchReallocationSuggestion = async () => {
    try {
      const res = await fetch("/api/budgets/reallocate");
      if (res.ok) {
        const json = await res.json();
        setReallocation(json.recommendation);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlloc || !newAllocAmount) return;

    try {
      const currentAllocations = data.budget.allocations.map((a: any) => ({
        categoryId: a.categoryId,
        allocatedAmount: a.id === editingAlloc.id ? parseFloat(newAllocAmount) : a.allocatedAmount,
      }));

      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations: currentAllocations }),
      });

      if (res.ok) {
        setEditingAlloc(null);
        fetchBudgetData();
        fetchReallocationSuggestion();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName,
          initialAllocation: parseFloat(newCatAllocation) || 0,
        }),
      });

      if (res.ok) {
        setIsAddCatOpen(false);
        setNewCatName("");
        setNewCatAllocation("");
        fetchBudgetData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const budget = data?.budget;
  const summary = data?.summary;
  const categoryMetrics = summary?.categoryMetrics || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Intelligent Budget Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time category spending velocity, month-end projections, and AI-powered reallocation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddCatOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            + Add Custom Category
          </button>
          {reallocation && (
            <button
              onClick={() => setIsReallocModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center space-x-2 transition-transform hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Reallocation Proposal</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Inflow</span>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
            {formatINR(summary?.totalIncome)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Allocated Budget</span>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
            {formatINR(summary?.totalAllocatedBudget)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Spent</span>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
            {formatINR(summary?.totalExpenditure)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Remaining</span>
          <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(summary?.totalRemainingBudget)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Savings Target</span>
          <div className="text-base font-extrabold text-teal-600 dark:text-teal-400 mt-1">
            {formatINR(budget?.savingsTarget)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Budget Consumed</span>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
            {summary?.budgetUtilizationPercentage}%
          </div>
        </div>
      </div>

      {/* AI Reallocation Callout Banner */}
      {reallocation && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-900/10 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Intelligent Reallocation Detected
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 font-bold text-emerald-700 dark:text-emerald-300">
                  {reallocation.urgency} Urgency
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                Transfer {formatINR(reallocation.recommendedAmount)} from {reallocation.fromCategoryName} to {reallocation.toCategoryName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {reallocation.reason}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsReallocModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shadow-sm shrink-0 flex items-center space-x-1.5"
          >
            <span>Review & Approve</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Budget Cards Grid (Spec Section 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryMetrics.map((cat: any) => {
          const isOver = cat.status === "EXCEEDED";
          const isWarning = cat.status === "APPROACHING_LIMIT";

          return (
            <div
              key={cat.categoryId}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Category Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {cat.categoryName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                        isOver
                          ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400"
                          : isWarning
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {isOver ? (
                        <>
                          <AlertTriangle className="w-3 h-3 mr-0.5" />
                          <span>Exceeded Limit</span>
                        </>
                      ) : isWarning ? (
                        <>
                          <Clock className="w-3 h-3 mr-0.5" />
                          <span>Approaching Limit</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-0.5" />
                          <span>Healthy</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const original = budget.allocations.find((a: any) => a.categoryId === cat.categoryId);
                    setEditingAlloc(original);
                    setNewAllocAmount(String(cat.allocatedAmount));
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit Allocation"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Bar with accessibility textual indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Spent: {formatINR(cat.spentAmount)}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Allocated: {formatINR(cat.allocatedAmount)}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, cat.percentageConsumed)}%` }}
                    className={`h-full rounded-full transition-all ${
                      isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{cat.percentageConsumed}% consumed</span>
                  <span>{formatINR(cat.remainingAmount)} remaining</span>
                </div>
              </div>

              {/* Velocity & Projection Metrics */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Current Velocity</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatINR(cat.dailyVelocity)} / day
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Month-End Projection</span>
                  <span
                    className={`font-bold ${
                      cat.variance < 0 ? "text-rose-500" : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {formatINR(cat.projectedMonthEndSpend)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Category Modal */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Create Custom Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a new budget category to tailor your financial management.
            </p>

            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care, Hobbies, Donations"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Monthly Allocation (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="100"
                    placeholder="3000"
                    value={newCatAllocation}
                    onChange={(e) => setNewCatAllocation(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCatOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Create & Allocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Allocation Modal */}
      {editingAlloc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Edit {editingAlloc.category?.name} Budget
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update monthly allocated amount for this category.
            </p>

            <form onSubmit={handleUpdateAllocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Allocated Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="100"
                    required
                    value={newAllocAmount}
                    onChange={(e) => setNewAllocAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAlloc(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reallocation Approval Modal */}
      {reallocation && isReallocModalOpen && (
        <ReallocationModal
          isOpen={isReallocModalOpen}
          onClose={() => setIsReallocModalOpen(false)}
          onSuccess={() => {
            setIsReallocModalOpen(false);
            fetchBudgetData();
            fetchReallocationSuggestion();
          }}
          recommendation={reallocation}
        />
      )}
    </div>
  );
}
