"use client";

import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export default function CurrencySelector() {
	const { currency, setCurrency, isLoading } = useCurrency();
	const [isOpen, setIsOpen] = useState(false);

	const currentCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];

	const handleCurrencyChange = (currencyCode: string) => {
		setCurrency(currencyCode);
		setIsOpen(false);
	};

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg hover:border-primary"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
			>
				<span className="text-lg">{currentCurrency.symbol}</span>
				<span>{currentCurrency.code}</span>
				<svg
					className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>
					<ul
						className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-20 overflow-hidden"
						role="listbox"
					>
						{SUPPORTED_CURRENCIES.map((currencyOption) => (
							<li key={currencyOption.code}>
								<button
									onClick={() => handleCurrencyChange(currencyOption.code)}
									className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between ${
										currency === currencyOption.code
											? 'bg-primary/10 text-primary font-medium'
											: 'text-foreground'
									}`}
									role="option"
									aria-selected={currency === currencyOption.code}
								>
									<div className="flex items-center gap-3">
										<span className="text-lg font-medium">{currencyOption.symbol}</span>
										<div>
											<div className="font-medium">{currencyOption.code}</div>
											<div className="text-xs text-muted-foreground">{currencyOption.name}</div>
										</div>
									</div>
									{currency === currencyOption.code && (
										<svg
											className="w-5 h-5 text-primary"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									)}
								</button>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}
