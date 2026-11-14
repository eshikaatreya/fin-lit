"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Target,
  CreditCard,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { formatINR, DEFAULT_CATEGORIES } from "@/lib/constants";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Personal
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [financialExperience, setFinancialExperience] = useState("BEGINNER");

  // Step 2: Occupation Classification
  const [occupationType, setOccupationType] = useState<"STUDENT" | "WORKING_PROFESSIONAL">("WORKING_PROFESSIONAL");

  // Student fields
  const [studentAllowance, setStudentAllowance] = useState("12000");
  const [allowanceSource, setAllowanceSource] = useState("PARENTS");
  const [allowanceFrequency, setAllowanceFrequency] = useState("MONTHLY");
  const [studentAdditionalIncome, setStudentAdditionalIncome] = useState("0");
  const [accommodationCovered, setAccommodationCovered] = useState("PARTIAL");

  // Professional fields
  const [profession, setProfession] = useState("Software Engineer");
  const [employmentType, setEmploymentType] = useState("FULL_TIME");
  const [takeHomeSalary, setTakeHomeSalary] = useState("75000");
  const [profAdditionalIncome, setProfAdditionalIncome] = useState("0");
  const [salaryFrequency, setSalaryFrequency] = useState("MONTHLY");

  // Step 3: Savings Goals
  const [savingsMode, setSavingsMode] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [savingsPercentage, setSavingsPercentage] = useState("20");
  const [fixedSavingsAmount, setFixedSavingsAmount] = useState("15000");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Emergency Reserve",
    "Gadgets & Tech",
    "Travel & Vacation",
  ]);

  // Step 4: Recurring Commitments
  const [commitments, setCommitments] = useState<Array<{ name: string; amount: number }>>([
    { name: "Rent / Mess", amount: 18000 },
    { name: "Broadband Wi-Fi", amount: 999 },
    { name: "Mobile Recharge", amount: 299 },
  ]);
  const [newCommitName, setNewCommitName] = useState("");
  const [newCommitAmount, setNewCommitAmount] = useState("");

  // Step 5: Initial Budget
  const [budgetType, setBudgetType] = useState<"AI_RECOMMENDED" | "MANUAL">("AI_RECOMMENDED");

  const effectiveIncome =
    occupationType === "STUDENT"
      ? parseFloat(studentAllowance) || 12000
      : parseFloat(takeHomeSalary) || 75000;

  const effectiveSavingsTarget =
    savingsMode === "PERCENTAGE"
      ? Math.round((effectiveIncome * (parseFloat(savingsPercentage) || 20)) / 100)
      : parseFloat(fixedSavingsAmount) || 15000;

  const discretionaryPool = Math.max(0, effectiveIncome - effectiveSavingsTarget);

  const handleAddCommitment = () => {
    if (newCommitName && newCommitAmount) {
      setCommitments((prev) => [
        ...prev,
        { name: newCommitName, amount: parseFloat(newCommitAmount) },
      ]);
      setNewCommitName("");
      setNewCommitAmount("");
    }
  };

  const handleFinishOnboarding = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          age,
          mobileNumber,
          financialExperience,
          occupationType,
          monthlyIncome: effectiveIncome,
          additionalIncome:
            occupationType === "STUDENT"
              ? parseFloat(studentAdditionalIncome) || 0
              : parseFloat(profAdditionalIncome) || 0,
          salaryFrequency: occupationType === "STUDENT" ? allowanceFrequency : salaryFrequency,
          occupationDetails: {
            allowanceSource,
            accommodationCovered,
            profession,
            employmentType,
          },
          monthlySavingsTarget: effectiveSavingsTarget,
          savingsTargetType: savingsMode,
          savingsGoals: selectedGoals.map((name) => ({
            name,
            targetAmount: Math.round(effectiveIncome * 2.5),
            category: name.includes("Emergency") ? "EMERGENCY" : "OTHER",
          })),
          commitments,
          budgetPreference: budgetType,
        }),
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        const err = await res.json();
        alert(err.error || "Failed to complete onboarding.");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Onboarding Container */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-6">
        {/* Step Progress Tracker */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Step {step} of 5</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {step === 1 && "Personal Information"}
              {step === 2 && "Occupation & Income"}
              {step === 3 && "Savings Goals"}
              {step === 4 && "Monthly Commitments"}
              {step === 5 && "Initial Budget Allocation"}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${(step / 5) * 100}%` }}
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* STEP 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Let&rsquo;s start with the basics
              </h2>
              <p className="text-xs text-slate-500">
                Fin-Lit personalizes all intelligence and benchmarks strictly to your profile.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Financial Experience
                  </label>
                  <select
                    value={financialExperience}
                    onChange={(e) => setFinancialExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BEGINNER">Beginner (Starting fresh)</option>
                    <option value="INTERMEDIATE">Intermediate (Track expenses)</option>
                    <option value="ADVANCED">Advanced (Active investor)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Occupation Classification */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                What best describes you?
              </h2>
              <p className="text-xs text-slate-500">
                Fin-Lit creates tailored budget structures for students vs working professionals.
              </p>
            </div>

            {/* Two Primary Options */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOccupationType("STUDENT")}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  occupationType === "STUDENT"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Student</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Managing monthly allowance, hostel, canteen, and studies.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setOccupationType("WORKING_PROFESSIONAL")}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  occupationType === "WORKING_PROFESSIONAL"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Working Professional</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Managing salary, rent, investments, and household commitments.
                </p>
              </button>
            </div>

            {/* Conditional Questions */}
            {occupationType === "STUDENT" ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Allowance (₹ INR) *
                  </label>
                  <input
                    type="number"
                    value={studentAllowance}
                    onChange={(e) => setStudentAllowance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Source of Allowance
                    </label>
                    <select
                      value={allowanceSource}
                      onChange={(e) => setAllowanceSource(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      <option value="PARENTS">Parents / Guardians</option>
                      <option value="SCHOLARSHIP">Scholarship / Fellowship</option>
                      <option value="PART_TIME">Part-time Work / Intern</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Accommodation & Food
                    </label>
                    <select
                      value={accommodationCovered}
                      onChange={(e) => setAccommodationCovered(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      <option value="FULLY_COVERED">Hostel/Room fully covered</option>
                      <option value="PARTIAL">Partially covered (Need mess)</option>
                      <option value="SELF">Self-funded rent & food</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Take-Home Salary (₹ INR) *
                  </label>
                  <input
                    type="number"
                    value={takeHomeSalary}
                    onChange={(e) => setTakeHomeSalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Profession / Industry
                    </label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      <option value="FULL_TIME">Full-Time Employee</option>
                      <option value="FREELANCE">Freelancer / Contract</option>
                      <option value="BUSINESS">Self-Employed / Business</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Savings Goals */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                How much would you like to save each month?
              </h2>
              <p className="text-xs text-slate-500">
                Fin-Lit treats your savings target as a non-negotiable priority before calculating your discretionary budget.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSavingsMode("PERCENTAGE")}
                className={`p-3 rounded-xl border text-xs font-semibold text-left ${
                  savingsMode === "PERCENTAGE"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Percentage of Income (e.g. 20%)
              </button>
              <button
                type="button"
                onClick={() => setSavingsMode("FIXED")}
                className={`p-3 rounded-xl border text-xs font-semibold text-left ${
                  savingsMode === "FIXED"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Fixed Amount (e.g. ₹15,000)
              </button>
            </div>

            <div>
              {savingsMode === "PERCENTAGE" ? (
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Target: {savingsPercentage}% of income</span>
                    <span className="text-emerald-600 font-bold">{formatINR(effectiveSavingsTarget)} / mo</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={savingsPercentage}
                    onChange={(e) => setSavingsPercentage(e.target.value)}
                    className="w-full accent-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fixed Monthly Savings (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={fixedSavingsAmount}
                    onChange={(e) => setFixedSavingsAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold"
                  />
                </div>
              )}
            </div>

            {/* Select Savings Milestones */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                What are you saving for? (Select any)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  "Emergency Reserve",
                  "Gadgets & Tech",
                  "Travel & Vacation",
                  "Education / Course",
                  "Vehicle / Car",
                  "Long-Term Investments",
                ].map((g) => {
                  const isChecked = selectedGoals.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedGoals(selectedGoals.filter((x) => x !== g));
                        } else {
                          setSelectedGoals([...selectedGoals, g]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left font-medium transition-colors ${
                        isChecked
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {isChecked ? "✓ " : "+ "}
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Monthly Commitments */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Monthly Financial Commitments
              </h2>
              <p className="text-xs text-slate-500">
                Enter your fixed recurring bills so Fin-Lit protects them before everyday spending.
              </p>
            </div>

            <div className="space-y-2">
              {commitments.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(c.amount)}</span>
                    <button
                      type="button"
                      onClick={() => setCommitments(commitments.filter((_, idx) => idx !== i))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new commitment */}
            <div className="flex items-center space-x-2 text-xs">
              <input
                type="text"
                placeholder="Commitment name (e.g. Gym, Electricity)"
                value={newCommitName}
                onChange={(e) => setNewCommitName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              />
              <input
                type="number"
                placeholder="₹ Amount"
                value={newCommitAmount}
                onChange={(e) => setNewCommitAmount(e.target.value)}
                className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold"
              />
              <button
                type="button"
                onClick={handleAddCommitment}
                className="px-3 py-2 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700"
              >
                + Add
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Initial Budget Configuration */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Initial Budget Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Choose how you want your discretionary pool of{" "}
                <strong className="text-emerald-600 font-bold">{formatINR(discretionaryPool)}</strong> divided across categories.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBudgetType("AI_RECOMMENDED")}
                className={`p-3.5 rounded-2xl border-2 text-left ${
                  budgetType === "AI_RECOMMENDED"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Recommended Allocation</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Calculated using proven Indian fintech benchmarks tailored for {occupationType === "STUDENT" ? "Students" : "Working Professionals"}.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBudgetType("MANUAL")}
                className={`p-3.5 rounded-2xl border-2 text-left ${
                  budgetType === "MANUAL"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                  Manual Allocation
                </div>
                <p className="text-[11px] text-slate-500">
                  Customize individual category limits yourself directly in the budget dashboard.
                </p>
              </button>
            </div>

            {/* AI Preview breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span>Category</span>
                <span>Calculated Initial Budget</span>
              </div>
              {DEFAULT_CATEGORIES.slice(0, 6).map((c) => {
                const pct =
                  occupationType === "STUDENT"
                    ? c.suggestedPercentage.student
                    : c.suggestedPercentage.professional;
                const amt = Math.round((discretionaryPool * pct) / 100);

                return (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{c.name}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatINR(amt)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              disabled={step === 1 && (!fullName || !email)}
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-600/30 flex items-center space-x-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinishOnboarding}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shadow-md flex items-center space-x-1.5"
            >
              <span>{submitting ? "Launching Fin-Lit..." : "Complete Setup & Launch"}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
