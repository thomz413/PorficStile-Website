"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import ProductGallery from "@/components/ProductGallery";
import VariantSelector from "@/components/VariantSelector";
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";
import {
	getProductById,
	getSettings,
	getStrapiImageUrl,
	Producto,
	Variante,
} from "@/lib/strapi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { canAddToCart, addToCart, createWhatsAppCheckoutURL } from "@/lib/cart";

export default function ProductDetailPage() {
	const params = useParams();
	const productId = params.id as string;

	const [product, setProduct] = useState<Producto | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<Variante | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [loading, setLoading] = useState(true);
	const [isFavorite, setIsFavorite] = useState(false);
	const [whatsappNumber, setWhatsappNumber] = useState<string | undefined>();
	const { convertAndFormatPrice } = useCurrency();
	const { addToCart: addToCartContext } = useCart();

	// Check if product has unlimited availability (only disponible=true, other fields null)
	const hasUnlimitedAvailability = product?.disponible === true && 
		!product.cantidadStock && 
		(!product.variante || product.variante.length === 0);

	useEffect(() => {
		async function loadProduct() {
			try {
				const [productData, settings] = await Promise.all([
					getProductById(productId),
					getSettings(),
				]);

				setProduct(productData);
				setWhatsappNumber(settings?.numeroWhatsapp);

				// Initialize favorite from localStorage
				try {
					const favsRaw = localStorage.getItem("moda-peru-favs") || "{}";
					const favs = JSON.parse(favsRaw) as Record<string, boolean>;
					setIsFavorite(Boolean(favs[productId]));
				} catch (e) {
					// ignore
				}

				// Auto-select first available variant if exists
				if (productData?.variante && productData.variante.length > 0) {
					const firstAvailable = productData.variante.find(v => v.disponible) || productData.variante[0];
					setSelectedVariant(firstAvailable);
				}

			} catch (error) {
				console.error("Error loading product:", error);
				toast.error("No se pudo cargar el producto");
			} finally {
				setLoading(false);
			}
		}

		loadProduct();
	}, [productId, toast]);

	function toggleFavorite() {
		setIsFavorite((s) => {
			const next = !s;
			try {
				const favsRaw = localStorage.getItem("moda-peru-favs") || "{}";
				const favs = JSON.parse(favsRaw) as Record<string, boolean>;
				favs[productId] = next;
				localStorage.setItem("moda-peru-favs", JSON.stringify(favs));
			} catch (e) {
				// ignore
			}
			return next;
		});
	}

	const handleAddToCart = () => {
		if (!product) return;

		// Check if product is available
		const isAvailable = selectedVariant ? selectedVariant.disponible : product.disponible;
		if (!isAvailable) {
			toast.error("Este producto no está disponible en este momento");
			return;
		}

		// Add to cart using context
		const productData = {
			id: product.id.toString(),
			nombre: product.nombre,
			precio: finalPrice,
			precioDescuento: discountPercentage > 0 ? finalPrice : undefined,
			enOferta: discountPercentage > 0,
			categoria: product.categoria,
			imagen: product.imagenPrincipal ? { url: product.imagenPrincipal.url } : undefined,
			tallas: selectedVariant ? [{
				talla: selectedVariant.talla || '',
				stock: selectedVariant.stock || 0,
				disponible: selectedVariant.disponible
			}] : []
		};

		const selectedItems = selectedVariant ? [{
			talla: selectedVariant.talla || '',
			cantidad: quantity,
			precioUnitario: finalPrice
		}] : [{
			talla: 'Default',
			cantidad: quantity,
			precioUnitario: finalPrice
		}];

		addToCartContext(productData, selectedItems);
		toast.success(`${product.nombre} se ha agregado a tu carrito`);
	};

	const handleWhatsAppCheckout = () => {
		if (!product) return;

		const message = `Hola! Estoy interesado en: ${product.nombre}${selectedVariant?.talla ? ` - Talla: ${selectedVariant.talla}` : ''}${quantity > 1 ? ` - Cantidad: ${quantity}` : ''}`;
		const whatsappUrl = `https://wa.me/${whatsappNumber?.replace(/\D/g, '') || '51999999999'}?text=${encodeURIComponent(message)}`;
		window.open(whatsappUrl, '_blank');
	};

	// Calculate final price with variant override and discount logic
	const getFinalPrice = () => {
		if (!product) return 0;

		let basePrice = product.precio;
		let finalPrice = product.precio;

		// Variant override logic
		if (selectedVariant?.precioSobreescribir) {
			basePrice = selectedVariant.precioSobreescribir;
			finalPrice = selectedVariant.precioSobreescribir;
		}

		// Discount priority: 1. Variant discount, 2. Product discount
		if (selectedVariant?.enOferta && selectedVariant.precioOferta) {
			finalPrice = selectedVariant.precioOferta;
		} else if (product.enOferta && product.precioOferta) {
			finalPrice = product.precioOferta;
		}

		return finalPrice;
	};

	// Calculate discount percentage
	const getDiscountPercentage = () => {
		if (!product) return 0;

		let originalPrice = product.precio;
		let discountPrice = product.precio;

		// Variant override logic
		if (selectedVariant?.precioSobreescribir) {
			originalPrice = selectedVariant.precioSobreescribir;
			discountPrice = selectedVariant.precioSobreescribir;
		}

		// Discount logic
		if (selectedVariant?.enOferta && selectedVariant.precioOferta) {
			discountPrice = selectedVariant.precioOferta;
		} else if (product.enOferta && product.precioOferta) {
			discountPrice = product.precioOferta;
		}

		if (discountPrice < originalPrice) {
			return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
		}
		return 0;
	};

	// Get stock information
	const getStockInfo = () => {
		if (hasUnlimitedAvailability) {
			return { available: true, stock: "Ilimitado", message: "Disponible" };
		}

		if (selectedVariant) {
			return {
				available: selectedVariant.disponible,
				stock: selectedVariant.stock ?? 0,
				message: selectedVariant.disponible ? `${selectedVariant.stock} disponibles` : "Agotado"
			};
		}

		return {
			available: product?.disponible ?? false,
			stock: product?.cantidadStock ?? 0,
			message: product?.disponible ? `${product?.cantidadStock} disponibles` : "Agotado"
		};
	};

	const stockInfo = getStockInfo();
	const finalPrice = getFinalPrice();
	const discountPercentage = getDiscountPercentage();

	if (loading) {
		return (
			<main className="min-h-screen bg-gray-50">
				<Header />
				<div className="flex items-center justify-center h-96">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				</div>
			</main>
		);
	}

	if (!product) {
		return (
			<main className="min-h-screen bg-gray-50">
				<Header />
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center">
						<h1 className="text-3xl font-bold text-gray-900 mb-4">
							Producto no encontrado
						</h1>
						<p className="text-gray-600 mb-8">
							No encontramos este producto. Vuelve al catálogo.
						</p>
						<Link
							href="/productos"
							className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
						>
							<ArrowLeft className="h-5 w-5" />
							Volver a Productos
						</Link>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background">
			<Header />

			{/* Breadcrumb */}
			<div className="bg-white border-b animate-fade-in">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<Link
						href="/productos"
						className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
					>
						<ArrowLeft className="h-4 w-4" />
						Volver a Productos
					</Link>
				</div>
			</div>

			{/* Product Detail */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Product Gallery */}
					<div className="animate-fade-in">
						<ProductGallery
							product={product}
							selectedVariant={selectedVariant}
						/>
					</div>

					{/* Product Info */}
					<div className="space-y-6 animate-fade-in-up animation-delay-200">
						{/* Category Badge */}
						{product.categoria && (
							<Badge variant="secondary" className="inline-block animate-scale-in">
								{product.categoria.nombre}
							</Badge>
						)}

						{/* Title */}
						<h1 className="text-3xl font-bold text-gray-900">
							{product.nombre}
						</h1>

						{/* Price */}
						<div className="space-y-2">
							{discountPercentage > 0 && (
								<div className="flex items-center gap-2 animate-fade-in">
									<Badge className="bg-red-500 text-white">
										-{discountPercentage}%
									</Badge>
									<span className="text-lg text-gray-500 line-through">
										{convertAndFormatPrice(finalPrice)}
									</span>
								</div>
							)}
							<div className="text-3xl font-bold text-gray-900">
								{convertAndFormatPrice(finalPrice)}
							</div>
						</div>

						{/* Variant Selector */}
						{product.variante && product.variante.length > 0 && (
							<div className="animate-fade-in animation-delay-300">
								<VariantSelector
									product={product}
									selectedVariant={selectedVariant}
									onVariantSelect={setSelectedVariant}
								/>
							</div>
						)}

						{/* Quantity Selector */}
						{stockInfo.available && (
							<div className="space-y-2 animate-fade-in animation-delay-400">
								<label className="text-sm font-medium text-gray-700">
									Cantidad
								</label>
								<div className="flex items-center gap-3">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										disabled={quantity <= 1}
										className="transition-all duration-200 hover-scale"
									>
										<Minus className="h-4 w-4" />
									</Button>
									<Input
										type="number"
										min={hasUnlimitedAvailability ? 1 : 1}
										max={hasUnlimitedAvailability ? undefined : stockInfo.stock}
										value={quantity}
										onChange={(e) => {
											const val = parseInt(e.target.value) || 1;
											if (hasUnlimitedAvailability) {
												setQuantity(Math.max(1, val));
											} else {
												setQuantity(Math.max(1, Math.min(val, Number(stockInfo.stock))));
											}
										}}
										className="w-20 text-center"
									/>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											if (hasUnlimitedAvailability) {
												setQuantity(quantity + 1);
											} else {
												setQuantity(Math.min(Number(stockInfo.stock), quantity + 1));
											}
										}}
										disabled={!hasUnlimitedAvailability && quantity >= Number(stockInfo.stock)}
										className="transition-all duration-200 hover-scale"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								{!hasUnlimitedAvailability && (
									<p className="text-sm text-gray-600">
										{stockInfo.stock} unidades disponibles
									</p>
								)}
							</div>
						)}

						{/* Stock Status */}
						<div className="flex items-center gap-2 animate-fade-in animation-delay-500">
							<div className={`w-3 h-3 rounded-full ${
								stockInfo.available ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500'
							}`} />
							<span className={`text-sm font-medium ${
								stockInfo.available ? 'text-green-700' : 'text-red-700'
							}`}>
								{stockInfo.message}
							</span>
						</div>

						{/* Description */}
						{product.descripcion && (
							<div className="space-y-2 animate-fade-in animation-delay-600">
								<h3 className="text-lg font-semibold text-gray-900">Descripción</h3>
								<p className="text-gray-600 leading-relaxed">
									{product.descripcion}
								</p>
							</div>
						)}

						{/* Actions */}
						<div className="space-y-4 pt-6 animate-fade-in animation-delay-700">
							{/* Add to Cart */}
							<Button
								onClick={handleAddToCart}
								disabled={!stockInfo.available}
								className="w-full hover-lift"
								size="lg"
							>
								<ShoppingCart className="h-5 w-5 mr-2" />
								Agregar al Carrito
							</Button>

							{/* WhatsApp Checkout */}
							{whatsappNumber && (
								<Button
									onClick={handleWhatsAppCheckout}
									disabled={!stockInfo.available}
									className="w-full hover-lift bg-[#25D366] hover:bg-[#128C7E] text-white border-[#25D366]"
									size="lg"
								>
									Pedir por WhatsApp
								</Button>
							)}

							{/* Favorite */}
							<Button
								onClick={toggleFavorite}
								variant="outline"
								className="w-full hover-lift"
								size="lg"
							>
								<Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
								{isFavorite ? 'Favorito' : 'Agregar a Favoritos'}
							</Button>
						</div>
					</div>
				</div>

				{/* Additional Info */}
				{product.descripcion && (
					<section className="mt-16 pt-8 border-t animate-fade-in animation-delay-1000">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 mb-4">
									Detalles del producto
								</h2>
								<div className="space-y-3">
									<p>
										<span className="font-semibold">Categoría:</span>{" "}
										{product.categoria?.nombre}
									</p>
									<p>
										<span className="font-semibold">Estado:</span>{" "}
										{stockInfo.message}
									</p>
									{selectedVariant && (
										<>
											<p>
												<span className="font-semibold">Talla:</span>{" "}
												{selectedVariant.talla}
											</p>
											{selectedVariant.color && (
												<p>
													<span className="font-semibold">Color:</span>{" "}
													{selectedVariant.color}
												</p>
											)}
										</>
									)}
								</div>
							</div>

							<div>
								<h2 className="text-2xl font-bold text-gray-900 mb-4">
									¿Preguntas?
								</h2>
								<p className="text-gray-600 mb-4">
									Escríbenos por WhatsApp para dudas o pedidos de este producto.
								</p>
								{whatsappNumber && (
									<Button
										onClick={() => {
											const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
												`Hola! Tengo una pregunta sobre el producto: ${product.nombre}`
											)}`;
											window.open(url, '_blank');
										}}
										className="w-full hover-lift"
									>
										Escribir por WhatsApp
									</Button>
								)}
							</div>
						</div>
					</section>
				)}
			</div>
		</main>
	);
}
