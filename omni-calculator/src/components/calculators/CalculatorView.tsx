import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import * as math from "mathjs";
import { Copy, RotateCcw, FunctionSquare } from "lucide-react";
import { cn } from "../../lib/utils";

const STANDARD_PAD = [
  "C", "(", ")", "÷",
  "7", "8", "9", "×",
  "4", "5", "6", "-",
  "1", "2", "3", "+",
  "0", ".", "⌫", "="
];

const SCITILIFIC_PAD = [
  "sin", "cos", "tan", "log", "ln",
  "sin⁻¹", "cos⁻¹", "tan⁻¹", "e", "π",
  "^", "√", "!", "%", "mod"
];

export default function CalculatorView() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [isScientific, setIsScientific] = useState(false);
  const [history, setHistory] = useState<{ expr: string; res: string }[]>([]);

  const handleInput = useCallback((val: string) => {
    if (val === "C") {
      setExpression("");
      setResult("");
      return;
    }
    if (val === "⌫") {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }
    if (val === "=") {
      try {
        if (!expression) return;
        // Basic replacements for evaluation
        let formattedExpr = expression
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/π/g, "pi")
          .replace(/sin⁻¹/g, "asin")
          .replace(/cos⁻¹/g, "acos")
          .replace(/tan⁻¹/g, "atan")
          .replace(/√/g, "sqrt");

        const evaluated = math.evaluate(formattedExpr);
        let formattedResult = math.format(evaluated, { precision: 14 }).toString();
        // Add thousands separator if it's a valid number
        if (!isNaN(Number(formattedResult))) {
           const parts = formattedResult.split(".");
           parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
           formattedResult = parts.join(".");
        }
        setResult(formattedResult);
        setHistory(prev => [{ expr: expression, res: formattedResult }, ...prev].slice(0, 10));
      } catch (err) {
        setResult("Error");
      }
      return;
    }

    setExpression((prev) => {
      const isOperator = ["+", "-", "×", "÷", "^", "mod"].includes(val);
      const isLastCharOperator = ["+", "-", "×", "÷", "^", "mod"].includes(prev.slice(-1));
      
      // Prevent starting with an operator (except minus for negative numbers)
      if (prev === "" && isOperator && val !== "-") {
        return prev;
      }

      // If the last character is an operator and the new input is an operator, replace it
      if (isLastCharOperator && isOperator) {
        return prev.slice(0, -1) + val;
      }

      // Prevent adding multiple decimals in the same number sequence
      if (val === ".") {
        const parts = prev.split(/[-+×÷^]|mod/);
        const currentNumber = parts[parts.length - 1];
        if (currentNumber.includes(".")) {
          return prev;
        }
      }

      return prev + val;
    });
  }, [expression]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleInput("=");
      } else if (key === "Backspace") {
        e.preventDefault();
        handleInput("⌫");
      } else if (key === "Escape") {
        e.preventDefault();
        handleInput("C");
      } else if (/^[0-9+\-*/().^%]$/.test(key)) {
        e.preventDefault();
        let mappedKey = key;
        if (key === "*") mappedKey = "×";
        if (key === "/") mappedKey = "÷";
        handleInput(mappedKey);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput]);

  const copyToClipboard = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-8rem)] xl:h-full w-full max-w-5xl mx-auto items-start">
      
      {/* Calculator Container */}
      <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-full max-h-[800px]">
        {/* Top Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setIsScientific(false)}
              className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", !isScientific ? "bg-white dark:bg-slate-700 shadow shadow-sm text-brand-600 dark:text-brand-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              Standard
            </button>
            <button 
              onClick={() => setIsScientific(true)}
              className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2", isScientific ? "bg-white dark:bg-slate-700 shadow shadow-sm text-brand-600 dark:text-brand-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              <FunctionSquare className="w-4 h-4" />
              Scientific
            </button>
          </div>
          <button onClick={copyToClipboard} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Copy Result">
            <Copy className="w-5 h-5" />
          </button>
        </div>

        {/* Display */}
        <div className="px-8 py-10 flex flex-col items-end justify-end h-48 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-slate-500 dark:text-slate-400 text-2xl h-8 tracking-widest font-mono overflow-x-auto w-full text-right no-scrollbar whitespace-nowrap">
            {expression || "0"}
          </div>
          <div className={cn("text-6xl font-bold tracking-tight mt-2 w-full text-right overflow-x-auto no-scrollbar", result === "Error" ? "text-red-500" : "text-slate-800 dark:text-slate-100")}>
            {result || "="}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-6 bg-white dark:bg-slate-900 flex-1 grid grid-cols-4 md:grid-cols-5 xl:grid-cols-4 gap-3 lg:gap-4 overflow-y-auto w-full">
          {/* Scientific block only visible if toggled, on wider screens it could always show but let's keep it toggleable or reflow */}
          {isScientific && SCITILIFIC_PAD.map((btn) => (
             <motion.button
               whileTap={{ scale: 0.95 }}
               key={"sci-" + btn}
               onClick={() => handleInput(btn)}
               className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-xl lg:rounded-2xl p-4 md:p-5 text-lg font-semibold flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
             >
               {btn}
             </motion.button>
          ))}

          {STANDARD_PAD.map((btn) => {
            const isOp = ["÷", "×", "-", "+", "="].includes(btn);
            const isAction = ["C", "⌫"].includes(btn);
            const isParen = ["(", ")"].includes(btn);
            return (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={"std-" + btn}
                onClick={() => handleInput(btn)}
                className={cn(
                  "rounded-xl lg:rounded-2xl p-4 md:p-5 text-2xl md:text-3xl font-medium flex items-center justify-center transition-colors shadow-sm",
                  isOp ? "bg-brand-500 text-white hover:bg-brand-600" 
                  : isAction ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  : isParen ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
                  btn === "=" && "col-span-2 sm:col-span-1"
                )}
              >
                {btn}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* History Panel - Hidden on mobile, visible on lg screens as side panel or reflow to bottom */}
      <div className="hidden xl:flex w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex-col h-full max-h-[800px] overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-slate-100 dark:border-slate-800">
          <RotateCcw className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">History</h2>
          <button onClick={() => setHistory([])} className="ml-auto text-sm text-brand-600 dark:text-brand-400 hover:underline">Clear</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 dark:text-slate-500 mt-10">No history yet</div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors" onClick={() => setExpression(item.expr)}>
                <div className="text-slate-500 dark:text-slate-400 text-right text-sm mb-1">{item.expr}</div>
                <div className="text-slate-800 dark:text-slate-100 text-right text-lg font-bold">={item.res}</div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
