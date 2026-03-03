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
			<header className="sticky top-0 z-40 w-full border-b-2 border-border bg-background/95 backdrop-blur-md transition-all duration-300 shadow-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-20 items-center justify-between">
						<Link href="/" className="flex items-center gap-3 group">
							<Image
								src="/Atlantis.svg"
								alt="Atlantis nombre"
								width={40}
								height={40}
								className="object-contain transition-all duration-300 group-hover:scale-105 w-10 h-8 sm:w-14 sm:h-10 md:w-16 md:h-10 lg:w-20 lg:h-12 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]"
							/>

							<span className="text-base sm:text-lg font-black text-gold-shimmer font-inter uppercase tracking-widest hidden sm:block">
								PORFIC STILE
							</span>
						</Link>

						{/* Desktop Navigation */}
						<nav className="hidden lg:flex items-center gap-8">
							<Link
								href="/productos"
								className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 px-4 py-2 tracking-wide uppercase relative group"
							>
								Tienda
								<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 rounded-full"></span>
							</Link>
							<Link
								href="/nosotros"
								className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 px-4 py-2 tracking-wide uppercase relative group"
							>
								Nosotros
								<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 rounded-full"></span>
							</Link>
							<Link
								href="/contacto"
								className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 px-4 py-2 tracking-wide uppercase relative group"
							>
								Contacto
								<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 rounded-full"></span>
							</Link>
						</nav>

						{/* Right Actions */}
						<div className="flex items-center gap-3 sm:gap-4">
							{/* Currency Selector */}
							<div className="hidden lg:block">
								<CurrencySelector />
							</div>

							{/* Cart Button */}
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

							{/* Mobile Menu Button */}
							<button
								onClick={() => setIsOpen(!isOpen)}
								className="lg:hidden fixed right-4 top-4 z-50 p-2 rounded-lg hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-primary"
								aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
								aria-expanded={isOpen}
							>
								{isOpen ? (
									<X className="h-6 w-6 text-foreground" />
								) : (
									<Menu className="h-6 w-6 text-foreground" />
								)}
							</button>
						</div>
					</div>

					{/* Mobile Navigation */}
					{isOpen && (
						<nav className="border-t border-border/50 bg-background pb-6 md:hidden animate-slide-up">
							<div className="flex flex-col gap-2 pt-6">
								{/* Mobile Currency Selector */}
								<div className="px-6 py-3">
									<CurrencySelector />
								</div>
								<Link
									href="/productos"
									className="text-base font-medium text-foreground hover:text-primary transition-smooth px-6 py-3 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
								>
									Tienda
								</Link>
								<Link
									href="/nosotros"
									className="text-base font-medium text-foreground hover:text-primary transition-smooth px-6 py-3 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
								>
									Nosotros
								</Link>
								<Link
									href="/contacto"
									className="text-base font-medium text-foreground hover:text-primary transition-smooth px-6 py-3 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
								>
									Contacto
								</Link>
							</div>
						</nav>
					)}
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
