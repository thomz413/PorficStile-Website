"use client";

import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	CurrencyInfo,
	formatPrice,
	getUserCurrency,
	SUPPORTED_CURRENCIES,
	saveUserCurrency,
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

	const convertAndFormatPrice = (priceInPEN: number): string => {
		const penCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === "PEN")!;

		if (isLoading || currency === "PEN") {
			return formatPrice(priceInPEN, penCurrency.symbol, penCurrency.code);
		}

		const estimatedRates: Record<string, number> = {
			BOB: 2.0,
			USD: 0.27,
			ARS: 75.0,
			CLP: 220.0,
			COP: 1100.0,
			PYG: 2000.0,
			UYU: 11.0,
			VES: 3500000.0,
			GYD: 55.0,
			SRD: 7.5,
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

		return formatPrice(priceInPEN, penCurrency.symbol, penCurrency.code);
	};

	const value: CurrencyContextType = {
		currency,
		currencyInfo,
		isLoading,
		setCurrency,
		convertAndFormatPrice,
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
