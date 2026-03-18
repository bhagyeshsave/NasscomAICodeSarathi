import { useState, useEffect } from "react";
import { ArrowRightLeft, RefreshCcw, TrendingUp } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { getCurrencyLabel, CURRENCIES } from "../../lib/currencies";

interface Rates {
  [key: string]: number;
}

export default function CurrencyConverterView() {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [rates, setRates] = useState<Rates>({});
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        // Using a free open API requiring no key
        const response = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
        // Filter out currencies not in our curated list of world accepted countries
        const apiRates = response.data.rates;
        const filteredRates = Object.keys(apiRates)
          .filter(code => code in CURRENCIES)
          .reduce((obj, key) => {
            obj[key] = apiRates[key];
            return obj;
          }, {} as Rates);

        setRates(filteredRates);
        setCurrencies(Object.keys(filteredRates).sort());
        setLastUpdated(response.data.date);
      } catch (error) {
        console.error("Failed to fetch rates", error);
        // Fallback rates if offline/failed
        setRates({ USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.3, INR: 83.2, CAD: 1.35, AUD: 1.53, CNY: 7.2 });
        setCurrencies(["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "CNY"]);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const handleAction = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const convert = (val: string, from: string, to: string) => {
    if (!rates[from] || !rates[to]) return "0.00";
    const amountNum = parseFloat(val) || 0;
    const result = (amountNum / rates[from]) * rates[to];
    return result.toFixed(2);
  };

  const convertedAmount = convert(amount, fromCurrency, toCurrency);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] w-full max-w-3xl mx-auto py-10">
      
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-8 md:p-12 relative">
        <div className="absolute top-0 right-0 p-6 flex items-center gap-2 text-sm text-slate-500">
          <TrendingUp className="w-4 h-4 text-brand-500" /> Live Rates
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-slate-800 dark:text-slate-100">Live Currency</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10">Real-time exchange rates. {lastUpdated && `Last updated: ${lastUpdated}`}</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCcw className="w-10 h-10 text-brand-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-4xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* From Currency */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">From</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full p-4 text-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none cursor-pointer dark:text-white"
                >
                  {currencies.map((cur) => (
                    <option key={cur} value={cur}>{getCurrencyLabel(cur)}</option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <motion.button
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAction}
                className="mt-6 p-4 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full hover:bg-brand-200 dark:hover:bg-brand-800/50 transition-colors shrink-0"
              >
                <ArrowRightLeft className="w-6 h-6" />
              </motion.button>

              {/* To Currency */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full p-4 text-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none cursor-pointer dark:text-white"
                >
                  {currencies.map((cur) => (
                    <option key={cur} value={cur}>{getCurrencyLabel(cur)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 text-lg mb-2">
                {amount || "0"} {fromCurrency} =
              </div>
              <div className="text-5xl md:text-7xl font-bold tracking-tight text-brand-600 dark:text-brand-400 break-words">
                {convertedAmount} <span className="text-3xl md:text-5xl font-medium text-slate-400">{toCurrency}</span>
              </div>
              
              <div className="text-sm text-slate-500 dark:text-slate-500 mt-4">
                1 {fromCurrency} = {convert("1", fromCurrency, toCurrency)} {toCurrency}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
