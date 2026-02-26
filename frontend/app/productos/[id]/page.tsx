"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { Heart, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import {
	getProductById,
	getSettings,
	getStrapiImageUrl,
	type StrapiProduct,
} from "@/lib/strapi";

// ---------------------------
// Componente mejorado para manejar tallas y cantidad
// Idioma: español
// ---------------------------

export default function ProductDetailPage() {
	const params = useParams();
	const productId = params.id as string;

	const [product, setProduct] = useState<StrapiProduct | null>(null);
	const [loading, setLoading] = useState(true);
	const [isFavorite, setIsFavorite] = useState(false);
	const [whatsappNumber, setWhatsappNumber] = useState<string | undefined>();

	// Size & quantity states
	const [selectedTalla, setSelectedTalla] = useState<string | undefined>();
	const [cantidad, setCantidad] = useState<number>(1);

	useEffect(() => {
		async function load() {
			const [productData, settings] = await Promise.all([
				getProductById(productId),
				getSettings(),
			]);
			setProduct(productData);
			setWhatsappNumber(settings?.numeroWhatsapp);
			setLoading(false);
		}

		load();
	}, [productId]);

	// initialize favorite from localStorage
	useEffect(() => {
		if (!product) return;
		try {
			const favsRaw = localStorage.getItem("moda-peru-favs") || "{}";
			const favs = JSON.parse(favsRaw) as Record<string, boolean>;
			setIsFavorite(Boolean(favs[productId]));
		} catch (e) {
			// ignore
		}
	}, [product, productId]);

	// when product loads, pick default talla (first available)
	useEffect(() => {
		if (!product) return;
		const tallas = product.tallaProducto || [];
		if (tallas.length > 0) {
			const firstAvailable = tallas.find((t) => t.disponible) || tallas[0];
			setSelectedTalla(firstAvailable?.talla);
			setCantidad(1);
		} else {
			// no tallas: use global stock
			setSelectedTalla(undefined);
			setCantidad(1);
		}
	}, [product]);

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
				<Header />
				<div className="flex items-center justify-center h-96">
					<p className="text-muted-foreground">Cargando producto...</p>
				</div>
			</main>
		);
	}

	if (!product) {
		return (
			<main className="min-h-screen bg-background">
				<Header />
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
	const availableStock = selectedTallaObj ? selectedTallaObj.stock : product.cantidadStock || 0;
	const isTallaAvailable = tallas.length === 0 ? product.disponible : Boolean(selectedTallaObj?.disponible);

	// Price display
	const priceDisplay = (value?: number) => (value != null ? `S/. ${value.toFixed(2)}` : "-");

	// WhatsApp message builder
	const buildWhatsAppMessage = (baseLabel: string) => {
		const price = product.enOferta && product.precioDescuento ? product.precioDescuento : product.precio;
		const tallaPart = selectedTalla ? `Talla: ${selectedTalla}` : "";
		return `${baseLabel} ${product.nombre} - ${priceDisplay(price)}${tallaPart ? ` - ${tallaPart}` : ""} - Cant: ${cantidad}`;
	};

	return (
		<main className="min-h-screen bg-background">
			<Header />

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
			<section className="py-12 md:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
						<div className="space-y-8">
							{/* Category Badge */}
							<div>
								<span className="inline-block text-xs font-black text-secondary bg-secondary/10 px-4 py-2 rounded-none border border-secondary uppercase tracking-wider">
									{product.categoria?.nombre || "Ropa"}
								</span>
							</div>

							{/* Title */}
							<div className="space-y-2">
								<h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
									{product.nombre}
								</h1>
							</div>

							{/* Price */}
							<div className="space-y-1 pb-6 border-b-2 border-border">
								<div className="flex items-center gap-3">
									<p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Precio</p>
									{product.enOferta && product.porcentajeDescuento && (
										<span className="text-xs font-medium text-white bg-primary px-3 py-1 rounded-none">
											{product.porcentajeDescuento}% descuento
										</span>
									)}
								</div>
								<div className="flex items-baseline gap-3">
									{product.enOferta && product.porcentajeDescuento ? (
										<>
											<span className="text-2xl text-muted-foreground line-through font-semibold">S/. {product.precio.toFixed(2)}</span>
											<p className="text-4xl font-black text-primary">S/. {product.precioDescuento!.toFixed(2)}</p>
										</>
									) : (
										<p className="text-4xl font-black text-primary">S/. {product.precio.toFixed(2)}</p>
									)}
								</div>
							</div>

							{/* Stock / Tallas */}
							<div className="flex flex-col gap-4">
								<div>
									<p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-2">Disponibilidad</p>
									{tallas.length === 0 ? (
										<div className="flex items-center gap-2">
											<span className={`inline-block w-3 h-3 ${product.disponible ? "bg-secondary" : "bg-destructive"} rounded-full`} />
											<span className={`text-lg font-black ${product.disponible ? "text-secondary" : "text-destructive"}`}>
												{product.disponible ? `En stock (${product.cantidadStock} disponibles)` : "Agotado"}
											</span>
										</div>
									) : (
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
																selectedTalla === t.talla ? "border-primary bg-primary/5 text-primary" : t.disponible ? "border-border bg-muted text-foreground" : "border-border bg-destructive/10 text-destructive cursor-not-allowed"
															}`}
															aria-pressed={selectedTalla === t.talla}
															aria-disabled={!t.disponible}
														>
															{t.talla} {t.disponible && `(${t.stock})`} {(!t.disponible || t.stock === 0) && " - Agotado"} {lowStock && " - Últimas"}
														</button>
													);
												})}
											</div>
											{selectedTalla && (
												<p className="text-sm text-muted-foreground">Stock talla seleccionada: {availableStock}</p>
											)}
										</div>
									)}
								</div>

								{/* Quantity + Favorite */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<label className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Cantidad</label>
										<div className="flex items-center border rounded-none px-2">
											<button
												onClick={() => setCantidad((c) => Math.max(1, c - 1))}
												className="px-2 py-1"
												aria-label="Disminuir cantidad"
											>
												-</button>
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
												onClick={() => setCantidad((c) => Math.min((availableStock || 1), c + 1))}
												className="px-2 py-1"
												aria-label="Aumentar cantidad"
											>
												+</button>
										</div>
									</div>

									<button
										onClick={toggleFavorite}
										className="p-3 rounded-lg border-2 border-border hover:border-primary transition-smooth"
										aria-pressed={isFavorite}
									>
										<Heart className={`h-6 w-6 ${isFavorite ? "fill-primary text-primary" : "text-foreground"}`} />
									</button>
								</div>

								{/* Description */}
								{product.descripcion && (
									<div className="space-y-2">
										<p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Descripción</p>
										<p className="text-lg text-foreground leading-relaxed">{product.descripcion}</p>
									</div>
								)}

								{/* CTA Buttons */}
								<div className="space-y-3 pt-6">
									{(!isTallaAvailable && tallas.length > 0) ? (
										<div className="text-sm text-destructive">La talla seleccionada está agotada. Selecciona otra talla para poder pedir.</div>
									) : product.disponible || tallas.length > 0 ? (
										<WhatsAppCTA
											whatsappNumber={whatsappNumber}
											message={buildWhatsAppMessage("Hola, me interesa:")}
											label={product.disponible || tallas.length > 0 ? "Pedir por WhatsApp" : "Avisar cuando haya stock"}
											className="w-full justify-center bg-primary border-primary hover:bg-primary/90"
										/>
									) : (
										<WhatsAppCTA
											whatsappNumber={whatsappNumber}
											message={`Hola, quisiera que me avisen cuando haya stock de: ${product.nombre}`}
											label="Avisar cuando haya stock"
											className="w-full justify-center bg-secondary border-secondary hover:bg-secondary/90"
										/>
									)}
								</div>
							</div>
						</div>

						{/* Additional Info */}
						{product.descripcion && (
							<div className="mt-20 border-t-2 border-border pt-12">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
									<div className="space-y-4">
										<h2 className="text-2xl font-semibold text-foreground">Detalles del producto</h2>
										<div className="space-y-3 text-foreground leading-relaxed">
											<p><span className="font-black">Categoría:</span> {product.categoria?.nombre}</p>
											<p><span className="font-black">Stock:</span> {tallas.length === 0 ? (product.disponible ? `${product.cantidadStock} disponibles` : "Agotado") : "Ver tallas"}</p>
										</div>
									</div>

									<div className="space-y-4">
										<h2 className="text-2xl font-semibold text-foreground">¿Preguntas?</h2>
										<p className="text-foreground leading-relaxed mb-4">Escríbenos por WhatsApp para dudas o pedidos de este producto.</p>
										<WhatsAppCTA
											whatsappNumber={whatsappNumber}
											message={`Hola, tengo dudas sobre: ${product.nombre}`}
											label="Escribir por WhatsApp"
											className="w-full justify-center"
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border bg-background py-12 mt-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
					<p>© 2024 Moda Peru. Tienda online con envíos a todo el Perú.</p>
				</div>
			</footer>
		</main>
		);
}
