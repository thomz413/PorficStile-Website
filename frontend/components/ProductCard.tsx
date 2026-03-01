"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye } from "lucide-react";
import { getStrapiImageUrl } from "@/lib/strapi";
import { useCurrency } from "@/contexts/CurrencyContext";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { useToast } from "@/components/ImprovedToast";
import { useRouter } from "next/navigation";

interface ProductCardProps {
	id: string;
	nombre: string;
	precio: number;
	imagen: string;
	disponible: boolean;
	cantidadStock?: number;
	enOferta?: boolean;
	precioDescuento?: number;
	porcentajeDescuento?: number;
	categoria?: {
		nombre: string;
	};
	whatsappNumber?: string | null;
}

export default function ProductCard({
	id,
	nombre,
	precio,
	imagen,
	disponible,
	cantidadStock,
	enOferta,
	precioDescuento,
	porcentajeDescuento,
	categoria,
	whatsappNumber,
}: ProductCardProps) {
	const router = useRouter();

	const [isLiked, setIsLiked] = useState(false);
	const [showQuickActions, setShowQuickActions] = useState(false);
	const { convertAndFormatPrice, currencyInfo, isLoading } = useCurrency();
	const { addToast } = useToast();

	const imageUrl = getStrapiImageUrl(imagen);
	const precioFinal = enOferta && precioDescuento ? precioDescuento : precio;
	const precioFormateado = convertAndFormatPrice(precioFinal);
	const precioOriginalFormateado = convertAndFormatPrice(precio);

	// WhatsApp message for quick order
	const quickOrderConfig = {
		type: "product_order" as const,
		productName: nombre,
		productPrice: precioFinal,
		currency: "PEN",
		category: categoria?.nombre,
		quantity: 1,
	};

	const handleLike = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const newLikedState = !isLiked;
		setIsLiked(newLikedState);

		addToast({
			type: newLikedState ? "success" : "info",
			title: newLikedState ? "¡Favorito agregado!" : "Favorito eliminado",
			message: newLikedState
				? `${nombre} está ahora en tus favoritos ❤️`
				: `${nombre} ya no está en tus favoritos`,
			duration: 3000,
		});
	};

	return (
		<div
			className="group relative bg-card border border-border rounded-none overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:cursor-pointer"
			onClick={() => router.push(`/productos/${id}`)}
			onMouseEnter={() => setShowQuickActions(true)}
			onMouseLeave={() => setShowQuickActions(false)}
		>
			{/* Badge de oferta */}
			{enOferta && (
				<div className="absolute top-3 left-3 z-10 bg-destructive text-white text-xs font-black px-3 py-1 rounded-sm">
					-{porcentajeDescuento}%
				</div>
			)}

			{/* Badge de stock */}
			{!disponible && (
				<div className="absolute top-3 right-3 z-10 bg-muted text-muted-foreground text-xs font-black px-3 py-1 rounded-sm">
					Agotado
				</div>
			)}

			{/* Quick actions overlay */}
			<div
				className={`absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-300 ${showQuickActions ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
			>
				<button
					onClick={handleLike}
					className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
					title={isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
				>
					<Heart
						className={`h-4 w-4 transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`}
					/>
				</button>
			</div>

			{/* Imagen del producto */}
			<div className="relative aspect-square overflow-hidden bg-muted">
				<Image
					src={imageUrl}
					alt={nombre}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-105"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
			</div>

			{/* Contenido */}
			<div className="p-4 space-y-3">
				{/* Categoría */}
				{categoria?.nombre && (
					<div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						{categoria.nombre}
					</div>
				)}

				{/* Nombre */}
				<h3 className="font-semibold text-foreground line-clamp-2 leading-tight min-h-[2.5rem] group-hover:text-primary transition-colors duration-200">
					{nombre}
				</h3>

				{/* Precios */}
				<div className="space-y-1">
					<div className="flex items-center gap-2 flex-wrap">
						{enOferta && precioDescuento ? (
							<>
								<span className="text-lg font-black text-destructive">
									{precioFormateado}
								</span>
								<span className="text-sm text-muted-foreground line-through">
									{precioOriginalFormateado}
								</span>
							</>
						) : (
							<span className="text-lg font-black text-foreground">
								{precioFormateado}
							</span>
						)}
						{currencyInfo.code !== "PEN" && !isLoading && (
							<span className="text-xs text-muted-foreground">
								({currencyInfo.code})
							</span>
						)}
					</div>

					{cantidadStock !== undefined && cantidadStock > 0 && (
						<div className="text-xs text-muted-foreground">
							{cantidadStock} disponibles
						</div>
					)}
				</div>

				{/* Acciones */}
				<div className="flex gap-2 pt-2">
					{whatsappNumber && disponible ? (
						<WhatsAppCTA
							whatsappNumber={whatsappNumber}
							messageConfig={quickOrderConfig}
							label="Pedir"
							className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 border-primary text-sm py-2"
						/>
					) : (
						<Link
							href={`/productos/${id}`}
							className="flex-1 inline-flex items-center justify-center gap-2 rounded-none bg-muted px-4 py-2 font-medium text-muted-foreground hover:bg-muted/90 transition-smooth border border-border text-sm"
						>
							<Eye className="h-4 w-4" />
							Ver
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
