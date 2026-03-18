export const CURRENCIES: Record<string, { name: string, symbol: string }> = {
  USD: { name: "United States - Dollar", symbol: "$" },
  EUR: { name: "Eurozone - Euro", symbol: "€" },
  GBP: { name: "United Kingdom - Pound", symbol: "£" },
  INR: { name: "India - Rupee", symbol: "₹" },
  JPY: { name: "Japan - Yen", symbol: "¥" },
  CAD: { name: "Canada - Dollar", symbol: "C$" },
  AUD: { name: "Australia - Dollar", symbol: "A$" },
  CNY: { name: "China - Yuan", symbol: "¥" },
  CHF: { name: "Switzerland - Franc", symbol: "CHF" },
  SGD: { name: "Singapore - Dollar", symbol: "S$" },
  NZD: { name: "New Zealand - Dollar", symbol: "NZ$" },
  BRL: { name: "Brazil - Real", symbol: "R$" },
  ZAR: { name: "South Africa - Rand", symbol: "R" },
  MXN: { name: "Mexico - Peso", symbol: "$" },
  KRW: { name: "South Korea - Won", symbol: "₩" },
  SEK: { name: "Sweden - Krona", symbol: "kr" },
  NOK: { name: "Norway - Krone", symbol: "kr" },
  DKK: { name: "Denmark - Krone", symbol: "kr" },
  TRY: { name: "Turkey - Lira", symbol: "₺" },
  RUB: { name: "Russia - Ruble", symbol: "₽" },
  ILS: { name: "Israel - Shekel", symbol: "₪" },
  AED: { name: "United Arab Emirates - Dirham", symbol: "د.إ" },
  SAR: { name: "Saudi Arabia - Riyal", symbol: "﷼" },
  PHP: { name: "Philippines - Peso", symbol: "₱" },
  IDR: { name: "Indonesia - Rupiah", symbol: "Rp" },
  MYR: { name: "Malaysia - Ringgit", symbol: "RM" },
  THB: { name: "Thailand - Baht", symbol: "฿" },
  VND: { name: "Vietnam - Dong", symbol: "₫" },
  PLN: { name: "Poland - Zloty", symbol: "zł" },
  ARS: { name: "Argentina - Peso", symbol: "$" },
  CLP: { name: "Chile - Peso", symbol: "$" },
  COP: { name: "Colombia - Peso", symbol: "$" },
  EGP: { name: "Egypt - Pound", symbol: "£" },
  NGN: { name: "Nigeria - Naira", symbol: "₦" },
  PKR: { name: "Pakistan - Rupee", symbol: "₨" },
  BDT: { name: "Bangladesh - Taka", symbol: "৳" },
};

export function getCurrencyLabel(code: string): string {
  const data = CURRENCIES[code];
  return data ? `${data.name} (${code})` : code;
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES[code]?.symbol || code;
}
