"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";

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
}

export default function ProductCard({
	id,
	nombre,
	precio,
	imagen,
	disponible,
	cantidadStock = 0,
	enOferta = false,
	precioDescuento,
	porcentajeDescuento,
}: ProductCardProps) {
	const [isFavorite, setIsFavorite] = useState(false);

	return (
		<Link href={`/productos/${id}`}>
			<div className="group overflow-hidden rounded-lg bg-card border-2 border-border transition-all duration-300 hover:shadow-2xl hover:border-primary hover:-translate-y-3 active:scale-95">
				{/* Image Container */}
				<div className="relative aspect-square w-full overflow-hidden bg-linear-to-br from-muted to-muted/80">
					<Image
						src={imagen}
						alt={nombre}
						fill
						className="object-cover transition-all duration-500 group-hover:scale-110"
						sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
					/>

					{/* Overlay gradient on hover */}
					<div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

					{/* Stock Indicator */}
					{!disponible && (
						<div className="absolute inset-0 bg-black/75 flex items-center justify-center backdrop-blur-sm">
							<span className="text-white font-semibold text-lg">Agotado</span>
						</div>
					)}

					{/* Favorite Button */}
					<button
						onClick={(e) => {
							e.preventDefault(); // evita que el Link lo capture
							setIsFavorite(!isFavorite);
						}}
						className="absolute right-4 top-4 rounded-full bg-white p-3 shadow-lg hover:bg-accent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary opacity-0 group-hover:opacity-100 transform group-hover:scale-110"
						aria-label={
							isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"
						}
					>
						<Heart
							className={`h-6 w-6 transition-all duration-300 ${
								isFavorite
									? "fill-primary text-primary scale-125"
									: "text-primary hover:scale-110"
							}`}
						/>
					</button>

					{/* Sale Badge */}
					{enOferta && (
						<div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg px-4 py-2 border-2 border-white shadow-lg transform group-hover:scale-110 transition-transform duration-300">
							<span className="text-xs font-semibold">
								{porcentajeDescuento ? `${porcentajeDescuento}% off` : "Oferta"}
							</span>
						</div>
					)}

					{/* Low Stock Badge */}
					{disponible && cantidadStock > 0 && cantidadStock <= 5 && (
						<div className="absolute bottom-4 left-4 bg-primary text-white rounded-none px-4 py-2 animate-slide-up border-2 border-white">
							<span className="text-sm font-medium">
								Quedan {cantidadStock}
							</span>
						</div>
					)}
				</div>

				{/* Content */}
				<div className="p-6 flex flex-col gap-4 bg-card relative">
					<h3 className="font-black text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 tracking-wide group-hover:translate-x-1">
						{nombre}
					</h3>

					<div className="flex items-end justify-between gap-3">
						<div>
							<p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
								Precio
							</p>
							<div className="flex items-baseline gap-2">
								{enOferta && precioDescuento ? (
									<>
										<span className="text-sm text-muted-foreground line-through font-semibold">
											S/. {precio.toFixed(2)}
										</span>
										<span className="text-2xl font-black text-primary">
											S/. {precioDescuento.toFixed(2)}
										</span>
									</>
								) : (
									<span className="text-2xl font-black text-primary">
										S/. {precio.toFixed(2)}
									</span>
								)}
							</div>
						</div>

						{disponible && (
							<span className="text-xs font-medium text-secondary bg-secondary/10 px-4 py-2 rounded-none border border-secondary">
								En stock
							</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
