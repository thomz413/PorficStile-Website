"use client";

import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import CurrencySelector from "./CurrencySelector";
import StickyCart from "./StickyCart";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";

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
					setIsOverHero(first.isIntersecting);
				},
				{ root: null, threshold: 0.1 },
			);
			observerRef.current.observe(heroEl);
		} else {
			const handleScroll = () => setIsOverHero(window.scrollY < 50);
			window.addEventListener("scroll", handleScroll);
			return () => window.removeEventListener("scroll", handleScroll);
		}

		return () => {
			if (observerRef.current && heroEl) observerRef.current.unobserve(heroEl);
		};
	}, [heroSelector]);

	const isTransparent = isOverHero;

	// Animation Variants for a premium staggered entrance
	const headerVariants: Variants = {
		hidden: { y: "-100%", opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.8,
				ease: [0.21, 0.47, 0.32, 0.98], // Premium custom easing
				when: "beforeChildren",
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: -20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: "easeOut" },
		},
	};

	return (
		<>
			<motion.header
				initial="hidden"
				animate="visible"
				variants={headerVariants}
				className={`fixed top-0 z-50 w-full transition-colors duration-500 ${
					isTransparent
						? "bg-transparent py-4"
						: "bg-background/90 backdrop-blur-lg border-b border-border shadow-md py-0"
				}`}
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Desktop View */}
					<div className="hidden lg:flex items-center justify-between h-20">
						<motion.div
							variants={itemVariants}
							className="flex items-center gap-3"
						>
							<Link
								href="/"
								className="flex items-center gap-3 group"
								aria-label="Ir a la página principal"
							>
								<div className="flex flex-col items-center justify-center">
									<div
										className={`rounded-full p-1 transition-shadow duration-300 group-hover:scale-105 transform ${
											isTransparent
												? "bg-white/5 ring-0"
												: "bg-linear-to-br from-yellow-300/10 via-amber-200/10 to-red-200/5 ring-1 ring-amber-200/10"
										}`}
										aria-hidden
									>
										<Image
											src="/Atlantis.svg"
											alt="Atlantis logo"
											width={120}
											height={120}
											priority
											className={`object-contain transition-all duration-300 group-hover:scale-105 ${
												isTransparent
													? "brightness-0 invert"
													: "drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
											}`}
										/>
									</div>

									<span
										className={`mt-1 text-xs leading-4 font-black font-inter uppercase tracking-[0.22em] transition-colors duration-300 ${
											isTransparent
												? "text-gold-shimmer drop-shadow-md"
												: "text-gold-dark"
										}`}
										aria-hidden
									>
										PORFIC STILE
									</span>
								</div>
							</Link>
						</motion.div>

						<nav className="flex items-center gap-2">
							{["Tienda", "Nosotros", "Contacto"].map((item) => (
								<motion.div variants={itemVariants} key={item}>
									<Link
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
								</motion.div>
							))}
						</nav>

						<motion.div
							variants={itemVariants}
							className="flex items-center gap-4"
						>
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
						</motion.div>
					</div>

					{/* Mobile View */}
					<div className="flex lg:hidden items-center justify-between h-16">
						<motion.button
							variants={itemVariants}
							onClick={() => setIsOpen((s) => !s)}
							className={`p-2 -ml-2 transition-colors duration-300 ${isTransparent ? "text-white" : "text-foreground"}`}
						>
							{isOpen ? <X size={28} /> : <Menu size={28} />}
						</motion.button>

						<motion.div variants={itemVariants}>
							<Link
								href="/"
								className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${
									isTransparent
										? "opacity-0 pointer-events-none -translate-y-2"
										: "opacity-100 pointer-events-auto translate-y-0"
								}`}
								aria-label="Ir a la página principal"
								aria-hidden={isTransparent}
							>
								<Image
									src="/Atlantis.svg"
									alt="Atlantis logo"
									width={120}
									height={120}
									className={`transition-all duration-300 ${isTransparent ? "brightness-0 invert" : ""}`}
									priority
								/>
							</Link>
						</motion.div>

						<motion.button
							variants={itemVariants}
							onClick={() => setIsCartOpen(true)}
							className={`relative p-2 -mr-2 transition-colors duration-300 ${isTransparent ? "text-white" : "text-foreground"}`}
						>
							<ShoppingCart size={26} />
							{mounted && getTotalItems() > 0 && (
								<span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full h-4 w-4 text-[9px] font-bold flex items-center justify-center">
									{getTotalItems()}
								</span>
							)}
						</motion.button>
					</div>
				</div>

				{/* Upgraded Mobile Menu Overlay with AnimatePresence */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
							className="lg:hidden absolute top-full left-0 w-full bg-background/98 backdrop-blur-xl border-b border-border overflow-hidden"
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
						</motion.div>
					)}
				</AnimatePresence>
			</motion.header>

			<StickyCart
				externalOpen={isCartOpen}
				onExternalClose={() => setIsCartOpen(false)}
				whatsappNumber={whatsappNumber}
			/>
		</>
	);
}
