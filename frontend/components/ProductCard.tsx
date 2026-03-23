"use client";
export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Producto, Variante } from "@/lib/strapi/types/product";
import { placeholderImage } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
	product: Producto;
	selectedVariant?: Variante | null;
}

export default function ProductCard({
										product,
										selectedVariant,
									}: ProductCardProps) {
	const { convertAndFormatPrice } = useCurrency();
	const [isFavorite, setIsFavorite] = useState(false);

	const productUrl = `/productos/${product.documentId}`;

	// --- FAVORITES LOGIC ---
	useEffect(() => {
		try {
			const stored = localStorage.getItem("moda-peru-favorites");
			if (stored) {
				const favs = JSON.parse(stored) as string[];
				setIsFavorite(favs.includes(product.documentId || ""));
			}
		} catch (e) {
			console.error("Error loading favorites", e);
		}
	}, [product.documentId]);

	const toggleFavorite = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			const stored = localStorage.getItem("moda-peru-favorites");
			let favs: string[] = stored ? JSON.parse(stored) : [];
			const id = product.documentId || "";

			if (favs.includes(id)) {
				favs = favs.filter((itemId) => itemId !== id);
				setIsFavorite(false);
			} else {
				favs.push(id);
				setIsFavorite(true);
				toast.success("Agregado a favoritos", { duration: 1500 });
			}
			localStorage.setItem("moda-peru-favorites", JSON.stringify(favs));
		} catch (e) {
			console.error("Error updating favorites", e);
		}
	};

	// --- PRICE & IMAGE LOGIC ---
	const images = useMemo(() => {
		const main = product.imagenPrincipal?.url || placeholderImage();
		const hover = product.galeria?.[0]?.url || main;
		return { main, hover };
	}, [product]);

	const priceInfo = useMemo(() => {
		let basePrice = product.precio;
		const activeOferta = selectedVariant?.precioOferta || product.precioOferta;

		if (selectedVariant?.precioSobreescribir) {
			basePrice = selectedVariant.precioSobreescribir;
		}

		const showDiscount = !!(activeOferta && activeOferta < basePrice);
		const finalPrice = showDiscount ? activeOferta : basePrice;
		const discountPercentage = showDiscount
			? Math.round(((basePrice - (activeOferta ?? 0)) / basePrice) * 100)
			: 0;

		return { basePrice, finalPrice, showDiscount, discountPercentage };
	}, [product, selectedVariant]);

	return (
		<div key={product.documentId} className="group relative flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50">

			{/* Image Container */}
			<div className="relative w-full h-80 overflow-hidden bg-[#F9F9F9]">
				<Link href={productUrl} className="block w-full h-full">
					<Image
						src={images.main}
						alt={product.nombre}
						fill
						className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
						sizes="(max-width: 768px) 100vw, 33vw"
						priority
					/>
				</Link>

				{/* Floating Discount Badge */}
				{priceInfo.showDiscount && (
					<div className="absolute top-4 left-4 z-20">
            <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg tracking-tighter">
              -{priceInfo.discountPercentage}%
            </span>
					</div>
				)}

				{/* Actions Overlay */}
				<div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
					<button
						onClick={toggleFavorite}
						className={`p-3 rounded-full shadow-xl transition-all duration-300 ${
							isFavorite ? "bg-red-500 text-white" : "bg-white text-gray-900 hover:bg-gray-50"
						}`}
					>
						<Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
					</button>
				</div>

				{/* Quick View Button */}
				<div className="absolute inset-x-0 bottom-0 z-20 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
					<Link
						href={productUrl}
						className="w-full bg-white/90 backdrop-blur-md py-3 rounded-xl text-sm font-semibold text-gray-900 flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-sm"
					>
						Ver detalles
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>

			{/* Content Section */}
			<div className="p-5 flex flex-col gap-2">
				<div className="space-y-1">
					{product.categoria?.nombre && (
						<span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.15em] opacity-80">
							{product.categoria.nombre}
						</span>
					)}
					<Link href={productUrl}>
						<h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
							{product.nombre}
						</h3>
					</Link>
				</div>

				<div className="flex items-center gap-2.5 pt-1">
					<span className="text-xl font-black text-gray-900">
						{convertAndFormatPrice(priceInfo.finalPrice)}
					</span>

					{priceInfo.showDiscount && (
						<span className="text-sm font-medium text-gray-400 line-through decoration-dashed decoration-gray-400/60">
							{convertAndFormatPrice(priceInfo.basePrice)}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}