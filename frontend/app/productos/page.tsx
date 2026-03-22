"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts, getCategories, getSettings } from "@/lib/strapi";
import ProductCard from "@/components/ProductCard";
import StickyCart from "@/components/StickyCart";
import { Filter } from "lucide-react";
import { SiteSettings } from "@/lib/strapi/types/settings";
import { Producto } from "@/lib/strapi/types/product";
import { Category } from "@/lib/strapi/types/category";
import FooterWrapper from "@/components/footer/Footer";
import Header from "@/components/Header";
import { animations, transitions } from "@/lib/animations";

export default function ProductsPage() {
	const [products, setProducts] = useState<Producto[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	// TODO tallas y rango de precio

	const [loading, setLoading] = useState(true);
	const [settings, setSettings] = useState<SiteSettings | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [productsData, categoriesData, settingsData] = await Promise.all([
					getProducts(),
					getCategories(),
					getSettings(),
				]);

				setProducts(productsData);
				setCategories(categoriesData);
				setSettings(settingsData);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const filteredProducts = selectedCategory
		? products.filter(
				(product) => product.categoria?.nombre === selectedCategory,
			)
		: products;

	const handleCategoryFilter = async (categoryName: string) => {
		setSelectedCategory(
			categoryName === selectedCategory ? null : categoryName,
		);
	};

	if (loading) {
		return (
			<main className="min-h-screen bg-background pt-16">
				<Header whatsappNumber={settings?.numeroWhatsapp} />
				<div className="flex items-center justify-center h-96">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						className="rounded-full h-12 w-12 border-b-2 border-blue-600"
					/>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background pt-16">
			<Header whatsappNumber={settings?.numeroWhatsapp} />

			{/* Header Section */}
			<section className="pt-20 pb-40 px-4 sm:px-6 lg:px-8">
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
							Descubre nuestra colección exclusiva de ropa premium peruana con
							diseño único y calidad excepcional.
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
									key={category.id}
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
								className={
									"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
								}
							>
								{filteredProducts.map((product) => (
									<motion.div
										key={product.id}
										variants={animations.fadeInUp}
										whileHover={{ y: -4 }}
										layout
									>
										<ProductCard product={product} />
									</motion.div>
								))}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</section>

			{/* Footer */}

			<FooterWrapper />
			{/* Sticky Cart - for sticky button functionality */}
			<StickyCart whatsappNumber={settings?.numeroWhatsapp} />
		</main>
	);
}
