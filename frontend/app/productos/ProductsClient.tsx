"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import StickyCart from "@/components/StickyCart";
import { Filter, ShoppingBag } from "lucide-react";
import { SiteSettings } from "@/lib/strapi/types/settings";
import { Producto } from "@/lib/strapi/types/product";
import { Category } from "@/lib/strapi/types/category";
import { animations, transitions } from "@/lib/animations";

type Props = {
	products: Producto[];
	categories: Category[];
	settings?: SiteSettings;
};

export default function ProductsClient({
	products,
	categories,
	settings,
}: Props) {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const filteredProducts = selectedCategory
		? products.filter(
				(product) => product.categoria?.nombre === selectedCategory,
			)
		: products;

	return (
		<section className="pt-16  px-4 sm:px-6 lg:px-8 bg-background">
			<div className="max-w-7xl mx-auto">
				{/* Header Section - Better spacing for mobile */}
				<motion.div
					initial="hidden"
					animate="visible"
					variants={animations.container}
					className="text-left md:text-center mb-8 md:mb-12 space-y-2"
				>
					<motion.h1
						variants={animations.fadeInUp}
						className="text-3xl md:text-5xl font-bold tracking-tight text-foreground"
					>
						Nuestra <span className="text-primary italic">Colección</span>
					</motion.h1>
					<motion.p
						variants={animations.fadeInUp}
						className="text-sm md:text-lg text-muted-foreground max-w-2xl md:mx-auto leading-relaxed"
					>
						Ropa premium peruana con diseño único y calidad excepcional.
					</motion.p>
				</motion.div>

				{/* Enhanced Sticky Category Filter Bar */}
				<div className="sticky top-[64px] z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50 mb-6 overflow-hidden">
					<div className="relative">
						<motion.div
							initial="hidden"
							animate="visible"
							variants={animations.container}
							className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 snap-x snap-mandatory sm:flex-wrap sm:justify-center items-center"
						>
							{/* "Todos" Button */}
							<motion.button
								variants={animations.scaleIn}
								onClick={() => setSelectedCategory(null)}
								className={`snap-start whitespace-nowrap px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
									selectedCategory === null
										? "bg-foreground text-background shadow-lg"
										: "bg-muted text-muted-foreground border border-transparent hover:border-foreground/20"
								}`}
							>
								Todos
								<span className="opacity-50 text-[10px]">
									{products.length}
								</span>
							</motion.button>

							{categories.map((category) => {
								const count = products.filter(
									(p) => p.categoria?.nombre === category.nombre,
								).length;
								return (
									<motion.button
										key={category.id}
										variants={animations.scaleIn}
										onClick={() => setSelectedCategory(category.nombre || "")}
										className={`snap-start whitespace-nowrap px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
											selectedCategory === category.nombre
												? "bg-foreground text-background shadow-lg"
												: "bg-muted text-muted-foreground border border-transparent hover:border-foreground/20"
										}`}
									>
										{category.nombre}
										<span className="opacity-50 text-[10px]">{count}</span>
									</motion.button>
								);
							})}
						</motion.div>

						{/* Gradient Fade for Mobile Scroll Hint */}
						<div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
					</div>
				</div>

				{/* Products Grid - 2 columns on mobile is key! */}
				<AnimatePresence mode="wait">
					{filteredProducts.length === 0 ? (
						<motion.div
							key="empty"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex flex-col items-center justify-center py-20 text-center"
						>
							<div className="bg-muted p-4 rounded-full mb-4">
								<Filter className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-bold">No hay resultados</h3>
							<p className="text-sm text-muted-foreground mt-1">
								Intenta seleccionando otra categoría.
							</p>
						</motion.div>
					) : (
						<motion.div
							key="products"
							initial="hidden"
							animate="visible"
							variants={animations.container}
							/* Grid Fix: 2 columns on very small screens, 3 on tablets, 4 on desktop */
							className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-8"
						>
							{filteredProducts.map((product) => (
								<motion.div
									key={product.id}
									variants={animations.fadeInUp}
									layout
									className="w-full"
								>
									<ProductCard product={product} />
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Sticky Components */}
			<div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none z-50">
				<div className="max-w-7xl mx-auto flex justify-end pointer-events-auto">
					<StickyCart whatsappNumber={settings?.numeroWhatsapp} />
				</div>
			</div>
		</section>
	);
}
