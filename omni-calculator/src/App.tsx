import { useState, useEffect } from "react";
import { Moon, Sun, Calculator, Banknote, Scale, PiggyBank, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "./lib/utils";

import CalculatorView from "./components/calculators/CalculatorView";
import CurrencyConverterView from "./components/calculators/CurrencyConverterView";
import UnitConverterView from "./components/calculators/UnitConverterView";
import FinanceCalculatorView from "./components/calculators/FinanceCalculatorView";

type Tab = "calculator" | "currency" | "units" | "finance";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const tabs = [
    { id: "calculator", label: "Calculator", icon: Calculator },
    { id: "currency", label: "Currency", icon: Banknote },
    { id: "units", label: "Unit Converter", icon: Scale },
    { id: "finance", label: "Finance", icon: PiggyBank },
  ] as const;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 glass lg:bg-transparent lg:border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 lg:border-none">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Calculator className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight">OmniCalc</h1>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as Tab);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "")} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center w-full justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-30">
          <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
            <Menu className="w-6 h-6" />
          </button>
          <div className="font-semibold text-lg">{tabs.find(t => t.id === activeTab)?.label}</div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "calculator" && <CalculatorView />}
              {activeTab === "currency" && <CurrencyConverterView />}
              {activeTab === "units" && <UnitConverterView />}
              {activeTab === "finance" && <FinanceCalculatorView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
