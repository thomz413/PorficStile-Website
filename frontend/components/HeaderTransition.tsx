"use client";

import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import CurrencySelector from "./CurrencySelector";
import StickyCart from "./StickyCart";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";

export default function HeaderTransition({
	whatsappNumber,
	heroSelector = "#hero",
}: {
	whatsappNumber?: string | null;
	heroSelector?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [isOverHero, setIsOverHero] = useState(true);
	const { getTotalItems } = useCart();
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		setMounted(true);

		const heroEl = document.querySelector(heroSelector);

		if (heroEl && "IntersectionObserver" in window) {
			observerRef.current = new IntersectionObserver(
				(entries) => {
					const first = entries[0];
					// If the hero is visible, we are "Over Hero" (Transparent)
					setIsOverHero(first.isIntersecting);
				},
				{ root: null, threshold: 0.1 }, // Trigger when 10% of hero is visible
			);
			observerRef.current.observe(heroEl);
		} else {
			// Fallback for pages without the hero element or legacy browsers
			const handleScroll = () => setIsOverHero(window.scrollY < 50);
			window.addEventListener("scroll", handleScroll);
			return () => window.removeEventListener("scroll", handleScroll);
		}

		return () => {
			if (observerRef.current && heroEl) observerRef.current.unobserve(heroEl);
		};
	}, [heroSelector]);

	// The header is transparent ONLY when we are over the hero section
	const isTransparent = isOverHero;

	return (
		<>
			<header
				className={`fixed top-0 z-50 w-full transition-all duration-500 ${
					isTransparent
						? "bg-transparent py-4"
						: "bg-background/90 backdrop-blur-lg border-b border-border shadow-md py-0"
				}`}
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Desktop View */}
					<div className="hidden lg:flex items-center justify-between h-20">
						<div className="flex items-center gap-3">
							<Link href="/" className="flex items-center gap-3 group">
								<Image
									src="/Atlantis.svg"
									alt="Logo"
									width={40}
									height={40}
									className={`object-contain transition-all duration-300 group-hover:scale-110 w-12 h-10 ${
										!isTransparent
											? "drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]"
											: "brightness-0 invert"
									}`}
								/>
								<span
									className={`text-lg font-black font-inter uppercase tracking-[0.2em] transition-colors duration-300 ${
										isTransparent ? "text-white drop-shadow-md" : "text-primary"
									}`}
								>
									PORFIC STILE
								</span>
							</Link>
						</div>

						<nav className="flex items-center gap-2">
							{["Tienda", "Nosotros", "Contacto"].map((item) => (
								<Link
									key={item}
									href={`/${item.toLowerCase() === "tienda" ? "productos" : item.toLowerCase()}`}
									className={`text-xs font-bold transition-colors duration-300 px-5 py-2 uppercase tracking-widest relative group ${
										isTransparent
											? "text-white drop-shadow-sm"
											: "text-foreground"
									}`}
								>
									{item}
									<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-1/2 transition-all duration-300 rounded-full" />
								</Link>
							))}
						</nav>

						<div className="flex items-center gap-4">
							<div className={isTransparent ? "text-white" : "text-foreground"}>
								<CurrencySelector />
							</div>

							<button
								onClick={() => setIsCartOpen(true)}
								className={`relative rounded-full p-2.5 transition-all active:scale-95 ${
									isTransparent
										? "hover:bg-white/10 text-white"
										: "hover:bg-primary/10 text-foreground"
								}`}
								aria-label="Carrito"
							>
								<ShoppingCart className="h-6 w-6 transition-colors duration-300" />
								{mounted && getTotalItems() > 0 && (
									<span className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full h-5 w-5 text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
										{getTotalItems()}
									</span>
								)}
							</button>
						</div>
					</div>

					{/* Mobile View */}
					<div className="flex lg:hidden items-center justify-between h-16">
						<button
							onClick={() => setIsOpen((s) => !s)}
							className={`p-2 -ml-2 transition-colors duration-300 ${isTransparent ? "text-white" : "text-foreground"}`}
						>
							{isOpen ? <X size={28} /> : <Menu size={28} />}
						</button>

						<Link href="/" className="absolute left-1/2 -translate-x-1/2">
							<Image
								src="/Atlantis.svg"
								alt="Logo"
								width={35}
								height={35}
								className={`transition-all duration-300 ${isTransparent ? "brightness-0 invert" : ""}`}
							/>
						</Link>

						<button
							onClick={() => setIsCartOpen(true)}
							className={`relative p-2 -mr-2 transition-colors duration-300 ${isTransparent ? "text-white" : "text-foreground"}`}
						>
							<ShoppingCart size={26} />
							{mounted && getTotalItems() > 0 && (
								<span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full h-4 w-4 text-[9px] font-bold flex items-center justify-center">
									{getTotalItems()}
								</span>
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu Overlay */}
				<div
					className={`lg:hidden absolute top-full left-0 w-full bg-background/98 backdrop-blur-xl border-b border-border transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
				>
					<nav className="flex flex-col p-6 gap-4 text-foreground">
						<Link
							href="/productos"
							onClick={() => setIsOpen(false)}
							className="text-lg font-bold uppercase tracking-tight"
						>
							Tienda
						</Link>
						<Link
							href="/nosotros"
							onClick={() => setIsOpen(false)}
							className="text-lg font-bold uppercase tracking-tight"
						>
							Nosotros
						</Link>
						<Link
							href="/contacto"
							onClick={() => setIsOpen(false)}
							className="text-lg font-bold uppercase tracking-tight"
						>
							Contacto
						</Link>
						<div className="pt-4 border-t border-border">
							<CurrencySelector />
						</div>
					</nav>
				</div>
			</header>

			<StickyCart
				externalOpen={isCartOpen}
				onExternalClose={() => setIsCartOpen(false)}
				whatsappNumber={whatsappNumber}
			/>
		</>
	);
}
