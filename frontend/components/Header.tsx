"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import CurrencySelector from "./CurrencySelector";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur-md transition-all duration-300 shadow-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-20 items-center justify-between">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-3 group">
						<div className="flex items-center justify-center text-3xl font-black text-primary transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">
							✦
						</div>
						<div className="hidden sm:flex flex-col leading-tight">
							<span className="text-xs font-black text-accent tracking-widest uppercase">
								Moda
							</span>
							<span className="text-lg font-black text-foreground">PERU</span>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden gap-8 md:flex">
						<Link
							href="/productos"
							className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 px-3 py-2 tracking-wide uppercase relative group"
						>
							Tienda
							<span className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-300"></span>
						</Link>
						<Link
							href="/nosotros"
							className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 px-3 py-2 tracking-wide uppercase relative group"
						>
							Nosotros
							<span className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-300"></span>
						</Link>
						<Link
							href="/contacto"
							className="text-sm font-black text-foreground hover:text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 px-3 py-2 tracking-wide uppercase relative group"
						>
							Contacto
							<span className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-300"></span>
						</Link>
					</nav>

					{/* Right Actions */}
					<div className="flex items-center gap-2 sm:gap-4">
						{/* Currency Selector */}
						<div className="hidden sm:block">
							<CurrencySelector />
						</div>
						
						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="md:hidden rounded-lg p-2.5 hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-primary"
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
	);
}
