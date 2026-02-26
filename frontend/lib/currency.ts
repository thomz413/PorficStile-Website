// lib/currency.ts
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  // South American currencies (prioritized)
  { code: 'PEN', symbol: 'S/.', name: 'Sol Peruano' },
  { code: 'BOB', symbol: 'Bs.', name: 'Boliviano Boliviano' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano (Ecuador)' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
  { code: 'PYG', symbol: '₲', name: 'Guarani Paraguayo' },
  { code: 'UYU', symbol: '$', name: 'Peso Uruguayo' },
  { code: 'VES', symbol: 'Bs.', name: 'Bolívar Venezolano' },
  { code: 'GYD', symbol: '$', name: 'Dólar Guyanés' },
  { code: 'SRD', symbol: '$', name: 'Dólar Surinamés' },
  
  // Major international currencies
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina' },
  { code: 'CAD', symbol: 'C$', name: 'Dólar Canadiense' },
  { code: 'AUD', symbol: 'A$', name: 'Dólar Australiano' },
  { code: 'CHF', symbol: 'Fr', name: 'Franco Suizo' },
  { code: 'JPY', symbol: '¥', name: 'Yen Japonés' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chino' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño' },
];

// Fallback rates if API fails
const FALLBACK_RATES = {
  PEN: 1,
  BOB: 2.0,  // Boliviano
  USD: 0.27,  // US Dollar (Ecuador)
  ARS: 75.0,  // Argentine Peso
  CLP: 220.0, // Chilean Peso
  COP: 1100.0, // Colombian Peso
  PYG: 2000.0, // Paraguayan Guarani
  UYU: 11.0,  // Uruguayan Peso
  VES: 3500000.0, // Venezuelan Bolivar (high inflation)
  GYD: 55.0,  // Guyanese Dollar
  SRD: 7.5,   // Surinamese Dollar
  EUR: 0.25,  // Euro
  GBP: 0.21,  // British Pound
  CAD: 0.37,  // Canadian Dollar
  AUD: 0.41,  // Australian Dollar
  CHF: 0.24,  // Swiss Franc
  JPY: 40.5,  // Japanese Yen
  CNY: 1.9,   // Chinese Yuan
  MXN: 4.8,   // Mexican Peso
  BRL: 1.4,   // Brazilian Real
};

// Simple fetch from free exchange rate API
export async function getExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/PEN');
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.rates || FALLBACK_RATES;
  } catch (error) {
    console.warn('Using fallback exchange rates:', error);
    return FALLBACK_RATES;
  }
}

// Convert price from PEN to target currency
export async function convertPrice(priceInPEN: number, targetCurrency: string) {
  if (targetCurrency === 'PEN') {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === 'PEN')!;
    return {
      price: priceInPEN,
      symbol: currency.symbol,
      currency: currency.code,
    };
  }

  const rates = await getExchangeRates();
  const rate = rates[targetCurrency];
  
  if (!rate || rate === 0) {
    // Fallback to PEN if conversion fails
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === 'PEN')!;
    return {
      price: priceInPEN,
      symbol: currency.symbol,
      currency: currency.code,
    };
  }

  const currency = SUPPORTED_CURRENCIES.find(c => c.code === targetCurrency);
  if (!currency) {
    // Fallback to PEN if currency not found
    const defaultCurrency = SUPPORTED_CURRENCIES.find(c => c.code === 'PEN')!;
    return {
      price: priceInPEN,
      symbol: defaultCurrency.symbol,
      currency: defaultCurrency.code,
    };
  }

  return {
    price: priceInPEN * rate,
    symbol: currency.symbol,
    currency: currency.code,
  };
}

// Format price for display
export function formatPrice(price: number, symbol: string, currency: string) {
  try {
    // Currencies that don't use decimals (or have special formatting)
    const noDecimalCurrencies = ['JPY', 'CLP', 'PYG', 'VES', 'GYD'];
    // Currencies that use different decimal places
    const specialDecimalCurrencies: { [key: string]: number } = {
      'ARS': 0,    // Argentine Peso - often no decimals due to high values
      'COP': 0,    // Colombian Peso - no decimals
      'UYU': 0,    // Uruguayan Peso - often no decimals
      'PYG': 0,    // Paraguayan Guarani - no decimals
      'CLP': 0,    // Chilean Peso - no decimals
      'VES': 0,    // Venezuelan Bolivar - no decimals due to high inflation
      'GYD': 0,    // Guyanese Dollar - no decimals
    };

    if (noDecimalCurrencies.includes(currency) || specialDecimalCurrencies[currency] === 0) {
      return `${symbol}${Math.round(price).toLocaleString('es-PE')}`;
    }
    
    // Special formatting for currencies with 1 decimal place
    if (currency === 'UYU') {
      return `${symbol}${price.toLocaleString('es-PE', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}`;
    }
    
    // Default formatting for most currencies (2 decimal places)
    return `${symbol}${price.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } catch (error) {
    // Fallback formatting
    return `${symbol}${price.toFixed(2)}`;
  }
}

// Get user's preferred currency from browser/localStorage
export function getUserCurrency(): string {
  if (typeof window === 'undefined') return 'PEN';
  
  try {
    const saved = localStorage.getItem('user-currency');
    if (saved && SUPPORTED_CURRENCIES.find(c => c.code === saved)) {
      return saved;
    }
    
    // Try to get from browser locale - prioritize South American countries
    const locale = navigator.language || 'es-PE';
    const currencyCode = locale.split('-')[1]?.toUpperCase();
    
    // South American country mappings
    const southAmericanMapping: { [key: string]: string } = {
      'PE': 'PEN', // Peru
      'BO': 'BOB', // Bolivia
      'EC': 'USD', // Ecuador (uses USD)
      'AR': 'ARS', // Argentina
      'CL': 'CLP', // Chile
      'CO': 'COP', // Colombia
      'PY': 'PYG', // Paraguay
      'UY': 'UYU', // Uruguay
      'VE': 'VES', // Venezuela
      'GY': 'GYD', // Guyana
      'SR': 'SRD', // Suriname
      'BR': 'BRL', // Brazil
    };
    
    // Check if it's a South American country first
    if (currencyCode && southAmericanMapping[currencyCode]) {
      return southAmericanMapping[currencyCode];
    }
    
    // Then check if it's any other supported currency
    if (currencyCode && SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)) {
      return currencyCode;
    }
  } catch (error) {
    console.warn('Error detecting user currency:', error);
  }
  
  return 'PEN'; // Default to PEN (Peru)
}

// Save user's preferred currency
export function saveUserCurrency(currency: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user-currency', currency);
  } catch (error) {
    console.warn('Error saving user currency:', error);
  }
}
