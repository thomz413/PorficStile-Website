"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Producto, Variante } from "@/lib/strapi/types/product";

interface GalleryImage {
	url: string;
	name?: string;
	alt?: string;
	source?: "variant" | "product";
}

interface ProductGalleryProps {
	product: Producto;
	selectedVariant?: Variante | null;
	className?: string;
}

export default function ProductGallery({
	product,
	selectedVariant,
	className = "",
}: ProductGalleryProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isZoomed, setIsZoomed] = useState(false);

	// for swipe handling
	const touchStartX = useRef<number | null>(null);
	const touchEndX = useRef<number | null>(null);

	// Build gallery array with variant image override logic (defensive checks)
	const gallery = useMemo<GalleryImage[]>(() => {
		const imgs: GalleryImage[] = [];

		// helper to push unique by url
		const pushIfUnique = (img: GalleryImage) => {
			if (!img?.url) return;
			if (!imgs.some((i) => i.url === img.url)) imgs.push(img);
		};

		// Variant-first: support several common shapes (imagenPrincipal, imagenes, galeria)

		// Product-level images next
		if (product.imagenPrincipal?.url) {
			pushIfUnique({
				url: product.imagenPrincipal.url,
				name: product.imagenPrincipal.name ?? "",
				alt: product.imagenPrincipal.alternativeText ?? product.nombre ?? "",
				source: "product",
			});
		}

		if (Array.isArray(product.galeria)) {
			product.galeria.forEach((img) =>
				pushIfUnique({
					url: img.url,
					name: img.name ?? "",
					alt: img.alternativeText ?? product.nombre ?? "",
					source: "product",
				}),
			);
		}

		// final fallback placeholder
		if (imgs.length === 0) {
			imgs.push({
				url: "https://placehold.co/800x800?text=No+Imagen",
				name: "No Image",
				alt: product.nombre ?? "Sin imagen",
				source: "product",
			});
		}

		return imgs;
	}, [product]);

	// reset index when gallery changes (e.g., variant change) and keep index in bounds
	useEffect(() => {
		setCurrentIndex((prev) => {
			if (gallery.length === 0) return 0;
			return Math.min(prev, gallery.length - 1);
		});
		// prefer showing the first variant image when switching variants
		// if a variant is selected and its images exist, go to 0
		// otherwise keep current clamped index
		if (selectedVariant) setCurrentIndex(0);
	}, [gallery, selectedVariant]);

	// Keyboard navigation (global keydown)
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (isZoomed && e.key === "Escape") {
				setIsZoomed(false);
				return;
			}
			if (e.key === "ArrowLeft") {
				setCurrentIndex((i) => (i === 0 ? gallery.length - 1 : i - 1));
			} else if (e.key === "ArrowRight") {
				setCurrentIndex((i) => (i === gallery.length - 1 ? 0 : i + 1));
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [gallery.length, isZoomed]);

	// simple swipe support
	const onTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0]?.clientX ?? null;
		touchEndX.current = null;
	};
	const onTouchMove = (e: React.TouchEvent) => {
		touchEndX.current = e.touches[0]?.clientX ?? null;
	};
	const onTouchEnd = () => {
		const start = touchStartX.current;
		const end = touchEndX.current;
		if (start == null || end == null) return;
		const delta = start - end;
		const threshold = 50; // px
		if (delta > threshold) {
			// swipe left -> next
			setCurrentIndex((i) => (i === gallery.length - 1 ? 0 : i + 1));
		} else if (delta < -threshold) {
			// swipe right -> previous
			setCurrentIndex((i) => (i === 0 ? gallery.length - 1 : i - 1));
		}
		touchStartX.current = null;
		touchEndX.current = null;
	};

	// Preload next image to make transitions smoother
	useEffect(() => {
		const nextIndex = (currentIndex + 1) % gallery.length;
		const img = new window.Image();
		img.src = gallery[nextIndex].url;
	}, [currentIndex, gallery]);

	// Zoom modal: lock body scroll when open
	useEffect(() => {
		if (isZoomed) {
			const prev = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = prev;
			};
		}
	}, [isZoomed]);

	const goToPrevious = () => {
		setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
	};

	const goToNext = () => {
		setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
	};

	const goToSlide = (index: number) => {
		setCurrentIndex(index);
	};

	const toggleZoom = (e?: React.MouseEvent) => {
		// prevent toggle when clicking inside modal content (handled where appropriate)
		if (e) e.stopPropagation();
		setIsZoomed((z) => !z);
	};

	// Accessible labels
	const currentImage = gallery[currentIndex];

	return (
		<div
			className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
		>
			{/* Main image area */}
			<div
				className="relative aspect-square group touch-none select-none"
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
			>
				<Image
					src={currentImage.url}
					alt={currentImage.alt ?? product.nombre ?? ""}
					fill
					className={`object-cover transition-transform duration-300 ${
						isZoomed
							? "scale-150 cursor-zoom-out"
							: "hover:scale-105 cursor-zoom-in"
					}`}
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					priority={currentIndex === 0}
					aria-hidden={false}
				/>

				{/* zoom button */}
				<button
					onClick={toggleZoom}
					className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
					aria-label={isZoomed ? "Cerrar zoom" : "Abrir zoom"}
				>
					<ZoomIn className="h-4 w-4" />
				</button>

				{/* navigation arrows */}
				{gallery.length > 1 && (
					<>
						<button
							onClick={goToPrevious}
							className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white"
							aria-label="Imagen anterior"
						>
							<ChevronLeft className="h-5 w-5" />
						</button>
						<button
							onClick={goToNext}
							className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white"
							aria-label="Siguiente imagen"
						>
							<ChevronRight className="h-5 w-5" />
						</button>
					</>
				)}
			</div>

			{/* thumbnail strip */}
			{gallery.length > 1 && (
				<div className="flex gap-2 p-3 overflow-x-auto">
					{gallery.map((image, index) => (
						<button
							key={image.url}
							onClick={() => goToSlide(index)}
							className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 transition-transform duration-150 focus:outline-none ${
								index === currentIndex
									? "border-blue-500 scale-105"
									: "border-gray-300 hover:scale-105"
							}`}
							aria-label={`Ver imagen ${index + 1} de ${gallery.length}`}
							aria-current={index === currentIndex}
						>
							<Image
								src={image.url}
								alt={image.alt ?? ""}
								fill
								className="object-cover"
								sizes="64px"
								loading={index === 0 ? "eager" : "lazy"}
							/>
							{index === currentIndex && (
								<div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />
							)}
						</button>
					))}
				</div>
			)}

			{/* image counter */}
			{gallery.length > 1 && (
				<div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
					{currentIndex + 1} / {gallery.length}
				</div>
			)}

			{/* zoom modal */}
			{isZoomed && (
				<div
					className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
					onClick={toggleZoom}
					role="dialog"
					aria-modal="true"
					aria-label="Imagen ampliada"
				>
					{/* stopPropagation so clicking image area doesn't close */}
					<div
						className="relative max-w-[95vw] max-h-[95vh]"
						onClick={(e) => e.stopPropagation()}
					>
						<Image
							src={currentImage.url}
							alt={currentImage.alt ?? product.nombre ?? ""}
							width={1200}
							height={1200}
							className="object-contain"
							sizes="(max-width: 768px) 90vw, 80vw"
						/>

						{/* prev/next inside modal for convenience */}
						{gallery.length > 1 && (
							<>
								<button
									onClick={goToPrevious}
									className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
									aria-label="Imagen anterior (en modal)"
								>
									<ChevronLeft className="h-5 w-5" />
								</button>
								<button
									onClick={goToNext}
									className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
									aria-label="Siguiente imagen (en modal)"
								>
									<ChevronRight className="h-5 w-5" />
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
