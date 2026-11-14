"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  Download,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Lock,
  Save,
  HelpCircle,
} from "lucide-react";
import { formatINR } from "@/lib/constants";

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [age, setAge] = useState("");
  const [financialExperience, setFinancialExperience] = useState("INTERMEDIATE");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlySavingsTarget, setMonthlySavingsTarget] = useState("");
  const [riskTolerance, setRiskTolerance] = useState("MODERATE");
  const [aiConsentGiven, setAiConsentGiven] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        setUserData(json);
        const u = json.user;
        if (u) {
          setFullName(u.fullName || "");
          setMobileNumber(u.mobileNumber || "");
          setAge(u.age ? String(u.age) : "");
          setFinancialExperience(u.financialExperience || "INTERMEDIATE");
          setMonthlyIncome(u.userProfile?.monthlyIncome ? String(u.userProfile.monthlyIncome) : "");
          setMonthlySavingsTarget(
            u.financialProfile?.monthlySavingsTarget ? String(u.financialProfile.monthlySavingsTarget) : ""
          );
          setRiskTolerance(u.financialProfile?.riskTolerance || "MODERATE");
          setAiConsentGiven(u.financialProfile?.aiConsentGiven ?? true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          mobileNumber,
          age,
          financialExperience,
          monthlyIncome,
          monthlySavingsTarget,
          riskTolerance,
          aiConsentGiven,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  const u = userData?.user;
  const paymentSources = userData?.paymentSources || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Profile & Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, monthly income benchmarks, financial preferences, and privacy controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Personal Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={u?.email || ""}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Occupation
              </label>
              <input
                type="text"
                disabled
                value={u?.userProfile?.occupationType === "STUDENT" ? "College Student" : "Working Professional"}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Financial Experience
              </label>
              <select
                value={financialExperience}
                onChange={(e) => setFinancialExperience(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Preferences Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Financial & Inflow Benchmarks
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Take-Home / Allowance (₹)
              </label>
              <input
                type="number"
                step="500"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Savings Target (₹)
              </label>
              <input
                type="number"
                step="500"
                value={monthlySavingsTarget}
                onChange={(e) => setMonthlySavingsTarget(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Risk Tolerance
              </label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CONSERVATIVE">Conservative (Focus on emergency reserve)</option>
                <option value="MODERATE">Moderate (Balanced)</option>
                <option value="AGGRESSIVE">Aggressive (High equity/growth)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Connected UPI & Payment Accounts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Connected Payment Sources (UPI & Banking)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {paymentSources.map((ps: any) => (
              <div
                key={ps.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{ps.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Type: {ps.type} {ps.lastFour ? `(ending ${ps.lastFour})` : ""}
                  </div>
                </div>
                {ps.isDefault && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security, Privacy & Data Export (Spec Section 15) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Security, Privacy & Data Portability
            </h2>
          </div>

          <div className="flex items-start space-x-3 text-xs">
            <input
              type="checkbox"
              id="aiConsent"
              checked={aiConsentGiven}
              onChange={(e) => setAiConsentGiven(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-emerald-500 rounded"
            />
            <label htmlFor="aiConsent" className="text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Enable AI Financial Reasoning on aggregated category metrics</strong>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Fin-Lit only transmits aggregated category totals for natural language reasoning. UPI PINs, bank credentials, and raw PII are never collected or sent.
              </span>
            </label>
          </div>

          {/* Export Data Button */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Data Portability</div>
              <div className="text-[11px] text-slate-500">
                Download a complete, structured JSON export of all your transactions, budgets, goals, and history.
              </div>
            </div>
            <a
              href="/api/settings/export"
              download
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Data (JSON)</span>
            </a>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end space-x-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-md shadow-emerald-600/30 flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
