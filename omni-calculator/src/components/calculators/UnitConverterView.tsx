import { useState, useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// Conversion rates relative to base unit
const CONVERSION_DATA: Record<string, { base: string, units: Record<string, number | ((val: number, toBase: boolean) => number)> }> = {
  Length: {
    base: 'Meter',
    units: {
      Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001,
      Mile: 1609.34, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254
    }
  },
  Area: {
    base: 'Square Meter',
    units: {
      'Square Meter': 1, 'Square Kilometer': 1e6, 'Square Centimeter': 1e-4, 'Square Millimeter': 1e-6,
      Hectare: 10000, Acre: 4046.86, 'Square Mile': 2.59e6, 'Square Yard': 0.836127, 'Square Foot': 0.092903, 'Square Inch': 0.00064516
    }
  },
  Weight: {
    base: 'Gram',
    units: {
      Gram: 1, Kilogram: 1000, Milligram: 0.001, MetricTon: 1e6,
      Pound: 453.592, Ounce: 28.3495, Carat: 0.2
    }
  },
  Temperature: {
    base: 'Celsius',
    units: {
      Celsius: 1,
      Fahrenheit: (val, toBase) => toBase ? (val - 32) * 5/9 : (val * 9/5) + 32,
      Kelvin: (val, toBase) => toBase ? val - 273.15 : val + 273.15
    }
  },
  Volume: {
    base: 'Liter',
    units: {
      Liter: 1, Milliliter: 0.001, 'Cubic Meter': 1000,
      Gallon: 3.78541, Quart: 0.946353, Pint: 0.473176, Cup: 0.24, 'Fluid Ounce': 0.0295735
    }
  },
  Speed: {
    base: 'Meter per Second',
    units: {
      'Meter per Second': 1, 'Kilometer per Hour': 0.277778,
      'Mile per Hour': 0.44704, Knot: 0.514444, FootPerSecond: 0.3048
    }
  },
  Time: {
    base: 'Second',
    units: {
      Second: 1, Millisecond: 0.001, Minute: 60, Hour: 3600,
      Day: 86400, Week: 604800, Month: 2.628e+6, Year: 3.154e+7
    }
  },
  'Data Storage': {
    base: 'Byte',
    units: {
      Bit: 0.125, Byte: 1, Kilobyte: 1024, Megabyte: 1048576,
      Gigabyte: 1073741824, Terabyte: 1099511627776, Petabyte: 1.1259e+15
    }
  },
  Energy: {
    base: 'Joule',
    units: {
      Joule: 1, Kilojoule: 1000, Calorie: 4.184, Kilocalorie: 4184,
      WattHour: 3600, KilowattHour: 3.6e6, Electronvolt: 1.6022e-19
    }
  }
};

const CATEGORIES = Object.keys(CONVERSION_DATA);

export default function UnitConverterView() {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [amount, setAmount] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>(
    Object.keys(CONVERSION_DATA[CATEGORIES[0]].units)[0]
  );
  const [toUnit, setToUnit] = useState<string>(
    Object.keys(CONVERSION_DATA[CATEGORIES[0]].units)[1] || Object.keys(CONVERSION_DATA[CATEGORIES[0]].units)[0]
  );

  const units = Object.keys(CONVERSION_DATA[category].units);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const newUnits = Object.keys(CONVERSION_DATA[newCat].units);
    setFromUnit(newUnits[0]);
    setToUnit(newUnits[1] || newUnits[0]);
    setAmount("1");
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const convertedValue = useMemo(() => {
    if (!amount || isNaN(Number(amount))) return "0";
    
    const val = Number(amount);
    const catData = CONVERSION_DATA[category].units;
    const fromDef = catData[fromUnit];
    const toDef = catData[toUnit];
    
    // special handling for temperature functions
    if (typeof fromDef === 'function' || typeof toDef === 'function') {
        let baseVal = val;
        // to Base
        if (typeof fromDef === 'function') {
            baseVal = fromDef(val, true);
        } else if (fromDef !== 1) { // 1 means it is base
            baseVal = val * fromDef;
        }

        // from Base
        let result = baseVal;
        if (typeof toDef === 'function') {
            result = toDef(baseVal, false);
        } else if (toDef !== 1) {
            result = baseVal / toDef;
        }
        
        // Remove tiny floating point errors on exactly 0 values etc.
        return Math.abs(result) < 1e-10 ? "0" : Number(result.toFixed(6)).toString();
    }
    
    // standard multiplication conversions
    const fromFactor = Number(fromDef);
    const toFactor = Number(toDef);
    
    const baseVal = val * fromFactor;
    const result = baseVal / toFactor;
    
    // use dynamic precision based on magnitude
    if (result < 0.0001 && result > 0) return result.toExponential(4);
    if (result > 1e10) return result.toExponential(4);
    
    // Format without trailing zeroes
    return Number(result.toFixed(8)).toString();
  }, [amount, fromUnit, toUnit, category]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] w-full max-w-4xl mx-auto py-10">
      
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row min-h-[600px]">
        
        {/* Category List - Sidebar on Desktop */}
        <div className="w-full xl:w-80 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-2 overflow-x-auto xl:overflow-y-auto max-h-[200px] xl:max-h-full">
          <div className="flex xl:flex-col gap-2 min-w-max xl:min-w-0 pb-2 xl:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "px-4 py-3 rounded-xl text-left font-medium transition-all whitespace-nowrap",
                  category === cat
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Converter Area */}
        <div className="flex-1 p-8 md:p-12 relative flex flex-col justify-center">
            
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-10 w-full max-w-lg mx-auto"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">{category}</h2>
                <p className="text-slate-500 dark:text-slate-400">Convert units across {Object.keys(CONVERSION_DATA[category].units).length} different metrics.</p>
              </div>

              {/* Amount Input */}
              <div className="relative group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-5xl md:text-6xl font-bold p-4 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-brand-500 outline-none transition-all dark:text-white pb-6 bg-slate-50 dark:bg-slate-800/30 rounded-t-2xl px-6"
                  placeholder="0"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="absolute right-4 bottom-6 bg-transparent text-lg font-semibold text-brand-600 dark:text-brand-400 outline-none cursor-pointer max-w-[150px] truncate text-right appearance-none text-right-align-select"
                  style={{ textAlignLast: 'right' }}
                >
                  {units.map((u) => <option key={`from-${u}`} value={u} className="text-slate-900">{u}</option>)}
                </select>
              </div>

              {/* Swap Button container */}
              <div className="flex items-center justify-center -my-6 relative z-10">
                <motion.button
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSwap}
                  className="p-4 bg-brand-500 text-white rounded-full shadow-xl hover:bg-brand-600 transition-colors border-4 border-white dark:border-slate-900"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Result Input (Readonly) */}
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={convertedValue}
                  className="w-full text-5xl md:text-6xl font-bold p-4 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-500 outline-none pb-6 bg-brand-50/50 dark:bg-brand-900/10 rounded-t-2xl px-6 truncate"
                  placeholder="0"
                />
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="absolute right-4 bottom-6 bg-transparent text-lg font-semibold text-brand-600 dark:text-brand-400 outline-none cursor-pointer max-w-[150px] truncate text-right appearance-none"
                  style={{ textAlignLast: 'right' }}
                >
                  {units.map((u) => <option key={`to-${u}`} value={u} className="text-slate-900">{u}</option>)}
                </select>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
