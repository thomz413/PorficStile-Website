"use client";

import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import CurrencySelector from "./CurrencySelector";
import Cart from "./Cart";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";

export default function Header({
  whatsappNumber,
}: {
  whatsappNumber?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalItems } = useCart();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur-md transition-all duration-300 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* grid: left / center / right */}
          <div className="grid grid-cols-3 items-center h-20">
            {/* Left: mobile menu button + optional left nav on larger screens */}
            <div className="flex items-center">
              {/* Mobile Menu Button (visible on small screens) */}
              <button
                onClick={() => setIsOpen((s) => !s)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isOpen}
                aria-controls="mobile-navigation"
              >
                {isOpen ? (
                  <X className="h-6 w-6 text-foreground" />
                ) : (
                  <Menu className="h-6 w-6 text-foreground" />
                )}
              </button>

              {/* Desktop left nav (optional) */}
              <nav className="hidden lg:flex items-center gap-6 ml-3">
                <Link
                  href="/productos"
                  className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 px-3 py-2 tracking-wide uppercase relative group"
                >
                  Tienda
                </Link>
                <Link
                  href="/nosotros"
                  className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 px-3 py-2 tracking-wide uppercase relative group"
                >
                  Nosotros
                </Link>
              </nav>
            </div>

            {/* Center: Logo */}
            <div className="flex items-center justify-center">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/Atlantis.svg"
                  alt="Atlantis nombre"
                  width={40}
                  height={40}
                  className="object-contain transition-all duration-300 group-hover:scale-105 w-10 h-8 sm:w-14 sm:h-10 md:w-16 md:h-10 lg:w-20 lg:h-12 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]"
                />
                <span className="ml-3 text-base sm:text-lg font-black text-gold-shimmer font-inter uppercase tracking-widest hidden sm:inline-block">
                  PORFIC STILE
                </span>
              </Link>
            </div>

            {/* Right: currency, cart, other actions */}
            <div className="flex items-center justify-end gap-3 sm:gap-4">
              <div className="hidden lg:block">
                <CurrencySelector />
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-lg p-2.5 hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Abrir carrito"
              >
                <ShoppingCart className="h-6 w-6 text-foreground" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs font-medium flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Desktop quick contact (optional) */}
              <Link
                href="/contacto"
                className="hidden sm:inline-flex items-center px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
              >
                Contacto
              </Link>
            </div>
          </div>

          {/* Mobile Navigation: absolute panel below header (does not push content) */}
          <div className={`relative`}>
            <nav
              id="mobile-navigation"
              className={`absolute left-0 right-0 top-full bg-background border-t border-border/50 md:hidden overflow-hidden transition-[max-height] duration-300 ${
                isOpen ? "max-h-[480px] py-6" : "max-h-0"
              }`}
              aria-hidden={!isOpen}
            >
              <div className="flex flex-col gap-2 px-6">
                <div className="py-2">
                  <CurrencySelector />
                </div>

                <Link
                  href="/productos"
                  className="text-base font-medium text-foreground hover:text-primary px-3 py-3 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Tienda
                </Link>

                <Link
                  href="/nosotros"
                  className="text-base font-medium text-foreground hover:text-primary px-3 py-3 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Nosotros
                </Link>

                <Link
                  href="/contacto"
                  className="text-base font-medium text-foreground hover:text-primary px-3 py-3 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Contacto
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Cart */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}