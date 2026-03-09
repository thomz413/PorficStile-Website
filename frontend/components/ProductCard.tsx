"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, MessageCircle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Producto, Variante } from "@/lib/strapi/types/product";

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
	const { addToCart: addToCartContext } = useCart();
	const [isFavorite, setIsFavorite] = useState(false);

	// Get the appropriate image with fallback logic
	const getProductImage = () => {
		// Priority: imagenPrincipal > galeria[0] > placeholder
		if (product.imagenPrincipal?.url) {
			return product.imagenPrincipal.url;
		}
		if (product.galeria && product.galeria.length > 0) {
			return product.galeria[0].url;
		}
		return "https://placehold.co/400x400?text=No+Imagen";
	};

	// Price calculation with variant override and discount logic
	const getPriceInfo = () => {
		let basePrice = product.precio;
		let finalPrice = product.precio;
		let discountPercentage: number | null = null;
		let discountAmount: number | null = null;
		let showDiscount = false;

		// Variant override logic
		if (selectedVariant?.precioSobreescribir) {
			basePrice = selectedVariant.precioSobreescribir;
			finalPrice = selectedVariant.precioSobreescribir;
		}

		// Discount priority: 1. Variant discount, 2. Product discount
		if (selectedVariant?.enOferta && selectedVariant.precioOferta) {
			finalPrice = selectedVariant.precioOferta;
			showDiscount = true;
			discountAmount = basePrice - finalPrice;
			discountPercentage = Math.round((discountAmount / basePrice) * 100);
		} else if (product.enOferta && product.precioOferta) {
			finalPrice = product.precioOferta;
			showDiscount = true;
			discountAmount = basePrice - finalPrice;
			discountPercentage = Math.round((discountAmount / basePrice) * 100);
		}

		return {
			basePrice,
			finalPrice,
			showDiscount,
			discountPercentage,
			discountAmount,
		};
	};

	const priceInfo = getPriceInfo();
	const productImage = getProductImage();

	const toggleFavorite = () => {
		setIsFavorite(!isFavorite);
		// Here you could add localStorage logic for favorites
	};

	const handleAddToCart = () => {
		// Check if product is available
		const isAvailable = selectedVariant
			? selectedVariant.disponible
			: product.disponible;
		if (!isAvailable) {
			toast.error("Este producto no está disponible", {
				position: "bottom-center",
			});
			return;
		}

		// Add to cart using context
		const productData = {
			id: product.id.toString(),
			nombre: product.nombre,
			precio: priceInfo.finalPrice,
			precioDescuento: priceInfo.showDiscount
				? priceInfo.finalPrice
				: undefined,
			enOferta: priceInfo.showDiscount,
			categoria: product.categoria,
			imagen: product.imagenPrincipal
				? { url: product.imagenPrincipal.url }
				: undefined,
			tallas: selectedVariant
				? [
						{
							talla: selectedVariant.talla || "",
							stock: selectedVariant.stock || 0,
							disponible: selectedVariant.disponible,
						},
					]
				: [],
		};

		const selectedItems = selectedVariant
			? [
					{
						talla: selectedVariant.talla || "",
						cantidad: 1,
						precioUnitario: priceInfo.finalPrice,
					},
				]
			: [
					{
						talla: "Default",
						cantidad: 1,
						precioUnitario: priceInfo.finalPrice,
					},
				];

		addToCartContext(productData, selectedItems);
		toast.success(`${product.nombre} agregado al carrito`, {
			position: "bottom-center",
		});
	};

	const handleWhatsAppCheckout = () => {
		// Create WhatsApp URL directly
		const message = `Hola! Estoy interesado en: ${product.nombre}${selectedVariant?.talla ? ` - Talla: ${selectedVariant.talla}` : ""}`;
		const whatsappUrl = `https://wa.me/51999999999?text=${encodeURIComponent(message)}`;
		window.open(whatsappUrl, "_blank");
	};

	// Get stock information
	const getStockInfo = () => {
		if (selectedVariant) {

			let message = "Agotado";

			if (selectedVariant.disponible && selectedVariant.stock !== undefined && selectedVariant.stock !== null) {
				message = `${selectedVariant.stock} disponibles`;
			} else if (selectedVariant.disponible) {
				message = `Disponible`;
			}

			return {
				available: selectedVariant.disponible,
				stock: selectedVariant.stock ?? 0,
				message: message,
			};
		}

		let message = "Agotado";

		if (product.disponible && product.cantidadStock !== undefined && product.cantidadStock !== null) {
			message = `${product.cantidadStock} disponibles`;
		} else if (product.disponible) {
			message = `Disponible`;

		}


		return {
			available: product?.disponible ?? false,
			stock: product?.cantidadStock ?? 0,
			message: message,
		};
	};

	const stockInfo = getStockInfo();

	return (
		<div
			className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover-lift group ${className}`}
		>
			{/* Product Image */}
			<div className="relative aspect-square overflow-hidden">
				<Link href={`/productos/${product.documentId}`}>
					<div className="relative w-full h-full transition-hover duration-300">
						<Image
							src={productImage}
							alt={product.imagenPrincipal?.name || product.nombre}
							fill
							className="object-cover group-hover:scale-105 transition-transform duration-500"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						/>
					</div>
				</Link>

				{/* Discount Badge */}
				{priceInfo.showDiscount && (
					<div className="absolute top-3 left-3 animate-fade-in">
						<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
							{priceInfo.discountPercentage
								? `-${priceInfo.discountPercentage}%`
								: `-${convertAndFormatPrice(priceInfo.discountAmount || 0)}`}
						</span>
					</div>
				)}

				{/* Favorite Button */}
				<button
					onClick={toggleFavorite}
					className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
					aria-label="Agregar a favoritos"
				>
					<Heart
						className={`h-4 w-4 transition-colors duration-200 ${
							isFavorite
								? "fill-red-500 text-red-500"
								: "text-gray-600 hover:text-red-500"
						}`}
					/>
				</button>

				{/* Quick Actions */}
				<div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<button
						onClick={handleAddToCart}
						className="flex-1 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors duration-200"
					>
						<ShoppingCart className="h-3 w-3 inline mr-1" />
						Agregar
					</button>
					<button
						onClick={handleWhatsAppCheckout}
						className="flex-1 bg-green-600/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-200"
					>
						<MessageCircle className="h-3 w-3 inline mr-1" />
						WhatsApp
					</button>
				</div>
			</div>

			{/* Product Info */}
			<div className="p-4 space-y-3">
				{/* Category */}
				{product.categoria?.nombre && (
					<p className="text-xs text-gray-500 uppercase tracking-wide animate-fade-in">
						{product.categoria.nombre}
					</p>
				)}

				{/* Product Name */}
				<Link href={`/productos/${product.slug || product.id}`}>
					<h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-200">
						{product.nombre}
					</h3>
				</Link>

				{/* Price Display */}
				<div className="space-y-1">
					{priceInfo.showDiscount ? (
						<>
							<div className="flex items-center gap-2 animate-fade-in">
								<span className="text-sm text-gray-500 line-through">
									{convertAndFormatPrice(priceInfo.basePrice)}
								</span>
								<span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
									-
									{Math.round(
										((priceInfo.basePrice - priceInfo.finalPrice) /
											priceInfo.basePrice) *
											100,
									)}
									%
								</span>
							</div>
							<div className="text-xl font-bold text-primary">
								{convertAndFormatPrice(priceInfo.finalPrice)}
							</div>
						</>
					) : (
						<div className="text-xl font-bold text-gray-900">
							{convertAndFormatPrice(priceInfo.finalPrice)}
						</div>
					)}
				</div>

				{/* Stock Status */}
				<div className="flex items-center gap-2 text-sm">
					<div
						className={`w-2 h-2 rounded-full ${
							stockInfo.available
								? "bg-green-500 animate-pulse-slow"
								: "bg-red-500"
						}`}
					/>
					<span
						className={stockInfo.available ? "text-green-700" : "text-red-700"}
					>
						{stockInfo.message}
					</span>
				</div>
			</div>
		</div>
	);
}
