"use client";

import React from "react";
import {
  Database,
  Cpu,
  Brain,
  Lightbulb,
  RefreshCw,
  ArrowDown,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface Props {
  data?: {
    txCount?: number;
    totalIncome?: number;
    categoryCount?: number;
    subCount?: number;
    velocity?: number;
    healthScore?: number;
    projectedSpend?: number;
    userRole?: string;
    patternCount?: number;
    recommendationCount?: number;
    feedbackCount?: number;
  };
}

export default function IntelligencePipelineCard({ data }: Props) {
  const txCount = data?.txCount || 14;
  const totalIncome = data?.totalIncome ? `₹${data.totalIncome.toLocaleString("en-IN")}` : "₹85,000";
  const velocity = data?.velocity ? `₹${Math.round(data.velocity).toLocaleString("en-IN")}/day` : "₹467/day";
  const healthScore = data?.healthScore || 82;
  const userRole = data?.userRole === "STUDENT" ? "College Student" : "Working Professional";
  const recommendationCount = data?.recommendationCount ?? 1;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Heart of Fin-Lit</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Fin-Lit Intelligence Architecture
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Feedback Loop</span>
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        How financial data flows through our 5-layer intelligence pipeline to generate mathematically safe, personalized recommendations.
      </p>

      {/* 5-Layer Stack Diagram */}
      <div className="space-y-2 pt-2">
        {/* Layer 1: Financial Data */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 transition-all hover:border-slate-700 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  Layer 1
                </span>
                <h3 className="font-bold text-sm text-white">Financial Data</h3>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              <span className="font-mono font-semibold text-white">{txCount}</span> Transactions &bull; <span className="font-mono text-emerald-400">{totalIncome}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Ingestion & normalization &bull; Transactions &bull; Income &bull; Budgets &bull; Subscriptions
          </p>
        </div>

        {/* Down Arrow Connector */}
        <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Layer 2: Financial Analytics Engine */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-white transition-all hover:border-emerald-500/50 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Layer 2
                </span>
                <h3 className="font-bold text-sm text-emerald-200">Financial Analytics Engine</h3>
              </div>
            </div>
            <div className="text-right text-[11px] text-emerald-300 font-mono">
              Velocity: {velocity} &bull; Score: {healthScore}/100
            </div>
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-2">
            Deterministic calculations &bull; Merchant categorization &bull; Month-end velocity forecasting &bull; Surplus/deficit detection
          </p>
        </div>

        {/* Down Arrow Connector */}
        <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Layer 3: Personalized AI Intelligence */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-white transition-all hover:border-indigo-500/50 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Layer 3
                </span>
                <h3 className="font-bold text-sm text-indigo-200">Personalized AI Intelligence</h3>
              </div>
            </div>
            <div className="text-right text-[11px] text-indigo-300">
              Profile: <span className="font-semibold text-white">{userRole}</span>
            </div>
          </div>
          <p className="text-[11px] text-indigo-400/80 mt-2">
            User context integration &bull; Behavioural patterns (weekend spikes, micro-spends) &bull; Grounded financial reasoning
          </p>
        </div>

        {/* Down Arrow Connector */}
        <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Layer 4: Actionable Recommendations */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-white transition-all hover:border-amber-500/50 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Layer 4
                </span>
                <h3 className="font-bold text-sm text-amber-200">Actionable Recommendations</h3>
              </div>
            </div>
            <div className="text-right text-[11px] text-amber-300 font-semibold">
              {recommendationCount} Pending Action
            </div>
          </div>
          <p className="text-[11px] text-amber-400/80 mt-2">
            Budget reallocation alerts &bull; Savings boost opportunities &bull; Unplanned spending adjustments &bull; Affordability checks
          </p>
        </div>

        {/* Down Arrow Connector */}
        <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Layer 5: User Feedback & Learning */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 transition-all hover:border-slate-700 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                  Layer 5
                </span>
                <h3 className="font-bold text-sm text-white">User Feedback & Learning</h3>
              </div>
            </div>
            <div className="text-right text-[11px] text-teal-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Continuous Adaptation</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Accepted suggestions &bull; User corrections &bull; Category preference memory &bull; Closed-loop personalization
          </p>
        </div>
      </div>
    </div>
  );
}
