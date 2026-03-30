"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Producto, Variante } from "@/lib/strapi/types/product";
import { placeholderImage, cn } from "@/lib/utils"; // Assuming you have a cn helper

interface ProductCardProps {
	product: Producto;
	selectedVariant?: Variante | null;
	className?: string;
}

export default function ProductCard({
										product,
										selectedVariant,
										className = "",
									}: ProductCardProps) {
	const { convertAndFormatPrice } = useCurrency();
	const [isFavorite, setIsFavorite] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const productUrl = `/productos/${product.slug}`;

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

	const images = useMemo(() => ({
		main: product.imagenPrincipal?.url || placeholderImage(),
		hover: product.galeria?.[0]?.url || product.imagenPrincipal?.url || placeholderImage(),
	}), [product]);

	const priceInfo = useMemo(() => {
		let basePrice = product.precio;
		const activeOferta = selectedVariant?.precioOferta || product.precioOferta;
		if (selectedVariant?.precioSobreescribir) basePrice = selectedVariant.precioSobreescribir;

		const showDiscount = !!(activeOferta && activeOferta < basePrice);
		const finalPrice = showDiscount ? activeOferta : basePrice;
		const discountPercentage = showDiscount
			? Math.round(((basePrice - (activeOferta ?? 0)) / basePrice) * 100)
			: 0;

		return { basePrice, finalPrice, showDiscount, discountPercentage };
	}, [product, selectedVariant]);

	return (
		<motion.div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				"group relative flex flex-col bg-white rounded-[2rem] overflow-hidden transition-all duration-500",
				className
			)}
		>
			{/* Image Section - Using aspect-4/5 which we know works in your config */}
			<div className="relative aspect-4/5 w-full overflow-hidden bg-[#F9F9F9]">
				<Link href={productUrl} className="block w-full h-full">
					{/* Primary Image */}
					<Image
						src={images.main}
						alt={product.nombre}
						fill
						className={cn(
							"object-cover transition-all duration-700 ease-in-out",
							"opacity-100", // Always visible by default
							isHovered ? "md:opacity-0 md:scale-105" : "scale-100"
						)}
						sizes="(max-width: 768px) 50vw, 33vw"
					/>
					{/* Hover Image (Desktop only effect) */}
					<Image
						src={images.hover}
						alt={product.nombre}
						fill
						className={cn(
							"object-cover transition-all duration-700 ease-in-out hidden md:block",
							isHovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
						)}
						sizes="33vw"
					/>
				</Link>

				{/* Floating Badges */}
				<div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-2">
					{priceInfo.showDiscount && (
						<span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg backdrop-blur-md">
              -{priceInfo.discountPercentage}%
            </span>
					)}
				</div>

				{/* Favorite Button - Visible on mobile, slides in on desktop */}
				<div className="absolute top-3 right-3 md:top-4 md:right-4">
					<button
						onClick={toggleFavorite}
						className={cn(
							"p-2.5 md:p-3 rounded-full shadow-xl transition-all duration-300",
							isFavorite
								? "bg-red-500 text-white"
								: "bg-white/90 text-gray-900 hover:bg-white md:translate-x-12 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100"
						)}
					>
						<Heart className={cn("h-4 w-4 md:h-5 md:w-5", isFavorite && "fill-current")} />
					</button>
				</div>

				{/* Quick View Button - Desktop Only */}
				<div className="hidden md:block absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
					<Link
						href={productUrl}
						className="w-full bg-white/90 backdrop-blur-md py-3 rounded-xl text-sm font-semibold text-gray-900 flex items-center justify-center gap-2 hover:bg-white transition-colors"
					>
						Ver detalles
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>

			{/* Content Section */}
			<div className="p-3 md:p-5 flex flex-col gap-1 md:gap-2">
				<div className="space-y-0.5">
					{product.categoria?.nombre && (
						<span className="text-[9px] md:text-[11px] font-bold text-indigo-600 uppercase tracking-widest opacity-80">
              {product.categoria.nombre}
            </span>
					)}
					<Link href={productUrl}>
						<h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
							{product.nombre}
						</h3>
					</Link>
				</div>

				<div className="flex items-center gap-2 md:gap-3">
          <span className="text-base md:text-xl font-bold text-gray-900">
            {convertAndFormatPrice(priceInfo.finalPrice)}
          </span>
					{priceInfo.showDiscount && (
						<span className="text-[10px] md:text-sm font-medium text-gray-400 line-through">
              {convertAndFormatPrice(priceInfo.basePrice)}
            </span>
					)}
				</div>
			</div>
		</motion.div>
	);
}