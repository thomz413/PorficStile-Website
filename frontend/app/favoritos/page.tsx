"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { animations } from "@/lib/animations";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/footer/Footer";
import { getProductById } from "@/lib/strapi";
import { Producto } from "@/lib/strapi/types/product";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fadeInUp = animations.fadeInUp;
const containerVariants = animations.container;

export default function FavoritesPage() {
	const [favorites, setFavorites] = useState<Producto[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadFavorites = async () => {
			try {
				const stored = localStorage.getItem("moda-peru-favorites");
				if (stored) {
					const favoriteIds = JSON.parse(stored) as string[];

					const productPromises = favoriteIds.map((id) =>
						getProductById(id).catch(() => null)
					);

					const products = await Promise.all(productPromises);
					const validProducts = products.filter(
						(product) => product !== null
					) as Producto[];

					setFavorites(validProducts);
				}
			} catch (error) {
				console.error("Error loading favorites:", error);
			} finally {
				setLoading(false);
			}
		};

		loadFavorites();
	}, []);

	const removeFavorite = (productId: string) => {
		try {
			const stored = localStorage.getItem("moda-peru-favorites");
			let favs: string[] = stored ? JSON.parse(stored) : [];

			favs = favs.filter((id) => id !== productId);
			localStorage.setItem("moda-peru-favorites", JSON.stringify(favs));

			setFavorites((prev) =>
				prev.filter((product) => product.documentId !== productId)
			);
		} catch (error) {
			console.error("Error removing favorite:", error);
		}
	};

	if (loading) {
		return (
			<>
				<Header />
				<main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 lg:pt-20 pt-16 pb-16">
					<div className="container mx-auto px-4 py-8">
						<motion.div
							initial="hidden"
							animate="visible"
							variants={fadeInUp}
							className="text-center py-16"
						>
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
							<p className="text-gray-600">Cargando favoritos...</p>
						</motion.div>
					</div>
				</main>
				<Footer />
			</>
		);
	}

	return (
		<>
			<Header />
			<main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 lg:pt-24 pt-16 pb-16">
				<div className="container mx-auto px-4 py-8">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={fadeInUp}
						className="text-center mb-12"
					>
						<div className="flex items-center justify-center gap-3 mb-4">
							<Heart className="h-8 w-8 text-red-500 fill-current" />
							<h1 className="text-4xl font-bold text-gray-900">
								Mis Favoritos
							</h1>
						</div>
						<p className="text-gray-600 text-lg">
							Tus productos guardados para comprar más tarde
						</p>
					</motion.div>

					{favorites.length === 0 ? (
						<motion.div
							initial="hidden"
							animate="visible"
							variants={fadeInUp}
							className="text-center py-16"
						>
							<div className="max-w-md mx-auto">
								<Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
								<h2 className="text-2xl font-semibold text-gray-900 mb-4">
									No tienes favoritos aún
								</h2>
								<p className="text-gray-600 mb-8">
									Agrega productos a tus favoritos para verlos aquí más tarde
								</p>
								<Link href="/productos">
									<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
										<ShoppingBag className="h-4 w-4 mr-2" />
										Explorar Productos
									</Button>
								</Link>
							</div>
						</motion.div>
					) : (
						<motion.div
							initial="hidden"
							animate="visible"
							variants={containerVariants}
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
						>
							{favorites.map((product, index) => (
								<motion.div
									key={product.documentId}
									variants={fadeInUp}
									custom={index}
								>
									<ProductCard product={product} />
								</motion.div>
							))}
						</motion.div>
					)}
				</div>
			</main>
			<Footer />
		</>
	);
}