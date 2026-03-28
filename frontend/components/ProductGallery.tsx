"use client";

import { ChevronLeftIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRightIcon } from "@/components/icons/ChevronRight";
import { Producto, Variante } from "@/lib/strapi/types/product";
import { placeholderImage } from "@/lib/utils";

export default function ProductGallery({
	product,
	selectedVariant,
	className = "",
}: {
	product: Producto;
	selectedVariant?: Variante | null;
	className?: string;
}) {
	const [currentIndex, setCurrentIndex] = useState(0);

	// 1. Build the gallery array - Optimized O(1) deduplication using Set
	const gallery = useMemo(() => {
		const imgs: { url: string; alt: string }[] = [];
		const seenUrls = new Set<string>();

		const add = (url?: string, alt?: string) => {
			if (url && !seenUrls.has(url)) {
				seenUrls.add(url);
				imgs.push({ url, alt: alt || product.nombre || "Producto" });
			}
		};

		// Priority: Variant, then Main, then Gallery
		add(product.imagenPrincipal?.url);

		product.galeria?.forEach((img) => add(img.url, img.alternativeText));

		return imgs.length > 0
			? imgs
			: [{ url: placeholderImage(), alt: "No image" }];
	}, [product]);

	// 2. Sync index when variant changes or gallery shrinks
	useEffect(() => {
		setCurrentIndex(0);
	}, [selectedVariant]);

	// 3. Navigation handlers (Memoized for performance)
	const next = useCallback(
		(e?: React.MouseEvent) => {
			e?.stopPropagation();
			setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
		},
		[gallery.length],
	);

	const prev = useCallback(
		(e?: React.MouseEvent) => {
			e?.stopPropagation();
			setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
		},
		[gallery.length],
	);

	return (
		<div className={`flex flex-col gap-4 ${className}`}>
			{/* MAIN PREVIEW AREA */}
			<div className="relative aspect-square rounded-2xl bg-gray-50 overflow-hidden group border border-gray-100 flex items-center justify-center">
				<Image
					src={gallery[currentIndex]?.url}
					alt={gallery[currentIndex]?.alt}
					fill
					className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
					priority
					sizes="(max-width: 768px) 100vw, 50vw"
				/>

				{/* NAVIGATION ARROWS (Visible on hover) */}
				{gallery.length > 1 && (
					<>
						<button
							onClick={prev}
							className="absolute left-4 p-2 text-black/60 hover:text-black bg-white/70 hover:bg-white rounded-full shadow-sm backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
							aria-label="Imagen anterior"
						>
							<ChevronLeftIcon className="w-6 h-6" />
						</button>
						<button
							onClick={next}
							className="absolute right-4 p-2 text-black/60 hover:text-black bg-white/70 hover:bg-white rounded-full shadow-sm backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
							aria-label="Siguiente imagen"
						>
							<ChevronRightIcon className="w-6 h-6" />
						</button>
					</>
				)}
			</div>

			{/* THUMBNAIL TRACK */}
			{gallery.length > 1 && (
				<div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
					{gallery.map((img, i) => (
						<button
							key={img.url + i}
							onClick={() => setCurrentIndex(i)}
							className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
								i === currentIndex
									? "border-black scale-95 shadow-md"
									: "border-transparent opacity-50 hover:opacity-100"
							}`}
							aria-label={`Ver imagen ${i + 1}`}
							aria-current={i === currentIndex}
						>
							<Image
								src={img.url}
								alt={img.alt}
								fill
								className="object-cover"
								sizes="80px"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
