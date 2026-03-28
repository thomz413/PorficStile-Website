"use client";

import { motion } from "framer-motion";
import {
	ArrowLeft,
	Heart,
	Minus,
	Plus,
	ShoppingCart,
	Trash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import ProductGallery from "@/components/ProductGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VariantSelector from "@/components/VariantSelector";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { animations } from "@/lib/animations";
import { Producto, Variante } from "@/lib/strapi/types/product";

const fadeInUp = animations.fadeInUp;
const fadeInRight = animations.fadeInRight;

type SelectedItem = {
	key: string;
	variant?: Variante | null;
	quantity: number;
};

type Settings = {
	numeroWhatsapp?: string | null;
} | null;

type Props = {
	product: Producto;
	footerSettings?: Settings;
};

function getFirstAvailableVariant(product: Producto): Variante | null {
	if (!product.variantes || product.variantes.length === 0) return null;

	return (
		product.variantes.find((v) => {
			if (typeof v.stock === "number") return v.stock > 0;
			return v.disponible ?? false;
		}) ??
		product.variantes[0] ??
		null
	);
}

// NEW: Helper to generate a unique key for variants since they no longer have an ID
function getVariantKey(variant?: Variante | null): string {
	if (!variant) return "default";
	return `v-${variant.talla || "notalla"}-${variant.color || "nocolor"}`.toLowerCase();
}

export default function ProductDetailClient({
	product,
	footerSettings,
}: Props) {
	const [selectedVariant, setSelectedVariant] = useState<Variante | null>(() =>
		getFirstAvailableVariant(product),
	);
	const [workingQuantity, setWorkingQuantity] = useState(1);
	const [isFavorite, setIsFavorite] = useState(false);
	const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
	const [mounted, setMounted] = useState(false);

	const { convertAndFormatPrice } = useCurrency();
	const { addToCart: addToCartContext } = useCart();

	const whatsappNumber = footerSettings?.numeroWhatsapp ?? undefined;

	// Fallback ID for React keys and LocalStorage
	const productId = product.documentId || product.slug || "unknown-id";

	useEffect(() => {
		const id = window.setTimeout(() => setMounted(true), 10);
		return () => window.clearTimeout(id);
	}, []);

	// Favorites Logic using documentId
	useEffect(() => {
		try {
			const stored = localStorage.getItem("moda-peru-favorites");
			if (stored) {
				const favs = JSON.parse(stored) as string[];
				const isFav = favs.includes(productId);
				if (isFav) setIsFavorite(true);
			}
		} catch (e) {
			console.error("Error accessing favorites", e);
		}
	}, [productId]);

	const toggleFavorite = () => {
		try {
			const stored = localStorage.getItem("moda-peru-favorites");
			let favs: string[] = stored ? JSON.parse(stored) : [];

			if (favs.includes(productId)) {
				favs = favs.filter((id) => id !== productId);
				toast.info("Eliminado de favoritos");
			} else {
				favs.push(productId);
				toast.success("¡Agregado a favoritos!");
			}

			localStorage.setItem("moda-peru-favorites", JSON.stringify(favs));
			setIsFavorite(favs.includes(productId));
		} catch (e) {
			toast.error("No se pudo actualizar favoritos");
		}
	};

	const productHasVariants = () =>
		Array.isArray(product.variantes) && product.variantes.length > 0;

	const computeFinalPriceForVariant = (variant?: Variante | null) => {
		let finalPrice = product.precio;

		if (variant?.precioSobreescribir) {
			finalPrice = variant.precioSobreescribir;
		}

		if (variant?.precioOferta) {
			finalPrice = variant.precioOferta;
		} else if (product.precioOferta) {
			finalPrice = product.precioOferta;
		}

		return finalPrice;
	};

	const getEffectiveStockLevel = (variant?: Variante | null) => {
		if (variant) {
			if (typeof variant.stock === "number") return variant.stock;
			return undefined;
		}

		if (!productHasVariants()) {
			if (typeof product.cantidadStock === "number") {
				return product.cantidadStock;
			}
			return undefined;
		}

		return undefined;
	};

	const getLevelStockInfo = (variant?: Variante | null) => {
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

			const disponible = variant.disponible ?? false;
			return {
				available: disponible,
				stock: undefined,
				message: disponible ? "Disponible" : "Agotado",
			};
		}

		if (productHasVariants()) {
			return {
				available: false,
				stock: undefined,
				message: "Selecciona una variante",
			};
		}

		const stock =
			typeof product.cantidadStock === "number" ? product.cantidadStock : null;

		if (stock !== null) {
			const available = stock > 0;
			return {
				available,
				stock,
				message: available ? `${stock} disponibles` : "Agotado",
			};
		}

		const disponible = product.disponible ?? false;
		return {
			available: disponible,
			stock: undefined,
			message: disponible ? "Disponible" : "Agotado",
		};
	};

	const canAddQuantity = (
		variant: Variante | null | undefined,
		desiredQty: number,
	) => {
		const info = getLevelStockInfo(variant ?? null);

		if (!info.available) {
			return { ok: false, reason: info.message || "No disponible" };
		}

		if (typeof info.stock === "number") {
			if (info.stock <= 0) return { ok: false, reason: "Agotado" };
			if (desiredQty > info.stock) {
				return { ok: false, reason: `Sólo ${info.stock} disponibles` };
			}
		}

		return { ok: true as const };
	};

	const addSelection = () => {
		const key = getVariantKey(selectedVariant);

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
			const existingIndex = prev.findIndex((p) => p.key === key);

			if (existingIndex >= 0) {
				const copy = [...prev];
				const existing = copy[existingIndex];
				const stockLevel = getEffectiveStockLevel(existing.variant ?? null);

				let nextQty = existing.quantity + workingQuantity;
				if (typeof stockLevel === "number") {
					nextQty = Math.min(stockLevel, nextQty);
				}

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

	const itemsToAdd =
		selectedItems.length > 0
			? selectedItems
			: [
					{
						key: getVariantKey(selectedVariant),
						variant: selectedVariant ?? null,
						quantity: workingQuantity,
					},
				];

	const handleAddToCart = () => {
		for (const it of itemsToAdd) {
			const check = canAddQuantity(it.variant ?? null, it.quantity);
			if (!check.ok) {
				toast.error(`No se puede agregar: ${check.reason}`);
				return;
			}

			const info = getLevelStockInfo(it.variant ?? null);
			if (!info.available) {
				toast.error("Uno de los artículos no está disponible");
				return;
			}
		}

		const productData = {
			id: productId, // Using documentId or slug fallback
			nombre: product.nombre,
			precio: computeFinalPriceForVariant(selectedVariant ?? null),
			precioDescuento: undefined, // Update this if you use it in the future
			categoria: product.categoria
				? { nombre: product.categoria.nombre ?? "Sin categoría" }
				: undefined,
			imagen: product.imagenPrincipal
				? { url: product.imagenPrincipal.url }
				: undefined,
			// Map over itemsToAdd so the cart knows the stock/color of ALL items added
			tallas: itemsToAdd.map((it) => ({
				talla: it.variant?.talla ?? "",
				color: it.variant?.color,
				stock: typeof it.variant?.stock === "number" ? it.variant.stock : 0,
				disponible: it.variant?.disponible ?? false,
			})),
		};

		const cartSelectedItems = itemsToAdd.map((it) => {
			const precioUnitario = computeFinalPriceForVariant(it.variant ?? null);
			return {
				variantKey: it.key, // NEW: The unique key (e.g., 'v-m-rojo')
				talla: it.variant?.talla ?? "",
				color: it.variant?.color, // NEW: Pass the color for rendering
				cantidad: it.quantity,
				precioUnitario,
			};
		});

		addToCartContext(productData, cartSelectedItems);
		toast.success("Artículos agregados al carrito");
		setSelectedItems([]);
	};

	const handleWhatsAppCheckout = () => {
		const lines = itemsToAdd.map((it) => {
			const name =
				product.nombre + (it.variant?.talla ? ` - ${it.variant.talla}` : "");
			return `${name}${it.quantity > 1 ? ` (x${it.quantity})` : ""}`;
		});

		const message = `Hola! Estoy interesado en:\n${lines.join("\n")}`;
		const whatsappUrl = `https://wa.me/${whatsappNumber?.replace(/\D/g, "") || "51999999999"}?text=${encodeURIComponent(message)}`;
		window.open(whatsappUrl, "_blank");
	};

	const stockInfoForWorking = getLevelStockInfo(selectedVariant ?? null);

	const anim = (delayMs = 0) => ({
		className: `${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"} transition-transform transition-opacity duration-400 ease-out will-change-transform`,
		style: { transitionDelay: `${delayMs}ms` },
	});

	const basePrice = selectedVariant?.precioSobreescribir ?? product.precio;
	const finalPrice = computeFinalPriceForVariant(selectedVariant ?? null);
	const hasDiscount = finalPrice < basePrice;
	const discountPercentage = hasDiscount
		? Math.round(((basePrice - finalPrice) / basePrice) * 100)
		: 0;

	return (
		<main className="min-h-screen bg-background pt-21">
			<Header />

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

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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

					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-50px" }}
						variants={fadeInRight}
						className="space-y-6"
					>
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

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.5 }}
							className="text-3xl font-bold text-gray-900"
						>
							{product.nombre}
						</motion.h1>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5, duration: 0.5 }}
							className="space-y-1"
						>
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-3">
									<span className="text-4xl font-extrabold text-primary tracking-tight">
										{convertAndFormatPrice(finalPrice)}
									</span>

									{hasDiscount && (
										<span className="text-xl text-gray-400 line-through decoration-gray-400/70 font-medium">
											{convertAndFormatPrice(basePrice)}
										</span>
									)}

									{hasDiscount && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider"
										>
											{discountPercentage}% DTO
										</motion.div>
									)}
								</div>

								{hasDiscount && (
									<p className="text-sm text-green-600 font-medium">
										¡Ahorras {convertAndFormatPrice(basePrice - finalPrice)}!
									</p>
								)}
							</div>
						</motion.div>

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
											const stockLevel = getEffectiveStockLevel(
												selectedVariant ?? null,
											);
											if (typeof stockLevel === "number") {
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
									<Button
										className="text-white"
										size="sm"
										onClick={addSelection}
									>
										Añadir a la selección
									</Button>
								</motion.div>
							</div>

							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.6, duration: 0.3 }}
								className="text-sm text-gray-600 mt-2"
							>
								{stockInfoForWorking.message}
							</motion.p>
						</motion.div>

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
												{product.imagenPrincipal?.url && (
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
														{product.nombre}
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
											const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
												`Hola! Tengo una pregunta sobre el producto: ${product.nombre}`,
											)}`;
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
