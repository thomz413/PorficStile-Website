"use client";

import {useState, useEffect, Suspense} from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import ProductGallery from "@/components/ProductGallery";
import VariantSelector from "@/components/VariantSelector";
import {
	ArrowLeft,
	Heart,
	Minus,
	Plus,
	ShoppingCart,
	Trash,
} from "lucide-react";
import { useParams } from "next/navigation";
import { getProductById, getSettings } from "@/lib/strapi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Producto, Variante } from "@/lib/strapi/types/product";
import { motion } from "framer-motion";
import { animations } from "@/lib/animations";

// Animation Variants
const fadeInUp = animations.fadeInUp;
const fadeInRight = animations.fadeInRight;

type SelectedItem = {
	key: string; // variant id or "default"
	variant?: Variante | null;
	quantity: number;
};

function ProductDetailContent() {
	const params = useParams();
	const productId = params.id as string;

	const [product, setProduct] = useState<Producto | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<Variante | null>(null);
	// quantity input is the "working" quantity for the currently selectedVariant/default
	const [workingQuantity, setWorkingQuantity] = useState(1);
	const [loading, setLoading] = useState(true);
	const [isFavorite, setIsFavorite] = useState(false);
	const [whatsappNumber, setWhatsappNumber] = useState<string | undefined>();
	const { convertAndFormatPrice } = useCurrency();
	const { addToCart: addToCartContext } = useCart();

	// selection list: user can add multiple variants/default items before sending to cart
	const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

	// mounted flag used for controlled CSS transitions to prevent flicker
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		// set mounted on next tick so first paint is the "initial" state
		const id = window.setTimeout(() => setMounted(true), 10);
		return () => window.clearTimeout(id);
	}, []);

	useEffect(() => {
		async function loadProduct() {
			try {
				const [productData, settings] = await Promise.all([
					getProductById(productId),
					getSettings(),
				]);
				console.log(productData);
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
				if (productData?.variantes && productData.variantes.length > 0) {
					const firstAvailable =
						productData.variantes.find((v) => {
							// variant-level precedence: number stock > disponible
							if (typeof v.stock === "number") return v.stock > 0;
							return v.disponible ?? false;
						}) || productData.variantes[0];
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

	// Helpers: compute final price for a variant or product (mirrors previous logic)
	const computeFinalPriceForVariant = (variant?: Variante | null) => {
		if (!product) return 0;
		let finalPrice = product.precio;

		if (variant?.precioSobreescribir) {
			finalPrice = variant.precioSobreescribir;
		}

		if (variant?.precioOferta) {
			finalPrice = variant?.precioOferta;
		} else if (product.precioOferta) {
			finalPrice = product.precioOferta;
		}
		return finalPrice;
	};

	// Helper: whether product has variants
	const productHasVariants = () =>
		Array.isArray(product?.variantes) && product!.variantes.length > 0;

	// Helper: returns effective numeric stock (number) or undefined when "unlimited" or not applicable
	const getEffectiveStockLevel = (variant?: Variante | null) => {
		// Variant present -> consider variant.stock only
		if (variant) {
			if (typeof variant.stock === "number") return variant.stock;
			return undefined;
		}
		// No variant passed: only use product-level stock if product has NO variants
		if (!productHasVariants()) {
			if (typeof product?.cantidadStock === "number")
				return product!.cantidadStock;
			return undefined;
		}
		// product has variants and no variant selected -> no effective stock (must pick a variant)
		return undefined;
	};

	// Stock/availability rules implemented exactly as requested:
	// - If variant provided -> variant rules (stock number > 0 takes precedence; else use disponible)
	// - Else if product has NO variants -> product-level rules (cantidadStock number > 0 takes precedence; else use disponible)
	// - Else (product has variants but no variant selected) -> require variant selection
	const getLevelStockInfo = (variant?: Variante | null) => {
		// Variant-level logic (if variant passed)
		if (variant) {
			const stock = typeof variant.stock === "number" ? variant.stock : null;
			if (stock !== null) {
				const available = stock > 0;
				return {
					available,
					stock,
					message: available ? `${stock} disponibles` : "Agotado",
				};
			}
			// no numeric stock -> rely on disponible flag for variant
			const disponible = variant.disponible ?? false;
			return {
				available: disponible,
				stock: undefined,
				message: disponible ? "Disponible" : "Agotado",
			};
		}

		// No variant passed. If product has variants -> force selection (don't fallback to product-level).
		if (productHasVariants()) {
			return {
				available: false,
				stock: undefined,
				message: "Selecciona una variante",
			};
		}

		// Product has no variants: product-level rules
		const stock =
			typeof product?.cantidadStock === "number"
				? product?.cantidadStock
				: null;
		if (stock !== null) {
			const available = stock > 0;
			return {
				available,
				stock,
				message: available ? `${stock} disponibles` : "Agotado",
			};
		}
		const disponible = product?.disponible ?? false;
		return {
			available: disponible,
			stock: undefined,
			message: disponible ? "Disponible" : "Agotado",
		};
	};

	// Validate if a desired quantity can be added for a given variant/default
	const canAddQuantity = (
		variant: Variante | null | undefined,
		desiredQty: number,
	) => {
		const info = getLevelStockInfo(variant ?? null);
		if (!info.available)
			return { ok: false, reason: info.message || "No disponible" };
		if (typeof info.stock === "number") {
			if (info.stock <= 0) return { ok: false, reason: "Agotado" };
			if (desiredQty > info.stock) {
				return { ok: false, reason: `Sólo ${info.stock} disponibles` };
			}
		}
		return { ok: true };
	};

	// Add current working selection (selectedVariant or default product) to the local selection list
	const addSelection = () => {
		if (!product) return;

		const key = selectedVariant?.id ? `v-${selectedVariant.id}` : "default";
		// validate
		if (workingQuantity < 1) {
			toast.error("La cantidad debe ser al menos 1");
			return;
		}
		const check = canAddQuantity(selectedVariant ?? null, workingQuantity);
		if (!check.ok) {
			toast.error(check.reason);
			return;
		}

		setSelectedItems((prev) => {
			// if exists, update quantity (sum)
			const existingIndex = prev.findIndex((p) => p.key === key);
			if (existingIndex >= 0) {
				const copy = [...prev];
				const existing = copy[existingIndex];
				const stockLevel = getEffectiveStockLevel(existing.variant ?? null);
				let nextQty = existing.quantity + workingQuantity;
				if (typeof stockLevel === "number")
					nextQty = Math.min(stockLevel, nextQty);
				copy[existingIndex] = {
					...existing,
					quantity: nextQty,
				};
				return copy;
			}
			return [
				...prev,
				{ key, variant: selectedVariant ?? null, quantity: workingQuantity },
			];
		});

		toast.success("Artículo agregado a la selección");
	};

	const removeSelection = (key: string) => {
		setSelectedItems((prev) => prev.filter((p) => p.key !== key));
	};

	const updateSelectionQuantity = (key: string, nextQty: number) => {
		setSelectedItems((prev) =>
			prev.map((p) => {
				if (p.key !== key) return p;
				// validate against stock if present
				const stockLevel = getEffectiveStockLevel(p.variant ?? null);
				if (typeof stockLevel === "number") {
					nextQty = Math.max(1, Math.min(nextQty, stockLevel));
				} else {
					nextQty = Math.max(1, nextQty);
				}
				return { ...p, quantity: nextQty };
			}),
		);
	};

	// Build productData & selectedItems shape expected by addToCartContext
	// If user hasn't created a selection list, fall back to the single current selection
	const handleAddToCart = () => {
		if (!product) return;

		const itemsToAdd =
			selectedItems.length > 0
				? selectedItems
				: [
						{
							key: selectedVariant?.id ? `v-${selectedVariant.id}` : "default",
							variant: selectedVariant ?? null,
							quantity: workingQuantity,
						},
					];

		// Validate all items
		for (const it of itemsToAdd) {
			const check = canAddQuantity(it.variant ?? null, it.quantity);
			if (!check.ok) {
				toast.error(`No se puede agregar: ${check.reason}`);
				return;
			}
			// Also ensure availability flag
			const info = getLevelStockInfo(it.variant ?? null);
			if (!info.available) {
				toast.error(info.message || "Uno de los artículos no está disponible");
				return;
			}
		}

		// Build productData (product-level metadata)
		const productData = {
			id: product.id.toString(),
			nombre: product.nombre,
			precio: computeFinalPriceForVariant(null),
			precioDescuento: undefined,
			categoria: product.categoria
				? { nombre: product.categoria.nombre ?? "Sin categoría" }
				: undefined,
			imagen: product.imagenPrincipal
				? { url: product.imagenPrincipal.url }
				: undefined,
			// include tallas so CartItem matches expected shape
			tallas: selectedVariant
				? [
						{
							talla: selectedVariant.talla ?? "",
							stock:
								typeof selectedVariant.stock === "number"
									? selectedVariant.stock
									: 0,
							disponible: selectedVariant.disponible,
						},
					]
				: [],
		};

		// Build selectedItems in the format the cart expects (tallas array)
		const cartSelectedItems = itemsToAdd.map((it) => {
			const precioUnitario = computeFinalPriceForVariant(it.variant ?? null);
			return {
				talla: it.variant?.talla ?? "Default",
				cantidad: it.quantity,
				precioUnitario,
			};
		});

		addToCartContext(productData, cartSelectedItems);
		toast.success("Artículos agregados al carrito");
		// Optionally clear selection after add
		setSelectedItems([]);
	};

	const handleWhatsAppCheckout = () => {
		if (!product) return;
		const itemsToSend =
			selectedItems.length > 0
				? selectedItems
				: [
						{
							key: selectedVariant?.id ? `v-${selectedVariant.id}` : "default",
							variant: selectedVariant ?? null,
							quantity: workingQuantity,
						},
					];

		const lines = itemsToSend.map((it) => {
			const name =
				product.nombre + (it.variant?.talla ? ` - ${it.variant.talla}` : "");
			return `${name}${it.quantity > 1 ? ` (x${it.quantity})` : ""}`;
		});

		const message = `Hola! Estoy interesado en:\n${lines.join("\n")}`;
		const whatsappUrl = `https://wa.me/${whatsappNumber?.replace(/\D/g, "") || "51999999999"}?text=${encodeURIComponent(message)}`;
		window.open(whatsappUrl, "_blank");
	};

	// UI helpers
	const stockInfoForWorking = getLevelStockInfo(selectedVariant ?? null);

	// small helper to build a stable anim class + style with delay
	const anim = (delayMs = 0) => ({
		className: `${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      transition-transform transition-opacity duration-400 ease-out will-change-transform`,
		style: { transitionDelay: `${delayMs}ms` },
	});

	if (loading) {
		return (
			<main className="min-h-screen bg-gray-50 pt-21">
				<Header />
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

	if (!product) {
		return (
			<main className="min-h-screen bg-gray-50 pt-21">
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
		<main className="min-h-screen bg-background pt-21">
			<Header />

			{/* Breadcrumb */}
			<motion.div
				initial="hidden"
				animate="visible"
				variants={fadeInUp}
				className="bg-white border-b"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<motion.div variants={fadeInUp}>
						<Link
							href="/productos"
							className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
						>
							<motion.div whileHover={{ x: -3 }} transition={{ duration: 0.2 }}>
								<ArrowLeft className="h-4 w-4" />
							</motion.div>
							Volver a Productos
						</Link>
					</motion.div>
				</div>
			</motion.div>

			{/* Product Detail */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Product Gallery */}
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-50px" }}
						variants={fadeInUp}
						className="animate-section"
					>
						<ProductGallery
							product={product}
							selectedVariant={selectedVariant}
						/>
					</motion.div>

					{/* Product Info */}
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-50px" }}
						variants={fadeInRight}
						className="space-y-6"
					>
						{/* Category Badge */}
						{product.categoria && (
							<motion.div
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.3, duration: 0.3 }}
							>
								<Badge variant="secondary" className="inline-block">
									{product.categoria.nombre}
								</Badge>
							</motion.div>
						)}

						{/* Title */}
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.5 }}
							className="text-3xl font-bold text-gray-900"
						>
							{product.nombre}
						</motion.h1>

						{/* Price (for the working selection) */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5, duration: 0.5 }}
							className="space-y-2"
						>
							<div className="text-3xl font-bold text-gray-900">
								{convertAndFormatPrice(
									computeFinalPriceForVariant(selectedVariant ?? null),
								)}
							</div>
						</motion.div>

						{/* Variant Selector (keeps existing contract) */}
						{product.variantes && product.variantes.length > 0 && (
							<motion.div
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true, margin: "-50px" }}
								variants={fadeInUp}
							>
								<VariantSelector
									product={product}
									selectedVariant={selectedVariant}
									onVariantSelect={setSelectedVariant}
								/>
							</motion.div>
						)}

						{/* Quantity + Add-to-selection */}
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: "-50px" }}
							variants={fadeInUp}
						>
							<label className="text-sm font-medium text-gray-700">
								Cantidad
							</label>
							<div className="flex items-center gap-3">
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setWorkingQuantity(Math.max(1, workingQuantity - 1))
										}
										disabled={workingQuantity <= 1}
										className="transition-all duration-200 hover-scale"
									>
										<Minus className="h-4 w-4" />
									</Button>
								</motion.div>

								<Input
									type="number"
									min={1}
									value={workingQuantity}
									onChange={(e) => {
										let val = parseInt(e.target.value) || 1;
										// enforce stock limits if present (only when effective stock exists)
										const stockLevel = getEffectiveStockLevel(
											selectedVariant ?? null,
										);
										if (typeof stockLevel === "number") {
											val = Math.max(1, Math.min(val, stockLevel));
										} else {
											val = Math.max(1, val);
										}
										setWorkingQuantity(val);
									}}
									className="w-20 text-center"
								/>

								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											// +1 respecting stock (only if effective stock available)
											const stockLevel = getEffectiveStockLevel(
												selectedVariant ?? null,
											);

											if (typeof stockLevel === "number") {
												// if stock exists, clamp
												setWorkingQuantity((q) => Math.min(q + 1, stockLevel));
											} else {
												setWorkingQuantity((q) => q + 1);
											}
										}}
										className="transition-all duration-200 hover-scale"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</motion.div>

								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="ml-4"
								>
									<Button className="text-white"  size="sm" onClick={addSelection}>
										Añadir a la selección
									</Button>
								</motion.div>
							</div>

							{/* Stock helper */}
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.6, duration: 0.3 }}
								className="text-sm text-gray-600 mt-2"
							>
								{stockInfoForWorking.message}
							</motion.p>
						</motion.div>

						{/* Selection list (multiple items) */}
						{selectedItems.length > 0 && (
							<motion.div
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true, margin: "-50px" }}
								variants={fadeInUp}
								className="space-y-2 mt-2"
							>
								<motion.h3
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.1, duration: 0.3 }}
									className="text-lg font-semibold"
								>
									Tu selección
								</motion.h3>

								{selectedItems.map((it) => {
									const stockLevel = getEffectiveStockLevel(it.variant ?? null);
									const itemPrice = computeFinalPriceForVariant(
										it.variant ?? null,
									);
									return (
										<motion.div
											key={it.key}
											className="flex items-center justify-between gap-4 bg-white p-3 rounded shadow-sm"
										>
											<div className="flex items-center gap-3">
												{product?.imagenPrincipal?.url && (
													<Image
														src={product.imagenPrincipal.url}
														alt={product.nombre}
														width={56}
														height={56}
														className="rounded"
													/>
												)}
												<div>
													<div className="font-medium">
														{product?.nombre}
														{it.variant?.talla ? ` — ${it.variant.talla}` : ""}
													</div>
													<div className="text-sm text-gray-600">
														{convertAndFormatPrice(itemPrice)}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														updateSelectionQuantity(
															it.key,
															Math.max(1, it.quantity - 1),
														)
													}
													disabled={it.quantity <= 1}
												>
													<Minus className="h-4 w-4" />
												</Button>

												<Input
													type="number"
													value={it.quantity}
													onChange={(e) => {
														const val = parseInt(e.target.value) || 1;
														updateSelectionQuantity(it.key, val);
													}}
													className="w-16 text-center"
												/>

												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														updateSelectionQuantity(it.key, it.quantity + 1)
													}
													disabled={
														typeof stockLevel === "number" &&
														it.quantity >= stockLevel
													}
												>
													<Plus className="h-4 w-4" />
												</Button>

												<Button
													size="sm"
													variant="ghost"
													onClick={() => removeSelection(it.key)}
													title="Eliminar"
												>
													<Trash className="h-4 w-4" />
												</Button>
											</div>
										</motion.div>
									);
								})}
							</motion.div>
						)}

						{/* Actions */}
						<div {...anim(440)} style={anim(440).style}>
							<div className="space-y-4 pt-6">
								<Button
									onClick={handleAddToCart}
									className="w-full hover-lift text-white"
									size="lg"
								>
									<ShoppingCart className="h-5 w-5 mr-2" />
									{selectedItems.length > 0
										? `Agregar ${selectedItems.length} artículos al carrito`
										: "Agregar al Carrito"}
								</Button>

								{whatsappNumber && (
									<Button
										onClick={handleWhatsAppCheckout}
										className="w-full hover-lift bg-secondary hover:bg-secondary/90 text-white border-[#25D366]"
										size="lg"
									>
										Pedir por WhatsApp
									</Button>
								)}

								<Button
									onClick={toggleFavorite}
									variant="outline"
									className="w-full hover-lift"
									size="lg"
								>
									<Heart
										className={`h-5 w-5 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
									/>
									{isFavorite ? "Favorito" : "Agregar a Favoritos"}
								</Button>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Additional Info */}
				{product.descripcion && (
					<section
						{...anim(520)}
						style={anim(520).style}
						className="mt-16 pt-8 border-t"
					>
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
										{(
											selectedItems.length > 0
												? selectedItems[0]
												: selectedVariant
										)
											? getLevelStockInfo(
													(selectedItems.length > 0
														? selectedItems[0].variant
														: selectedVariant) ?? null,
												).message
											: product.disponible
												? "Disponible"
												: "Agotado"}
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
											const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola! Tengo una pregunta sobre el producto: ${product.nombre}`)}`;
											window.open(url, "_blank");
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
function ProductSkeleton() {
	return (
		<div className="w-full animate-pulse">
			{/* Breadcrumb Skeleton */}
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="h-5 w-40 bg-gray-200 rounded-md" />
				</div>
			</div>

			{/* Product Detail Skeleton */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

					{/* Left: Product Gallery Skeleton */}
					<div className="space-y-4">
						{/* Main large image */}
						<div className="aspect-square w-full bg-gray-200 rounded-2xl" />
						{/* Thumbnail strip */}
						<div className="flex gap-4 overflow-hidden">
							<div className="h-20 w-20 md:h-24 md:w-24 shrink-0 bg-gray-200 rounded-xl" />
							<div className="h-20 w-20 md:h-24 md:w-24 shrink-0 bg-gray-200 rounded-xl" />
							<div className="h-20 w-20 md:h-24 md:w-24 shrink-0 bg-gray-200 rounded-xl" />
							<div className="h-20 w-20 md:h-24 md:w-24 shrink-0 bg-gray-200 rounded-xl hidden sm:block" />
						</div>
					</div>

					{/* Right: Product Info Skeleton */}
					<div className="space-y-6 pt-2 md:pt-6">
						{/* Category Badge */}
						<div className="h-6 w-24 bg-gray-200 rounded-full" />

						{/* Title */}
						<div className="space-y-3">
							<div className="h-9 w-full bg-gray-300 rounded-lg" />
							<div className="h-9 w-3/4 bg-gray-300 rounded-lg" />
						</div>

						{/* Price */}
						<div className="h-10 w-1/3 bg-gray-200 rounded-lg pt-2" />

						{/* Variant Selector (Tallas/Colores) */}
						<div className="pt-4 space-y-4">
							<div className="h-5 w-16 bg-gray-200 rounded" />
							<div className="flex gap-3">
								<div className="h-10 w-14 bg-gray-200 rounded-md" />
								<div className="h-10 w-14 bg-gray-200 rounded-md" />
								<div className="h-10 w-14 bg-gray-200 rounded-md" />
							</div>
						</div>

						{/* Quantity & Add to Selection */}
						<div className="pt-4 space-y-3">
							<div className="h-5 w-20 bg-gray-200 rounded" />
							<div className="flex items-center gap-3">
								<div className="h-9 w-32 bg-gray-200 rounded-md" />
								<div className="h-9 w-40 bg-gray-300 rounded-md" />
							</div>
							<div className="h-4 w-28 bg-gray-200 rounded mt-2" />
						</div>

						{/* Actions (3 big buttons) */}
						<div className="space-y-4 pt-8">
							<div className="h-12 w-full bg-gray-300 rounded-md" /> {/* Add to cart */}
							<div className="h-12 w-full bg-gray-200 rounded-md" /> {/* WhatsApp */}
							<div className="h-12 w-full bg-gray-200 rounded-md" /> {/* Favorite */}
						</div>
					</div>
				</div>

				{/* Bottom: Additional Info Skeleton */}
				<div className="mt-16 pt-8 border-t grid grid-cols-1 lg:grid-cols-2 gap-12">
					<div className="space-y-5">
						<div className="h-8 w-48 bg-gray-300 rounded-lg" />
						<div className="space-y-3 pt-2">
							<div className="h-5 w-full bg-gray-200 rounded" />
							<div className="h-5 w-5/6 bg-gray-200 rounded" />
							<div className="h-5 w-4/6 bg-gray-200 rounded" />
						</div>
					</div>

					<div className="space-y-5">
						<div className="h-8 w-40 bg-gray-300 rounded-lg" />
						<div className="h-5 w-full bg-gray-200 rounded pt-2" />
						<div className="h-12 w-full bg-gray-200 rounded-md mt-4" />
					</div>
				</div>
			</div>
		</div>
	);
}


export default function ProductDetailPage() {
	return (
		<Suspense fallback={<ProductSkeleton />}>
			<ProductDetailContent />
		</Suspense>
	);
}