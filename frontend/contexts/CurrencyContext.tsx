"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import {
	convertPrice,
	formatPrice,
	getUserCurrency,
	saveUserCurrency,
	SUPPORTED_CURRENCIES,
	CurrencyInfo,
} from "@/lib/currency";

interface CurrencyContextType {
	currency: string;
	currencyInfo: CurrencyInfo;
	isLoading: boolean;
	setCurrency: (currency: string) => void;
	convertAndFormatPrice: (priceInPEN: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
	undefined,
);

interface CurrencyProviderProps {
	children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
	const [currency, setCurrencyState] = useState<string>("PEN");
	const [isLoading, setIsLoading] = useState(true);

	const currencyInfo =
		SUPPORTED_CURRENCIES.find((c) => c.code === currency) ||
		SUPPORTED_CURRENCIES[0];

	// Load currency preference
	useEffect(() => {
		try {
			const userCurrency = getUserCurrency();
			setCurrencyState(userCurrency);
		} catch (error) {
			console.warn("Error loading user currency:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const setCurrency = (newCurrency: string) => {
		if (SUPPORTED_CURRENCIES.find((c) => c.code === newCurrency)) {
			setCurrencyState(newCurrency);
			saveUserCurrency(newCurrency);
		}
	};

	const convertAndFormatPrice = async (priceInPEN: number): Promise<string> => {
		if (isLoading) {
			// Show original price while loading
			const penCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === "PEN")!;
			return formatPrice(priceInPEN, penCurrency.symbol, penCurrency.code);
		}

		try {
			const result = await convertPrice(priceInPEN, currency);
			return formatPrice(result.price, result.symbol, result.currency);
		} catch (error) {
			console.warn("Currency conversion failed, using PEN:", error);
			// Fallback to PEN
			const penCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === "PEN")!;
			return formatPrice(priceInPEN, penCurrency.symbol, penCurrency.code);
		}
	};

	// For immediate display (synchronous), we'll use a simplified approach
	const syncConvertAndFormatPrice = (priceInPEN: number): string => {
		if (isLoading || currency === "PEN") {
			const penCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === "PEN")!;
			return formatPrice(priceInPEN, penCurrency.symbol, penCurrency.code);
		}

		// For non-PEN currencies, we'll show a loading state or use estimated rates
		// This is a simplified approach - in production you might want to cache rates
		const estimatedRates: { [key: string]: number } = {
			// South American currencies
			BOB: 2.0, // Boliviano
			USD: 0.27, // US Dollar (Ecuador)
			ARS: 75.0, // Argentine Peso
			CLP: 220.0, // Chilean Peso
			COP: 1100.0, // Colombian Peso
			PYG: 2000.0, // Paraguayan Guarani
			UYU: 11.0, // Uruguayan Peso
			VES: 3500000.0, // Venezuelan Bolivar
			GYD: 55.0, // Guyanese Dollar
			SRD: 7.5, // Surinamese Dollar

			// International currencies
			EUR: 0.25,
			GBP: 0.21,
			CAD: 0.37,
			AUD: 0.41,
			CHF: 0.24,
			JPY: 40.5,
			CNY: 1.9,
			MXN: 4.8,
			BRL: 1.4,
		};

		const rate = estimatedRates[currency];
		if (rate && rate > 0) {
			const convertedPrice = priceInPEN * rate;
			return formatPrice(
				convertedPrice,
				currencyInfo.symbol,
				currencyInfo.code,
			);
		}

		// Fallback to PEN
		const penCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === "PEN")!;
		return formatPrice(priceInPEN, penCurrency.symbol, penCurrency.code);
	};

	const value: CurrencyContextType = {
		currency,
		currencyInfo,
		isLoading,
		setCurrency,
		convertAndFormatPrice: syncConvertAndFormatPrice,
	};

	return (
		<CurrencyContext.Provider value={value}>
			{children}
		</CurrencyContext.Provider>
	);
}

export function useCurrency() {
	const context = useContext(CurrencyContext);
	if (context === undefined) {
		throw new Error("useCurrency must be used within a CurrencyProvider");
	}
	return context;
}
