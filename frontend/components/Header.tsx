"use client";

import Link from "next/link";
import { Menu, X, ShoppingCart, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import CurrencySelector from "./CurrencySelector";
import StickyCart from "./StickyCart";
import Image from "next/image";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useCartStore } from "@/stores/useCartStore";
import {useStore} from "zustand/react";

export default function Header({
	whatsappNumber,
}: {
	whatsappNumber?: string | null;
	showLogo?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [favoritesCount, setFavoritesCount] = useState(0);

	// 2. Pull the logic from Zustand
	const hasHydrated = useHasHydrated();

	const totalItems = useStore(useCartStore, (state) => state.getTotalItems());
	// We call the function to get the actual number
	const cartCount = hasHydrated ? totalItems : 0;

	useEffect(() => {
		const updateFavoritesCount = () => {
			if (typeof window === "undefined") return;
			try {
				const stored = localStorage.getItem("moda-peru-favorites");
				const count = stored ? JSON.parse(stored).length : 0;
				setFavoritesCount(count);
			} catch {
				setFavoritesCount(0);
			}
		};

		updateFavoritesCount();

		const handleStorageChange = () => {
			updateFavoritesCount();
		};

		window.addEventListener("storage", handleStorageChange);
		// Custom event for internal favorite toggles
		window.addEventListener("favorites-updated", handleStorageChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener("favorites-updated", handleStorageChange);
		};
	}, []);

	return (
		<>
			<header className="fixed top-0 z-50 w-full transition-all duration-500 bg-background/90 backdrop-blur-lg border-b border-border shadow-lg py-0">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Desktop View */}
					<div className="hidden lg:flex items-center justify-between h-20">
						<Link href="/" className="flex items-center gap-3 group">
							<div className="flex flex-col items-center justify-center">
								<div className="rounded-full p-1 transition-shadow duration-300 group-hover:scale-105 transform bg-linear-to-br from-yellow-300/10 via-amber-200/10 to-red-200/5 ring-1 ring-amber-200/10">
									<Image
										src="/Atlantis.svg"
										alt="Atlantis logo"
										width={120}
										height={120}
										priority
										className="object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
									/>
								</div>
								<span className="mt-1 text-xs leading-4 font-black font-inter uppercase tracking-[0.22em] text-gold-dark">
									PORFIC STILE
								</span>
							</div>
						</Link>

						<nav className="flex items-center gap-2">
							{["Tienda", "Nosotros", "Contacto"].map((item) => (
								<Link
									key={item}
									href={`/${item.toLowerCase() === "tienda" ? "productos" : item.toLowerCase()}`}
									className="text-xs font-bold transition-colors duration-300 px-5 py-2 uppercase tracking-widest relative group text-foreground"
								>
									{item}
									<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-1/2 transition-all duration-300 rounded-full" />
								</Link>
							))}
						</nav>

						<div className="flex items-center gap-4">
							<CurrencySelector />

							<Link
								href="/favoritos"
								className="relative rounded-full p-2.5 transition-all active:scale-95 hover:bg-red-50 text-foreground"
							>
								<Heart className="h-5 w-5" />
								{favoritesCount > 0 && (
									<span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
										{favoritesCount}
									</span>
								)}
							</Link>

							<button
								onClick={() => setIsCartOpen(true)}
								className="relative rounded-full p-2.5 transition-all active:scale-95 hover:bg-primary/10 text-foreground"
							>
								<ShoppingCart className="h-6 w-6" />
								{/* 3. Use the hydrated cartCount */}
								{cartCount > 0 && (
									<span className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full h-5 w-5 text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
										{cartCount}
									</span>
								)}
							</button>
						</div>
					</div>

					{/* Mobile View */}
					<div className="flex lg:hidden items-center justify-between h-16">
						<button
							onClick={() => setIsOpen((s) => !s)}
							className="p-2 -ml-2 text-foreground"
						>
							{isOpen ? <X size={28} /> : <Menu size={28} />}
						</button>

						<Link href="/" className="absolute left-1/2 -translate-x-1/2">
							<Image src="/Atlantis.svg" alt="Logo" width={120} height={120} />
						</Link>

						<button
							onClick={() => setIsCartOpen(true)}
							className="relative p-2 -mr-2 text-foreground"
						>
							<ShoppingCart size={26} />
							{cartCount > 0 && (
								<span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full h-4 w-4 text-[9px] font-bold flex items-center justify-center">
									{cartCount}
								</span>
							)}
						</button>
					</div>
				</div>
				{/* ... Mobile Menu Logic ... */}
			</header>

			<StickyCart
				externalOpen={isCartOpen}
				onExternalClose={() => setIsCartOpen(false)}
				whatsappNumber={whatsappNumber}
			/>
		</>
	);
}
