"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter } from "lucide-react";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import StickyCart from "@/components/StickyCart";
import { animations, transitions } from "@/lib/animations";
import { Category } from "@/lib/strapi/types/category";
import { Producto } from "@/lib/strapi/types/product";
import { SiteSettings } from "@/lib/strapi/types/settings";

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

	const handleCategoryFilter = (categoryName: string) => {
		setSelectedCategory(
			categoryName === selectedCategory ? null : categoryName,
		);
	};

	return (
		<section className="pt-20 pb-35 md:pb-45 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={animations.container}
					transition={transitions.smooth}
					className="text-center mb-12"
				>
					<motion.h1
						variants={animations.fadeInUp}
						transition={transitions.smooth}
						className="text-4xl md:text-5xl font-bold text-foreground mb-4"
					>
						Nuestros Productos
					</motion.h1>
					<motion.p
						variants={animations.fadeInUp}
						transition={transitions.smooth}
						className="text-lg text-muted-foreground max-w-2xl mx-auto"
					>
						Descubre nuestra colección exclusiva de ropa de calidad excepcional.
					</motion.p>
				</motion.div>

				{/* Sticky Category Filter Bar */}
				<div className="sticky top-16 z-30 pt-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 bg-background/90 backdrop-blur-md border-b border-border/40 mb-8">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={animations.container}
						transition={transitions.smooth}
						className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-3 sm:flex-wrap sm:justify-center items-center"
					>
						<motion.button
							variants={animations.scaleIn}
							transition={transitions.fast}
							onClick={() => setSelectedCategory(null)}
							className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
								selectedCategory === null
									? "bg-foreground text-background shadow-md scale-100"
									: "bg-background text-muted-foreground border-foreground border-2 hover:text-foreground scale-95 hover:scale-100"
							}`}
						>
							Todos
						</motion.button>

						{categories.map((category) => (
							<motion.button
								key={category.documentId}
								variants={animations.scaleIn}
								transition={transitions.fast}
								onClick={() => handleCategoryFilter(category.nombre || "")}
								className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
									selectedCategory === category.nombre
										? "bg-foreground text-background shadow-md scale-100"
										: "bg-background text-muted-foreground border-foreground border-2 hover:text-foreground scale-95 hover:scale-100"
								}`}
							>
								{category.nombre}
							</motion.button>
						))}
					</motion.div>
				</div>

				{/* Products Grid/List */}
				<AnimatePresence mode="wait">
					{filteredProducts.length === 0 ? (
						<motion.div
							key="empty"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
							className="text-center py-12"
						>
							<motion.div
								animate={{ y: [-10, 0, -10] }}
								transition={{ duration: 2, repeat: Infinity }}
								className="inline-block"
							>
								<Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
							</motion.div>
							<h3 className="text-lg font-medium mb-2">
								{selectedCategory
									? `No hay productos en "${selectedCategory}"`
									: "No hay productos disponibles"}
							</h3>
							<p className="text-sm text-muted-foreground">
								Intenta seleccionar otra categoría o ajusta los filtros.
							</p>
						</motion.div>
					) : (
						<motion.div
							key="products"
							initial="hidden"
							animate="visible"
							variants={animations.container}
							transition={transitions.smooth}
							className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-8"
						>
							{filteredProducts.map((product) => (
								<motion.div
									key={product.documentId}
									variants={animations.fadeInUp}
									whileHover={{ y: -4 }}
									layout
									className="w-full"
								>
									<ProductCard product={product} />
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Spacer to prevent overlap with fixed cart */}
				<div className="h-16 md:h-24" />
			</div>

			{/* Sticky Cart (fixed, with breathing space) */}
			<div className="fixed bottom-4 left-0 right-0 px-4 z-50 pointer-events-none">
				<div className="max-w-7xl mx-auto flex justify-end pointer-events-auto">
					<StickyCart whatsappNumber={settings?.numeroWhatsapp} />
				</div>
			</div>
		</section>
	);
}
