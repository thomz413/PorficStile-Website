// lib/currency.ts
export interface CurrencyInfo {
	code: string;
	symbol: string;
	name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
	// All South American currencies
	{ code: "PEN", symbol: "S/.", name: "Sol Peruano" },
	{ code: "BOB", symbol: "Bs.", name: "Boliviano Boliviano" },
	{ code: "USD", symbol: "$", name: "Dólar Americano" },
	{ code: "ARS", symbol: "$", name: "Peso Argentino" },
	{ code: "CLP", symbol: "$", name: "Peso Chileno" },
	{ code: "COP", symbol: "$", name: "Peso Colombiano" },
	{ code: "PYG", symbol: "₲", name: "Guarani Paraguayo" },
	{ code: "UYU", symbol: "$", name: "Peso Uruguayo" },
	{ code: "VES", symbol: "Bs.", name: "Bolívar Venezolano" },
	{ code: "GYD", symbol: "$", name: "Dólar Guyanés" },
	{ code: "SRD", symbol: "$", name: "Dólar Surinamés" },
	{ code: "BRL", symbol: "R$", name: "Real Brasileño" },

	// Major international currencies
	{ code: "EUR", symbol: "€", name: "Euro" },
];

// Fallback rates if API fails
// Simple fetch from free exchange rate API
// Convert price from PEN to target currency
// Format price for display
export function formatPrice(price: number, symbol: string, currency: string) {
	try {
		// Currencies that don't use decimals (or have special formatting)
		const noDecimalCurrencies = ["JPY", "CLP", "PYG", "VES", "GYD"];
		// Currencies that use different decimal places
		const specialDecimalCurrencies: { [key: string]: number } = {
			ARS: 0, // Argentine Peso - often no decimals due to high values
			COP: 0, // Colombian Peso - no decimals
			UYU: 0, // Uruguayan Peso - often no decimals
			PYG: 0, // Paraguayan Guarani - no decimals
			CLP: 0, // Chilean Peso - no decimals
			VES: 0, // Venezuelan Bolivar - no decimals due to high inflation
			GYD: 0, // Guyanese Dollar - no decimals
		};

		if (
			noDecimalCurrencies.includes(currency) ||
			specialDecimalCurrencies[currency] === 0
		) {
			return `${symbol}${Math.round(price).toLocaleString("es-PE")}`;
		}

		// Special formatting for currencies with 1 decimal place
		if (currency === "UYU") {
			return `${symbol}${price.toLocaleString("es-PE", {
				minimumFractionDigits: 1,
				maximumFractionDigits: 1,
			})}`;
		}

		// Default formatting for most currencies (2 decimal places)
		return `${symbol}${price.toLocaleString("es-PE", {
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
	if (typeof window === "undefined") return "PEN";

	try {
		const saved = localStorage.getItem("user-currency");
		if (saved && SUPPORTED_CURRENCIES.find((c) => c.code === saved)) {
			return saved;
		}

		// Try to get from browser locale - prioritize South American countries
		const locale = navigator.language || "es-PE";
		const currencyCode = locale.split("-")[1]?.toUpperCase();

		// South American country mappings
		const southAmericanMapping: { [key: string]: string } = {
			PE: "PEN", // Peru
			BO: "BOB", // Bolivia
			EC: "USD", // Ecuador (uses USD)
			AR: "ARS", // Argentina
			CL: "CLP", // Chile
			CO: "COP", // Colombia
			PY: "PYG", // Paraguay
			UY: "UYU", // Uruguay
			VE: "VES", // Venezuela
			GY: "GYD", // Guyana
			SR: "SRD", // Suriname
			BR: "BRL", // Brazil
		};

		// Check if it's a South American country first
		if (currencyCode && southAmericanMapping[currencyCode]) {
			return southAmericanMapping[currencyCode];
		}

		// Then check if it's any other supported currency
		if (
			currencyCode &&
			SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)
		) {
			return currencyCode;
		}
	} catch (error) {
		console.warn("Error detecting user currency:", error);
	}

	return "PEN"; // Default to PEN (Peru)
}

// Save user's preferred currency
export function saveUserCurrency(currency: string): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem("user-currency", currency);
	} catch (error) {
		console.warn("Error saving user currency:", error);
	}
}
