"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { formatINR } from "@/lib/constants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recommendation: {
    fromCategoryId: string;
    fromCategoryName: string;
    toCategoryId: string;
    toCategoryName: string;
    recommendedAmount: number;
    reason: string;
    impactAnalysis: string;
    recommendationId?: string;
  };
}

export default function ReallocationModal({ isOpen, onClose, onSuccess, recommendation }: Props) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !recommendation) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/budgets/reallocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCategoryId: recommendation.fromCategoryId,
          toCategoryId: recommendation.toCategoryId,
          amount: recommendation.recommendedAmount,
          reason: recommendation.reason,
          recommendationId: recommendation.recommendationId,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to execute reallocation.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Budget Reallocation Proposal
            </h3>
            <p className="text-[11px] text-slate-500">Requires explicit user confirmation</p>
          </div>
        </div>

        {/* Transfer Visual Card */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              From Surplus
            </span>
            <div className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {recommendation.fromCategoryName}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Healthy Margin
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {formatINR(recommendation.recommendedAmount)}
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              To Deficit
            </span>
            <div className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {recommendation.toCategoryName}
            </div>
            <span className="text-[11px] text-rose-500 font-medium">
              High Velocity
            </span>
          </div>
        </div>

        {/* Rationale & Impact */}
        <div className="mt-4 space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="block text-slate-900 dark:text-white mb-1">Why this is recommended:</strong>
            {recommendation.reason}
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 leading-relaxed">
            <strong className="block text-emerald-900 dark:text-emerald-200 mb-1">Impact Analysis:</strong>
            {recommendation.impactAnalysis}
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>This moves allocated budget limits only; no bank balances or actual transactions are affected.</span>
          </div>
        </div>

        {/* Approval buttons */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-md shadow-emerald-600/30 flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? "Reallocating..." : "Approve Reallocation"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
