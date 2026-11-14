"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { formatINR } from "@/lib/constants";

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFundsGoal, setAddFundsGoal] = useState<any>(null);
  const [addFundsAmount, setAddFundsAmount] = useState("");

  // Create form
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("EMERGENCY");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/savings-goals");
      if (res.ok) {
        const json = await res.json();
        setGoals(json.goals || []);
        setTotalTarget(json.totalTarget || 0);
        setTotalSaved(json.totalSaved || 0);
        setOverallProgress(json.overallProgress || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetAmount) return;

    try {
      const res = await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: goalName,
          targetAmount: parseFloat(targetAmount),
          category,
          deadline: deadline || null,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setGoalName("");
        setTargetAmount("");
        fetchGoals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFundsGoal || !addFundsAmount) return;

    try {
      const res = await fetch("/api/savings-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addFundsGoal.id,
          addAmount: parseFloat(addFundsAmount),
        }),
      });

      if (res.ok) {
        setAddFundsGoal(null);
        setAddFundsAmount("");
        fetchGoals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Savings Goals & Milestones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build disciplined wealth for emergencies, travel, gadgets, and personal milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Progress Overview */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-navy-900 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
              Cumulative Wealth Progress
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold mt-1">
              {formatINR(totalSaved)} <span className="text-slate-400 text-base font-normal">/ {formatINR(totalTarget)} Target</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {overallProgress}%
            </span>
            <span className="text-xs text-slate-400 block">Overall Target Achieved</span>
          </div>
        </div>

        {/* Aggregate Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
          <div
            style={{ width: `${Math.min(100, overallProgress)}%` }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 animate-pulse">
            Loading savings goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No savings goals established yet. Click &ldquo;New Savings Goal&rdquo; to start!
          </div>
        ) : (
          goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            const isDone = goal.status === "COMPLETED" || progress >= 100;

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {goal.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 block">
                        {goal.category}
                      </span>
                    </div>
                    {isDone ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Achieved</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {progress}% Saved
                      </span>
                    )}
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Saved So Far</span>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatINR(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Target</span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, progress)}%` }}
                      className={`h-full rounded-full transition-all ${
                        isDone ? "bg-emerald-500" : "bg-emerald-600"
                      }`}
                    />
                  </div>
                </div>

                {/* Card footer action */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {formatINR(Math.max(0, goal.targetAmount - goal.currentAmount))} to go
                  </span>
                  <button
                    onClick={() => {
                      setAddFundsGoal(goal);
                      setAddFundsAmount("");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                  >
                    + Add Funds
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Funds Modal */}
      {addFundsGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Add Funds to &ldquo;{addFundsGoal.name}&rdquo;
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Allocate money towards this milestone.
            </p>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount to Add (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="100"
                    required
                    placeholder="2000"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddFundsGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Deposit to Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Create Savings Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, Goa Trip, MacBook"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Amount (₹ INR) *
                </label>
                <input
                  type="number"
                  step="500"
                  required
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="EMERGENCY">Emergency Fund</option>
                  <option value="TRAVEL">Travel & Vacations</option>
                  <option value="GADGETS">Gadgets & Tech</option>
                  <option value="EDUCATION">Education & Career</option>
                  <option value="INVESTMENTS">Investments</option>
                  <option value="OTHER">Other Personal Goal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm font-semibold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
