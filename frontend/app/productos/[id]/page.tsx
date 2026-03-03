"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import HeaderWrapper from "@/components/HeaderWrapper";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { Heart, ArrowLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import {
	getProductById,
	getSettings,
	getStrapiImageUrl,
	type StrapiProduct,
} from "@/lib/strapi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import {
	createProductOrderMessage,
	createGeneralQuestionMessage,
	createMultiSizeOrderMessage,
	WhatsAppMessageConfig,
} from "@/lib/whatsapp";
import { useToast } from "@/components/ImprovedToast";

export default function ProductDetailPage() {
	const params = useParams();
	const productId = params.id as string;

	const [product, setProduct] = useState<StrapiProduct | null>(null);
	const [loading, setLoading] = useState(true);
	const [isFavorite, setIsFavorite] = useState(false);
	const [whatsappNumber, setWhatsappNumber] = useState<string | undefined>();
	const { convertAndFormatPrice, currencyInfo, isLoading } = useCurrency();
	const { addToCart } = useCart();
	const { addToast } = useToast();

	// Size & quantity states
	const [selectedTalla, setSelectedTalla] = useState<string | undefined>();
	const [cantidad, setCantidad] = useState<number>(1);

	// Multi-size selection state
	const [multiSizeSelection, setMultiSizeSelection] = useState<{
		[size: string]: number;
	}>({});
	const [isMultiSizeMode, setIsMultiSizeMode] = useState(false);

	useEffect(() => {
		async function load() {
			const [productData, settings] = await Promise.all([
				getProductById(productId),
				getSettings(),
			]);

			// set product + settings
			setProduct(productData);
			setWhatsappNumber(settings?.numeroWhatsapp);

			// initialize favorite from localStorage (moved aquí para evitar setState sincrónico en un effect)
			try {
				const favsRaw = localStorage.getItem("moda-peru-favs") || "{}";
				const favs = JSON.parse(favsRaw) as Record<string, boolean>;
				setIsFavorite(Boolean(favs[productId]));
			} catch (e) {
				// ignore
			}

			// when product loads, pick default talla (first available)
			const tallas = productData?.tallaProducto || [];
			if (tallas.length > 0) {
				const firstAvailable = tallas.find((t) => t.disponible) || tallas[0];
				setSelectedTalla(firstAvailable?.talla);
				setCantidad(1);
			} else {
				// no tallas: use global stock
				setSelectedTalla(undefined);
				setCantidad(1);
			}

			setLoading(false);
		}

		load();
	}, [productId]);

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

	if (loading) {
		return (
			<main className="min-h-screen bg-background">
				<HeaderWrapper />
				<div className="flex items-center justify-center h-96">
					<p className="text-muted-foreground">Cargando producto...</p>
				</div>
			</main>
		);
	}

	if (!product) {
		return (
			<main className="min-h-screen bg-background">
				<HeaderWrapper />
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center">
						<h1 className="text-3xl font-semibold text-foreground mb-4">
							Producto no encontrado
						</h1>
						<p className="text-muted-foreground mb-8">
							No encontramos este producto. Vuelve al catálogo.
						</p>
						<Link
							href="/products"
							className="inline-flex items-center gap-2 text-primary font-black hover:text-primary/80 transition-smooth"
						>
							<ArrowLeft className="h-5 w-5" />
							Volver a Productos
						</Link>
					</div>
				</div>
			</main>
		);
	}

	const productImageUrl = getStrapiImageUrl(product.imagen?.url);

	// Helpers to compute stock depending on talla
	const tallas = product.tallaProducto || [];
	const selectedTallaObj = tallas.find((t) => t.talla === selectedTalla);
	const availableStock = selectedTallaObj
		? selectedTallaObj.stock
		: product.cantidadStock || 0;
	const isTallaAvailable =
		tallas.length === 0
			? product.disponible
			: Boolean(selectedTallaObj?.disponible);

	// Price display
	const priceDisplay = (value?: number) => {
		if (value != null) {
			return convertAndFormatPrice(value);
		}
		return "-";
	};

	// Helper functions for multi-size selection
	const updateSizeQuantity = (size: string, quantity: number) => {
		if (quantity <= 0) {
			const newSelection = { ...multiSizeSelection };
			delete newSelection[size];
			setMultiSizeSelection(newSelection);
		} else {
			const sizeObj = tallas.find((t) => t.talla === size);
			const maxStock = sizeObj?.stock || availableStock;
			const validQuantity = Math.min(quantity, maxStock);
			setMultiSizeSelection((prev) => ({ ...prev, [size]: validQuantity }));
		}
	};

	const getTotalQuantity = () => {
		return Object.values(multiSizeSelection).reduce((sum, qty) => sum + qty, 0);
	};

	const getSelectedSizesText = () => {
		const entries = Object.entries(multiSizeSelection);
		if (entries.length === 0) return "";

		return entries.map(([size, qty]) => `${qty}x talla ${size}`).join(", ");
	};

	// Cart functionality
	const handleAddToCart = () => {
		if (!product) return;

		let selectedItems: Array<{
			talla: string;
			cantidad: number;
			precioUnitario: number;
		}> = [];

		if (isMultiSizeMode) {
			// Multi-size mode
			selectedItems = Object.entries(multiSizeSelection)
				.filter(([_, qty]) => qty > 0)
				.map(([size, qty]) => ({
					talla: size,
					cantidad: qty,
					precioUnitario:
						product.enOferta && product.precioDescuento
							? product.precioDescuento
							: product.precio,
				}));
		} else {
			// Single size mode
			if (selectedTalla) {
				selectedItems = [
					{
						talla: selectedTalla,
						cantidad: cantidad,
						precioUnitario:
							product.enOferta && product.precioDescuento
								? product.precioDescuento
								: product.precio,
					},
				];
			}
		}

		if (selectedItems.length === 0) {
			addToast({
				type: "error",
				title: "Selecciona una talla",
				message:
					"Por favor selecciona una talla y cantidad antes de agregar al carrito",
				duration: 3000,
			});
			return;
		}

		addToCart(
			{
				id: product.id.toString(),
				nombre: product.nombre,
				precio: product.precio,
				precioDescuento: product.precioDescuento,
				enOferta: product.enOferta,
				categoria: product.categoria,
				imagen: product.imagen,
				tallas: product.tallaProducto,
			},
			selectedItems,
		);

		addToast({
			type: "success",
			title: "¡Agregado al carrito!",
			message: `${product.nombre} se ha agregado a tu carrito 🛒`,
			duration: 3000,
		});

		// Reset selections after adding to cart
		if (isMultiSizeMode) {
			setMultiSizeSelection({});
		} else {
			setCantidad(1);
		}
	};

	// WhatsApp message configuration
	const createWhatsAppConfig = (
		action: "order" | "question" | "custom",
	): WhatsAppMessageConfig => {
		const baseConfig = {
			productName: product.nombre,
			productPrice:
				product.enOferta && product.precioDescuento
					? product.precioDescuento
					: product.precio,
			currency: currencyInfo.code,
			category: product.categoria?.nombre,
		};

		if (isMultiSizeMode && getTotalQuantity() > 0) {
			// Multi-size order
			const sizeDetails = Object.entries(multiSizeSelection)
				.filter(([_, qty]) => qty > 0)
				.map(([size, qty]) => `${qty}x talla ${size}`)
				.join("\n");

			const messageType =
				action === "question"
					? "general_question"
					: action === "custom"
						? "custom_order"
						: "product_order";

			return {
				...baseConfig,
				type: messageType,
				quantity: getTotalQuantity(),
				size: sizeDetails,
				customNote:
					action !== "question"
						? `Pedido múltiple:\n${sizeDetails}`
						: undefined,
			};
		} else {
			// Single size order
			const messageType =
				action === "question"
					? "general_question"
					: action === "custom"
						? "custom_order"
						: "product_order";

			return {
				...baseConfig,
				type: messageType,
				quantity: cantidad,
				size: selectedTalla,
			};
		}
	};

	return (
		<main className="min-h-screen bg-background">
			<HeaderWrapper />

			{/* Breadcrumb */}
			<div className="border-b border-border py-4">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<Link
						href="/products"
						className="inline-flex items-center gap-2 text-primary font-black hover:text-primary/80 transition-smooth"
					>
						<ArrowLeft className="h-4 w-4" />
						Volver a Productos
					</Link>
				</div>
			</div>

			{/* Product Detail */}
			<section className="py-8 md:py-12 lg:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
						{/* Image Section */}
						<div className="space-y-4">
							<div className="relative aspect-square w-full overflow-hidden rounded-none border-2 border-border bg-muted">
								{productImageUrl ? (
									<Image
										src={productImageUrl}
										alt={product.nombre}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 100vw, 50vw"
									/>
								) : (
									<div className="flex items-center justify-center h-full text-muted-foreground">
										No hay imagen
									</div>
								)}
							</div>
						</div>

						{/* Product Info Section */}
						<div className="space-y-6 lg:space-y-8">
							{/* Category Badge */}
							<div>
								<span className="inline-block text-xs font-black text-secondary bg-secondary/10 px-3 py-2 rounded-none border border-secondary uppercase tracking-wider">
									{product.categoria?.nombre || "Ropa"}
								</span>
							</div>

							{/* Title */}
							<div className="space-y-2">
								<h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight">
									{product.nombre}
								</h1>
							</div>

							{/* Price */}
							<div className="space-y-1 pb-4 border-b-2 border-border">
								<div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
									<p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">
										Precio
									</p>
									{product.enOferta && product.porcentajeDescuento && (
										<span className="text-xs font-medium text-white bg-primary px-3 py-1 rounded-none">
											{product.porcentajeDescuento}% descuento
										</span>
									)}
									{currencyInfo.code !== "PEN" && !isLoading && (
										<span className="text-xs font-medium text-muted-foreground">
											({currencyInfo.code})
										</span>
									)}
								</div>
								<div className="flex items-baseline gap-3">
									{product.enOferta && product.porcentajeDescuento ? (
										<>
											<span className="text-xl md:text-2xl text-muted-foreground line-through font-semibold">
												{priceDisplay(product.precio)}
											</span>
											<p className="text-3xl md:text-4xl font-black text-primary">
												{priceDisplay(product.precioDescuento)}
											</p>
										</>
									) : (
										<p className="text-3xl md:text-4xl font-black text-primary">
											{priceDisplay(product.precio)}
										</p>
									)}
								</div>
							</div>

							{/* Stock / Tallas */}
							<div className="flex flex-col gap-4">
								{/* Multi-size mode toggle */}
								{tallas.length > 1 && (
									<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
										<input
											type="checkbox"
											id="multiSizeMode"
											checked={isMultiSizeMode}
											onChange={(e) => {
												setIsMultiSizeMode(e.target.checked);
												if (!e.target.checked) {
													setMultiSizeSelection({});
												}
											}}
											className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
										/>
										<label
											htmlFor="multiSizeMode"
											className="text-sm font-medium text-foreground cursor-pointer"
										>
											Pedir múltiples tallas
										</label>
									</div>
								)}

								{!isMultiSizeMode ? (
									/* Single size selection */
									<div className="space-y-2">
										<div className="flex flex-wrap gap-2">
											{tallas.map((t) => {
												const lowStock = t.stock > 0 && t.stock <= 3;
												return (
													<button
														key={t.talla}
														onClick={() => {
															if (!t.disponible) return;
															setSelectedTalla(t.talla);
															setCantidad(1);
														}}
														className={`px-4 py-2 border rounded-none font-black uppercase tracking-wide text-sm transition-smooth ${
															selectedTalla === t.talla
																? "border-primary bg-primary/5 text-primary"
																: t.disponible
																	? "border-border bg-muted text-foreground"
																	: "border-border bg-destructive/10 text-destructive cursor-not-allowed"
														}`}
														aria-pressed={selectedTalla === t.talla}
														aria-disabled={!t.disponible}
													>
														{t.talla} {t.disponible && `(${t.stock})`}{" "}
														{(!t.disponible || t.stock === 0) && " - Agotado"}{" "}
														{lowStock && " - Últimas"}
													</button>
												);
											})}
										</div>
										{selectedTalla && (
											<p className="text-sm text-muted-foreground">
												Stock talla seleccionada: {availableStock}
											</p>
										)}
									</div>
								) : (
									/* Multi-size selection */
									<div className="space-y-3">
										<div className="text-sm text-muted-foreground">
											Selecciona las cantidades para cada talla que necesitas:
										</div>
										{tallas.map((t) => {
											const quantity = multiSizeSelection[t.talla] || 0;
											const lowStock = t.stock > 0 && t.stock <= 3;
											return (
												<div
													key={t.talla}
													className="flex items-center gap-3 p-3 border rounded-lg"
												>
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<span className="font-black uppercase">
																{t.talla}
															</span>
															{t.disponible ? (
																<span className="text-sm text-muted-foreground">
																	({t.stock} disponibles)
																	{lowStock && " - Últimas unidades"}
																</span>
															) : (
																<span className="text-sm text-destructive">
																	Agotado
																</span>
															)}
														</div>
													</div>
													{t.disponible && (
														<div className="flex items-center gap-2">
															<button
																onClick={() =>
																	updateSizeQuantity(t.talla, quantity - 1)
																}
																className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
																disabled={quantity === 0}
																aria-label="Disminuir cantidad"
															>
																<Minus className="h-3 w-3" />
															</button>
															<input
																type="number"
																min={0}
																max={t.stock}
																value={quantity}
																onChange={(e) => {
																	const val = parseInt(e.target.value) || 0;
																	updateSizeQuantity(t.talla, val);
																}}
																className="w-12 text-center border border-border rounded px-1 py-1 font-medium"
															/>
															<button
																onClick={() =>
																	updateSizeQuantity(t.talla, quantity + 1)
																}
																className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
																disabled={quantity >= t.stock}
																aria-label="Aumentar cantidad"
															>
																<Plus className="h-3 w-3" />
															</button>
														</div>
													)}
												</div>
											);
										})}
										{getTotalQuantity() > 0 && (
											<div className="p-3 bg-primary/10 border border-primary rounded-lg">
												<p className="text-sm font-medium text-primary">
													Total de unidades: {getTotalQuantity()}
												</p>
												<p className="text-xs text-primary/80 mt-1">
													{getSelectedSizesText()}
												</p>
											</div>
										)}
									</div>
								)}
							</div>

							{/* Quantity + Favorite - Only show in single size mode */}
							{!isMultiSizeMode && (
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div className="flex items-center gap-3">
										<label className="text-xs text-muted-foreground uppercase font-medium tracking-wide">
											Cantidad
										</label>
										<div className="flex items-center border rounded-none px-2">
											<button
												onClick={() => setCantidad((c) => Math.max(1, c - 1))}
												className="px-2 py-1"
												aria-label="Disminuir cantidad"
											>
												-
											</button>
											<input
												type="number"
												min={1}
												max={availableStock}
												value={cantidad}
												onChange={(e) => {
													let v = Number(e.target.value || 1);
													if (!Number.isFinite(v)) v = 1;
													v = Math.max(1, Math.min(v, availableStock || 1));
													setCantidad(v);
												}}
												className="w-16 text-center bg-transparent outline-none"
											/>
											<button
												onClick={() =>
													setCantidad((c) =>
														Math.min(availableStock || 1, c + 1),
													)
												}
												className="px-2 py-1"
												aria-label="Aumentar cantidad"
											>
												+
											</button>
										</div>
									</div>

									<button
										onClick={toggleFavorite}
										className="p-3 rounded-lg border-2 border-border hover:border-primary transition-smooth"
										aria-pressed={isFavorite}
									>
										<Heart
											className={`h-6 w-6 ${isFavorite ? "fill-primary text-primary" : "text-foreground"}`}
										/>
									</button>
								</div>
							)}

							{/* Favorite button in multi-size mode */}
							{isMultiSizeMode && (
								<div className="flex justify-end">
									<button
										onClick={toggleFavorite}
										className="p-3 rounded-lg border-2 border-border hover:border-primary transition-smooth"
										aria-pressed={isFavorite}
									>
										<Heart
											className={`h-6 w-6 ${isFavorite ? "fill-primary text-primary" : "text-foreground"}`}
										/>
									</button>
								</div>
							)}

							{/* Description */}
							{product.descripcion && (
								<div className="space-y-2">
									<p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">
										Descripción
									</p>
									<p className="text-lg text-foreground leading-relaxed">
										{product.descripcion}
									</p>
								</div>
							)}

							{/* CTA Buttons */}
							<div className="space-y-3 pt-6">
								{/* Add to Cart Button */}
								<button
									onClick={handleAddToCart}
									className="w-full py-3 px-6 bg-secondary text-secondary-foreground font-black uppercase tracking-wide border-2 border-secondary hover:bg-secondary/90 transition-smooth flex items-center justify-center gap-2"
								>
									<ShoppingCart className="h-5 w-5" />
									Agregar al Carrito
								</button>

								{isMultiSizeMode ? (
									/* Multi-size mode validation */
									getTotalQuantity() === 0 ? (
										<div className="text-sm text-muted-foreground">
											Selecciona las cantidades de las tallas que necesitas para
											poder pedir.
										</div>
									) : (
										<WhatsAppCTA
											whatsappNumber={whatsappNumber}
											messageConfig={createWhatsAppConfig("order")}
											label={`Pedir ${getTotalQuantity()} unidades por WhatsApp`}
											className="w-full justify-center bg-primary border-primary hover:bg-primary/90"
										/>
									)
								) : /* Single size mode validation */
								!isTallaAvailable && tallas.length > 0 ? (
									<div className="text-sm text-destructive">
										La talla seleccionada está agotada. Selecciona otra talla
										para poder pedir.
									</div>
								) : product.disponible || tallas.length > 0 ? (
									<WhatsAppCTA
										whatsappNumber={whatsappNumber}
										messageConfig={createWhatsAppConfig("order")}
										label={
											product.disponible || tallas.length > 0
												? "Pedir por WhatsApp"
												: "Avisar cuando haya stock"
										}
										className="w-full justify-center bg-primary border-primary hover:bg-primary/90"
									/>
								) : (
									<WhatsAppCTA
										whatsappNumber={whatsappNumber}
										messageConfig={createWhatsAppConfig("custom")}
										label="Avisar cuando haya stock"
										className="w-full justify-center bg-secondary border-secondary hover:bg-secondary/90"
									/>
								)}
							</div>
						</div>

						{/* Additional Info */}
						{product.descripcion && (
							<section className="mt-12 lg:mt-20 border-t-2 border-border pt-8 lg:pt-12">
								<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
										<div className="space-y-4">
											<h2 className="text-xl lg:text-2xl font-semibold text-foreground">
												Detalles del producto
											</h2>
											<div className="space-y-3 text-foreground leading-relaxed">
												<p>
													<span className="font-black">Categoría:</span>{" "}
													{product.categoria?.nombre}
												</p>
												<p>
													<span className="font-black">Stock:</span>{" "}
													{tallas.length === 0
														? product.disponible
															? `${product.cantidadStock} disponibles`
															: "Agotado"
														: "Ver tallas"}
												</p>
											</div>
										</div>

										<div className="space-y-4">
											<h2 className="text-xl lg:text-2xl font-semibold text-foreground">
												¿Preguntas?
											</h2>
											<p className="text-foreground leading-relaxed mb-4">
												Escríbenos por WhatsApp para dudas o pedidos de este
												producto.
											</p>
											<WhatsAppCTA
												whatsappNumber={whatsappNumber}
												messageConfig={createWhatsAppConfig("question")}
												label="Escribir por WhatsApp"
												className="w-full justify-center"
											/>
										</div>
									</div>
								</div>
							</section>
						)}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border bg-background py-12 mt-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
					<p> 2024 Moda Peru. Tienda online con envíos a todo el Perú.</p>
					<p>© 2024 Moda Peru. Tienda online con envíos a todo el Perú.</p>
				</div>
			</footer>
		</main>
	);
}
