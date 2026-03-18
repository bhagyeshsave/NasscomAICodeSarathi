import { useState, useMemo } from "react";
import { DollarSign, Landmark, PieChart, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { CURRENCIES, getCurrencySymbol, getCurrencyLabel } from "../../lib/currencies";

type FinanceTab = "emi" | "mortgage" | "simple" | "compound";

export default function FinanceCalculatorView() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("emi");

  // State for inputs
  const [currency, setCurrency] = useState("USD");
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("5");
  const [time, setTime] = useState("12"); // Months or Years depending on tab
  const [downPayment, setDownPayment] = useState("2000"); // for mortgage
  const [compoundingFreq, setCompoundingFreq] = useState("12"); // for compound

  const TABS = [
    { id: "emi", label: "EMI", icon: DollarSign },
    { id: "mortgage", label: "Mortgage", icon: Landmark },
    { id: "simple", label: "Simple Interest", icon: TrendingUp },
    { id: "compound", label: "Compound", icon: PieChart },
  ] as const;

  const results = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const R = parseFloat(rate) || 0;
    const T = parseFloat(time) || 0;
    const D = parseFloat(downPayment) || 0;
    const N = parseFloat(compoundingFreq) || 12;

    switch (activeTab) {
      case "emi": {
        // P * R * (1+R)^N / ((1+R)^N - 1)
        const montlyRate = R / 100 / 12;
        const totalMonths = T;
        let emi = 0;
        let totalVal = P;
        if (montlyRate === 0) {
          emi = P / totalMonths;
        } else if (totalMonths > 0) {
          const factor = Math.pow(1 + montlyRate, totalMonths);
          emi = (P * montlyRate * factor) / (factor - 1);
          totalVal = emi * totalMonths;
        }
        return {
          payable: emi.toFixed(2),
          label: "Monthly EMI",
          secondary: [
            { label: "Total Interest", val: (totalVal - P).toFixed(2) },
            { label: "Total Payable", val: totalVal.toFixed(2) }
          ]
        };
      }
      case "mortgage": {
        const loanAmt = Math.max(0, P - D);
        const montlyRate = R / 100 / 12;
        const totalMonths = T * 12; // Time in years for mortgage
        let monthly = 0;
        let totalVal = loanAmt;
        if (montlyRate === 0) {
          monthly = loanAmt / totalMonths;
        } else if (totalMonths > 0) {
          const factor = Math.pow(1 + montlyRate, totalMonths);
          monthly = (loanAmt * montlyRate * factor) / (factor - 1);
          totalVal = monthly * totalMonths;
        }
        return {
          payable: monthly.toFixed(2),
          label: "Monthly Payment",
          secondary: [
            { label: "Loan Amount", val: loanAmt.toFixed(2) },
            { label: "Total Interest", val: (totalVal - loanAmt).toFixed(2) }
          ]
        };
      }
      case "simple": {
        // P * R * T / 100 (Time in Years)
        const interest = (P * R * T) / 100;
        const total = P + interest;
        return {
          payable: interest.toFixed(2),
          label: "Total Interest",
          secondary: [
            { label: "Principal", val: P.toFixed(2) },
            { label: "Total Value", val: total.toFixed(2) }
          ]
        };
      }
      case "compound": {
        // P (1 + r/n)^(nt) (Time in Years)
        const decRate = R / 100;
        const amount = P * Math.pow(1 + decRate / N, N * T);
        const interest = amount - P;
        return {
          payable: amount.toFixed(2),
          label: "Total Value",
          secondary: [
            { label: "Principal", val: P.toFixed(2) },
            { label: "Compound Interest", val: interest.toFixed(2) }
          ]
        };
      }
      default:
        return { payable: "0.00", label: "Result", secondary: [] };
    }
  }, [activeTab, principal, rate, time, downPayment, compoundingFreq]);

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-8rem)] w-full max-w-4xl mx-auto py-10 gap-8">
      
      {/* Top Tabs */}
      <div className="flex gap-2 w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FinanceTab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all min-w-[140px]",
              activeTab === tab.id
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md transform scale-[1.02]"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row shadow-brand-500/5">
        
        {/* Form Area */}
        <div className="flex-1 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-slate-100">
                  {TABS.find(t => t.id === activeTab)?.label} Calculator
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Enter your details to calculate.</p>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="py-2 pl-3 pr-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white text-sm cursor-pointer max-w-sm"
                  >
                    {Object.keys(CURRENCIES).map(c => (
                      <option key={c} value={c} className="text-slate-900">{getCurrencyLabel(c)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Form Inputs */}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {activeTab === "mortgage" ? "Property Price / Total Cost" : "Principal Amount"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{getCurrencySymbol(currency)}</span>
                    <input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="w-full pl-8 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white font-mono text-lg"
                    />
                  </div>
                </div>

                {activeTab === "mortgage" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Down Payment
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{getCurrencySymbol(currency)}</span>
                      <input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        className="w-full pl-8 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white font-mono text-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 flex-col sm:flex-row">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Interest Rate {activeTab === "emi" ? "(Yearly %)" : "(%)"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="w-full pl-4 pr-8 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white font-mono text-lg"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Time / Tenure
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-4 pr-16 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white font-mono text-lg"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                        {activeTab === "emi" ? "Months" : "Years"}
                      </span>
                    </div>
                  </div>
                </div>

                {activeTab === "compound" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Compounding Frequency
                    </label>
                    <select
                      value={compoundingFreq}
                      onChange={(e) => setCompoundingFreq(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white cursor-pointer"
                    >
                      <option value="1">Annually (1/yr)</option>
                      <option value="2">Semi-Annually (2/yr)</option>
                      <option value="4">Quarterly (4/yr)</option>
                      <option value="12">Monthly (12/yr)</option>
                      <option value="365">Daily (365/yr)</option>
                    </select>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Results Area */}
        <div className="w-full lg:w-96 bg-brand-50/50 dark:bg-slate-800/30 p-8 md:p-12 flex flex-col justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-brand-100 dark:border-brand-900/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 relative z-10">
              {results.label}
            </p>
            <div className="text-4xl lg:text-5xl font-extrabold text-brand-600 dark:text-brand-400 tracking-tight break-words relative z-10 font-mono">
              {getCurrencySymbol(currency)}{results.payable}
            </div>

            <div className="mt-8 space-y-4 relative z-10">
              {results.secondary.map((sec, idx) => (
                <div key={idx} className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{sec.label}</span>
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono">{getCurrencySymbol(currency)}{sec.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
