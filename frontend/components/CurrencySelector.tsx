"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

interface CurrencySelectorProps {
	isTransparent?: boolean;
}

export default function CurrencySelector({
	isTransparent = false,
}: CurrencySelectorProps) {
	const { currency, setCurrency } = useCurrency();
	const [isOpen, setIsOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const listRef = useRef<HTMLUListElement | null>(null);

	// Initialize client state after mount
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Initialize mobile state only on client
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		if (!isClient) return;
		
		const mq = window.matchMedia("(max-width: 768px)");
		const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		
		setIsMobile(mq.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [isClient]);

	// Stable default currency for SSR
	const defaultCurrency = SUPPORTED_CURRENCIES[0]; // PEN
	const [currentCurrency, setCurrentCurrency] = useState(defaultCurrency);

	// Update current currency only on client
	useEffect(() => {
		if (!isClient) return;
		
		const foundCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currency) || defaultCurrency;
		setCurrentCurrency(foundCurrency);
	}, [currency, isClient]);

	const handleCurrencyChange = (currencyCode: string) => {
		setCurrency(currencyCode);
		setIsOpen(false);
	};

	// Pre-computed stable class names
	const buttonBaseClasses = "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 border rounded-lg";
	const transparentClasses = "text-white/80 hover:text-white border-white/20 hover:border-white/50 bg-white/5 backdrop-blur-sm";
	const normalClasses = "text-muted-foreground hover:text-foreground border-border hover:border-primary bg-transparent";
	const buttonStyles = `${buttonBaseClasses} ${isTransparent ? transparentClasses : normalClasses}`;

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen((s) => !s)}
				className={buttonStyles}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				type="button"
			>
				<span className="text-lg">{currentCurrency.symbol}</span>
				<span className="hidden xs:inline">{currentCurrency.code}</span>
				<svg
					className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>

					<ul
						ref={listRef}
						className={
							isMobile
								? "fixed left-0 right-0 top-16 z-20 bg-background/98 backdrop-blur-xl border-t border-border shadow-2xl max-h-[60vh] overflow-y-auto px-2 py-3"
								: "absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto"
						}
					>
						{SUPPORTED_CURRENCIES.map((currencyOption) => (
							<li key={currencyOption.code}>
								<button
									onClick={() => handleCurrencyChange(currencyOption.code)}
									className={currency === currencyOption.code ? "w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between bg-primary/10 text-primary font-bold" : "w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between text-foreground"}
								>
									<div className="flex items-center gap-3">
										<span className="text-lg font-bold">
											{currencyOption.symbol}
										</span>
										<div className="flex flex-col">
											<span className="font-bold leading-tight">
												{currencyOption.code}
											</span>
											<span className="text-[10px] uppercase tracking-tighter opacity-60">
												{currencyOption.name}
											</span>
										</div>
									</div>
								</button>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}
