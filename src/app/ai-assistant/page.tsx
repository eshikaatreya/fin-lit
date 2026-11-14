"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import { formatINR } from "@/lib/constants";
import ReallocationModal from "@/components/common/ReallocationModal";
import IntelligencePipelineCard from "@/components/common/IntelligencePipelineCard";

const SUGGESTED_QUERIES = [
  "Can I afford to purchase something worth ₹2,500?",
  "How much did I spend today?",
  "How much did I spend on food this month?",
  "Which category is consuming most of my money?",
  "How much money can I safely spend this week?",
  "How much have I saved this month?",
  "Which subscriptions are costing me the most?",
  "Suggest a budget reallocation",
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: any;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeReallocation, setActiveReallocation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Affordability Calculator state
  const [testAmount, setTestAmount] = useState("");
  const [affordResult, setAffordResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: `Hello! I am **Fin-Lit AI**, your personal financial intelligence advisor.

I have direct access to your verified transactions, active budgets, velocity metrics, and subscriptions.

You can ask me questions about your spending, test if you can afford upcoming purchases, or ask for budget rebalancing recommendations. What would you like to explore today?`,
        metadata: {
          suggestedActions: [
            "Can I afford ₹2,000?",
            "How much did I spend on food?",
            "Suggest a budget reallocation",
          ],
        },
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.message;
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: reply.content,
            metadata: reply.metadata,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I encountered an error accessing your financial data. Please try again.",
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${e.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAffordabilityCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(testAmount);
    if (isNaN(amt) || amt <= 0) return;

    setEvaluating(true);
    try {
      const res = await fetch("/api/ai/affordability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      if (res.ok) {
        const data = await res.json();
        setAffordResult(data.assessment);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Personalized Financial Advisor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Fin-Lit AI Assistant
          </h1>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Grounded in Deterministic Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Quick Interactive Tools & Suggested Prompts */}
        <div className="space-y-4 lg:col-span-1 order-2 lg:order-1">
          {/* Quick "Can I Afford It?" Widget */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Instant Affordability Check
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Test an unplanned purchase against your remaining budget and days left.
            </p>

            <form onSubmit={handleAffordabilityCheck} className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={evaluating || !testAmount}
                className="w-full py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
              >
                {evaluating ? "Evaluating..." : "Evaluate Purchase"}
              </button>
            </form>

            {affordResult && (
              <div
                className={`p-3 rounded-xl text-xs space-y-1 border ${
                  affordResult.isAffordable
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                }`}
              >
                <div className="font-bold flex items-center space-x-1.5">
                  {affordResult.isAffordable ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>{affordResult.shortReason}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {affordResult.detailedAnalysis}
                </p>
              </div>
            )}
          </div>

          {/* Suggested Natural Language Queries */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Suggested Queries</span>
            </h2>
            <div className="space-y-1.5">
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-2 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-colors"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col h-[650px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  Fin-Lit AI Financial Advisor
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online & Context-Grounded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white rounded-tr-none font-medium"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60 whitespace-pre-line"
                  }`}
                >
                  {m.content}

                  {/* Reallocation Card inside chat response if recommended */}
                  {m.metadata?.reallocation && (
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-xs text-slate-800 dark:text-slate-200">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive Approval Action</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Transfer {formatINR(m.metadata.reallocation.recommendedAmount)} from{" "}
                        {m.metadata.reallocation.fromCategoryName} to {m.metadata.reallocation.toCategoryName}.
                      </p>
                      <button
                        onClick={() => setActiveReallocation(m.metadata.reallocation)}
                        className="w-full py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Review & Authorize Transfer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-none p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Analyzing financial records and calculating metrics...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask Fin-Lit AI about your spending, budget, or can I afford X..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors shadow-sm shadow-emerald-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fin-Lit Intelligence Architecture Pipeline */}
      <IntelligencePipelineCard />

      {/* Reallocation Modal */}
      {activeReallocation && (
        <ReallocationModal
          isOpen={!!activeReallocation}
          onClose={() => setActiveReallocation(null)}
          onSuccess={() => {
            setActiveReallocation(null);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: "✅ The budget reallocation has been executed and logged. Your updated category allocations are live!",
              },
            ]);
          }}
          recommendation={activeReallocation}
        />
      )}
    </div>
  );
}
