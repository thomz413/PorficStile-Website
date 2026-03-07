"use client";

import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import CurrencySelector from "./CurrencySelector";
import StickyCart from "./StickyCart";
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
					{/* ---------- DESKTOP (lg+) ---------- */}
					<div className="hidden lg:flex items-center justify-between h-20">
						{/* Left: logo + brand (desktop original) */}
						<div className="flex items-center gap-3">
							<Link href="/" className="flex items-center gap-3 group">
								<Image
									src="/Atlantis.svg"
									alt="Atlantis nombre"
									width={40}
									height={40}
									className="object-contain transition-all duration-300 group-hover:scale-105 w-10 h-8 sm:w-14 sm:h-10 md:w-16 md:h-10 lg:w-20 lg:h-12 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]"
								/>
								<span className="text-base sm:text-lg font-black text-gold-shimmer font-inter uppercase tracking-widest">
									PORFIC STILE
								</span>
							</Link>
						</div>

						{/* Center: nav (keeps the desktop nav you liked) */}
						<nav className="flex items-center gap-8">
							<Link
								href="/productos"
								className="text-sm font-black text-foreground hover:text-primary transition-all duration-300  px-4 py-2 tracking-wide uppercase relative group"
							>
								Tienda
								<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
							</Link>

							<Link
								href="/nosotros"
								className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 px-4 py-2 tracking-wide uppercase relative group"
							>
								Nosotros
								<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
							</Link>

							<Link
								href="/contacto"
								className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 px-4 py-2 tracking-wide uppercase relative group"
							>
								Contacto
								<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
							</Link>
						</nav>

						{/* Right: currency, cart, contact (desktop) */}
						<div className="flex items-center gap-3 sm:gap-4">
							<div>
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

							<Link
								href="/contacto"
								className="inline-flex items-center px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
							>
								Contacto
							</Link>
						</div>
					</div>

					{/* ---------- MOBILE (below lg) ---------- */}
					<div className="grid grid-cols-3 items-center h-20 lg:hidden">
						{/* Left: hamburger */}
						<div className="flex items-center">
							<button
								onClick={() => setIsOpen((s) => !s)}
								className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary ml-0"
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
						</div>

						{/* Center: logo (centered on mobile) */}
						<div className="flex items-center justify-center">
							<Link href="/" className="inline-flex items-center">
								<Image
									src="/Atlantis.svg"
									alt="Atlantis nombre"
									width={40}
									height={40}
									className="object-contain transition-all duration-300 group-hover:scale-105 w-10 h-8 sm:w-14 sm:h-10 md:w-16 md:h-10 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]"
								/>
							</Link>
						</div>

						{/* Right: cart (mobile) */}
						<div className="flex items-center justify-end gap-3">
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
						</div>
					</div>

					{/* Mobile Navigation: absolute panel below header (does not push content) */}
					<div className="relative lg:hidden">
						<nav
							id="mobile-navigation"
							className={`absolute left-0 right-0 top-full bg-background border-t border-border/50 overflow-hidden transition-[max-height] duration-300 ${
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

			{/* Cart Sidebar */}
			<StickyCart
				externalOpen={isCartOpen}
				onExternalClose={() => setIsCartOpen(false)}
				whatsappNumber={whatsappNumber}
			/>
		</>
	);
}
