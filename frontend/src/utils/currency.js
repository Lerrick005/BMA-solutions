// Currency utilities and mock exchange rates

// Mock exchange rates (base: USD)
export const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1570,
  KES: 128,
  ZAR: 18.5,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149.5,
  CNY: 7.22,
};

// Supported currencies with display names
export const supportedCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

// Default currency for the company
export const defaultCurrency = 'USD';

// Convert currency
export const convertCurrency = (amount, fromCurrency, toCurrency = defaultCurrency) => {
  if (!amount || !fromCurrency || !toCurrency) return amount;
  
  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];
  
  if (!fromRate || !toRate) return amount;
  
  // Convert to USD first (base currency), then to target currency
  const inUSD = amount / fromRate;
  const converted = inUSD * toRate;
  
  return Math.round(converted * 100) / 100;
};

// Format currency with symbol
export const formatCurrency = (amount, currencyCode = defaultCurrency) => {
  const currency = supportedCurrencies.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || '$';
  
  // Format based on currency
  if (currencyCode === 'JPY') {
    return `${symbol}${Math.round(amount)}`;
  }
  
  return `${symbol}${amount.toFixed(2)}`;
};

// Get currency symbol
export const getCurrencySymbol = (currencyCode) => {
  const currency = supportedCurrencies.find(c => c.code === currencyCode);
  return currency?.symbol || '$';
};

// Format amount with original and converted values
export const formatCurrencyWithConversion = (amount, originalCurrency, targetCurrency = defaultCurrency) => {
  const converted = convertCurrency(amount, originalCurrency, targetCurrency);
  const originalFormatted = formatCurrency(amount, originalCurrency);
  const targetFormatted = formatCurrency(converted, targetCurrency);
  
  return {
    original: originalFormatted,
    converted: targetFormatted,
    originalCurrency,
    targetCurrency,
    convertedAmount: converted,
    isConverted: originalCurrency !== targetCurrency,
  };
};