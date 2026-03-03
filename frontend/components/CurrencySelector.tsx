"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);

  const currentCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) ||
    SUPPORTED_CURRENCIES[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    // initial
    setIsMobile(mq.matches);
    // add listener (addEventListener for modern browsers)
    if ("addEventListener" in mq) mq.addEventListener("change", onChange as any);
    else mq.addListener(onChange as any);
    return () => {
      if ("removeEventListener" in mq) mq.removeEventListener("change", onChange as any);
      else mq.removeListener(onChange as any);
    };
  }, []);

  useEffect(() => {
    // when opening on desktop focus the list for keyboard users
    if (isOpen && listRef.current && !isMobile) {
      listRef.current.focus();
    }
  }, [isOpen, isMobile]);

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((s) => !s)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg hover:border-primary"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Seleccionar moneda"
        type="button"
      >
        <span className="text-lg">{currentCurrency.symbol}</span>
        <span className="hidden xs:inline">{currentCurrency.code}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* backdrop — covers whole viewport to catch outside clicks */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />

          {/* Desktop: small absolute menu; Mobile: full-width fixed panel below header */}
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className={
              isMobile
                ? // mobile: full width panel anchored under header (adjust top if your header height differs)
                  "fixed left-0 right-0 top-16 z-20 bg-background border-t border-border shadow-md max-h-[60vh] overflow-y-auto px-2 py-3"
                : // desktop: compact dropdown positioned to the right of the button
                  "absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-20 overflow-hidden max-h-60 overflow-y-auto"
            }
          >
            {SUPPORTED_CURRENCIES.map((currencyOption) => (
              <li key={currencyOption.code} className="">
                <button
                  onClick={() => handleCurrencyChange(currencyOption.code)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                    currency === currencyOption.code
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground"
                  }`}
                  role="option"
                  aria-selected={currency === currencyOption.code}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium">{currencyOption.symbol}</span>
                    <div className="truncate">
                      <div className="font-medium">{currencyOption.code}</div>
                      <div className="text-xs text-muted-foreground truncate">{currencyOption.name}</div>
                    </div>
                  </div>
                  {currency === currencyOption.code && (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
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