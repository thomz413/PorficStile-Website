"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Producto, Variante } from "@/lib/strapi/types/product";

interface VariantSelectorProps {
	product: Producto;
	selectedVariant: Variante | null;
	onVariantSelect: (variant: Variante | null) => void;
	className?: string;
}

/**
 * VariantSelector
 *
 * Improvements:
 * - Allows selecting talla and color independently, but resolves to the best matching variant
 *   (prefers a variant with disponible=true, otherwise any variant that matches).
 * - Disables size/color options that have no available variant for that combination
 *   (availability = variant.disponible === true OR variant.stock > 0).
 * - Falls back to product.cantidadStock when variant.stock is undefined for informational messages.
 * - Syncs internal talla/color UI state with `selectedVariant` prop (so clicking in the product page
 *   or programmatic changes reflect in the selector).
 * - Better accessibility (aria-pressed, aria-disabled) and small UX polish (show stock counts).
 */
export default function VariantSelector({
	product,
	selectedVariant,
	onVariantSelect,
	className = "",
}: VariantSelectorProps) {
	// local selected talla/color to allow independent selection before resolving a variant
	const [selectedTalla, setSelectedTalla] = useState<string | null>(
		selectedVariant?.talla ?? null,
	);
	const [selectedColor, setSelectedColor] = useState<string | null>(
		selectedVariant?.color ?? null,
	);

	// keep local state in sync when parent changes selectedVariant
	useEffect(() => {
		setSelectedTalla(selectedVariant?.talla ?? null);
		setSelectedColor(selectedVariant?.color ?? null);
	}, [selectedVariant]);

	// helpers: determine if a variant is "available" for UI enabling purposes
	// availability rule for selection UI: a variant is considered available if
	// - variant.disponible === true OR
	// - variant.stock (number) > 0
	const isVariantAvailableForUI = (v: Variante) => {
		if (v.disponible) return true;
		return typeof v.stock === "number" && v.stock > 0;
	};

	// All unique tallas in product (preserve the TallaEnum order if present)
	const tallasFromProduct = useMemo(() => {
		const seen = new Set<string>();
		const arr: string[] = [];
		(product.variantes ?? []).forEach((v) => {
			if (v.talla && !seen.has(v.talla)) {
				seen.add(v.talla);
				arr.push(v.talla);
			}
		});
		return arr;
	}, [product]);

	// All unique colors in product
	const colorsFromProduct = useMemo(() => {
		const seen = new Set<string>();
		const arr: string[] = [];
		(product.variantes ?? []).forEach((v) => {
			if (v.color && !seen.has(v.color)) {
				seen.add(v.color);
				arr.push(v.color);
			}
		});
		return arr;
	}, [product]);

	// For each talla decide if there exists at least one variant for that talla that is available
	const tallaAvailability = useMemo(() => {
		const map = new Map<string, { available: boolean; totalStock?: number }>();
		(product.variantes ?? []).forEach((v) => {
			if (!v.talla) return;
			const curr = map.get(v.talla) ?? {
				available: false,
				totalStock: undefined as number | undefined,
			};
			const available = isVariantAvailableForUI(v);
			if (available) curr.available = true;
			// accumulate stock numbers present at variant-level (not product-level)
			if (typeof v.stock === "number") {
				curr.totalStock = (curr.totalStock ?? 0) + v.stock;
			}
			map.set(v.talla, curr);
		});
		return map;
	}, [product]);

	// For a given talla, return available colors (only those colors that have an available variant for talla+color)
	const getAvailableColorsForTalla = (talla?: string | null) => {
		const set = new Set<string>();
		(product.variantes ?? []).forEach((v) => {
			if (!v.color) return;
			// if talla filter provided, require it
			if (talla && v.talla !== talla) return;
			if (isVariantAvailableForUI(v)) {
				set.add(v.color);
			} else {
				// if not available for UI on variant-level, we still might want to show color
				// only if other variants with same color (and talla) are available — handled by loop
			}
		});
		return Array.from(set);
	};

	// Given selectedTalla/selectedColor, resolve a variant.
	// Priority:
	// 1) variant that matches both and is disponible === true
	// 2) variant that matches both and has stock > 0
	// 3) any variant that matches both
	// 4) if only talla selected: pick the first variant for that talla following the same priority
	const resolveVariant = (talla?: string | null, color?: string | null) => {
		const candidates = (product.variantes ?? []).filter((v) => {
			if (talla && v.talla !== talla) return false;
			return !(color && v.color !== color);
		});
		if (candidates.length === 0) return null;

		// prefer disponible true
		const preferDisponible = candidates.find((v) => v.disponible === true);
		if (preferDisponible) return preferDisponible;

		// then prefer stock > 0
		const preferStock = candidates.find(
			(v) => typeof v.stock === "number" && v.stock > 0,
		);
		if (preferStock) return preferStock;

		return candidates[0];
	};

	// When user clicks a talla button
	const handleTallaClick = (talla: string) => {
		// If clicking the already selected talla, toggle it off
		const nextTalla = selectedTalla === talla ? null : talla;
		// If color is set but that color isn't available for the next talla, clear color
		const colorsForTalla = getAvailableColorsForTalla(nextTalla);
		let nextColor = selectedColor;
		if (
			nextColor &&
			colorsForTalla.length > 0 &&
			!colorsForTalla.includes(nextColor)
		) {
			nextColor = null;
		}

		setSelectedTalla(nextTalla);
		setSelectedColor(nextColor);

		const resolved = resolveVariant(nextTalla, nextColor);
		onVariantSelect(resolved);
	};

	// When user clicks a color button
	const handleColorClick = (color: string) => {
		const nextColor = selectedColor === color ? null : color;
		// if talla selected but this color doesn't exist for that talla, clear talla
		let nextTalla = selectedTalla;
		if (nextTalla) {
			const colorsForTalla = getAvailableColorsForTalla(nextTalla);
			if (
				colorsForTalla.length > 0 &&
				!colorsForTalla.includes(nextColor ?? "")
			) {
				// color not available for current talla — try to find a talla that has this color
				const variantThatHasColor = (product.variantes ?? []).find(
					(v) => v.color === nextColor && isVariantAvailableForUI(v),
				);
				nextTalla = variantThatHasColor?.talla ?? null;
			}
		}

		setSelectedColor(nextColor);
		setSelectedTalla(nextTalla);
		const resolved = resolveVariant(nextTalla, nextColor);
		onVariantSelect(resolved);
	};

	// Clear selection
	const clearSelection = () => {
		setSelectedTalla(null);
		setSelectedColor(null);
		onVariantSelect(null);
	};

	// Current resolved variant (derived from selectedVariant prop; but recalc just in case)
	const resolvedVariant = useMemo(
		() => resolveVariant(selectedTalla, selectedColor) ?? selectedVariant,
		[selectedTalla, selectedColor, selectedVariant, product],
	);

	// stock info to display: prefer variant.stock, fallback to product.cantidadStock, or "Disponible" if disponible true but no numbers
	const stockMessage = useMemo(() => {
		const v = resolvedVariant ?? selectedVariant;
		if (v) {
			if (typeof v.stock === "number") {
				if (v.disponible) return `✓ ${v.stock} unidades disponibles`;
				return `✗ Agotado (${v.stock})`;
			}
			// variant has no stock number: fallback to product
			if (typeof product.cantidadStock === "number") {
				if (v.disponible)
					return `✓ ${product.cantidadStock} disponibles (nivel producto)`;
				return `✗ Agotado (nivel producto: ${product.cantidadStock})`;
			}
			// no numeric stock anywhere: use disponible flag
			return v.disponible ? "✓ Disponible" : "✗ Agotado";
		}

		// no specific variant selected: inspect product-level
		return product.disponible
			? `✓ ${product.cantidadStock} disponibles`
			: `✗ Agotado (${product.cantidadStock})`;
	}, [resolvedVariant, selectedVariant, product]);

	const availableColorsForCurrentTalla = useMemo(
		() => getAvailableColorsForTalla(selectedTalla),
		[selectedTalla, product],
	);

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Size Selector */}
			{tallasFromProduct.length > 0 && (
				<div>
					<h3 className="text-sm font-medium text-gray-900 mb-2">Talla</h3>
					<div className="flex flex-wrap gap-2">
						{tallasFromProduct.map((talla) => {
							const info = tallaAvailability.get(talla);
							const available = !!info?.available;
							const disabled = !available;
							const isActive =
								selectedTalla === talla || selectedVariant?.talla === talla;
							return (
								<button
									key={talla}
									onClick={() => handleTallaClick(talla)}
									className={`px-4 py-2 border rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
										isActive
											? "border-blue-500 bg-blue-500 text-white"
											: disabled
												? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
												: "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
									}`}
									aria-label={`Seleccionar talla ${talla}`}
									aria-pressed={isActive}
									aria-disabled={disabled}
									disabled={disabled}
								>
									{talla}
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Color Selector */}
			{colorsFromProduct.length > 0 && (
				<div>
					<h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
					<div className="flex flex-wrap gap-2">
						{colorsFromProduct.map((color) => {
							// Determine if this color is available for the current talla (if talla selected),
							// otherwise check if any variant with this color is available.
							let available = false;
							if (selectedTalla) {
								available = availableColorsForCurrentTalla.includes(color);
							} else {
								available = (product.variantes ?? []).some(
									(v) => v.color === color && isVariantAvailableForUI(v),
								);
							}

							const isActive =
								selectedColor === color || selectedVariant?.color === color;
							const disabled = !available;

							return (
								<button
									key={color}
									onClick={() => handleColorClick(color)}
									className={`w-12 h-12 border-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
										isActive
											? "border-blue-500 ring-2 ring-blue-200"
											: disabled
												? "border-gray-200 opacity-40 cursor-not-allowed"
												: "border-gray-300 hover:border-gray-400"
									}`}
									style={{ backgroundColor: color }}
									aria-label={`Seleccionar color ${color}`}
									aria-pressed={isActive}
									aria-disabled={disabled}
									disabled={disabled}
								>
									<span className="sr-only">{color}</span>
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Stock Info */}
			{(selectedVariant || selectedTalla || selectedColor) && (
				<div className="text-sm text-gray-600" role="status" aria-live="polite">
					{stockMessage}
				</div>
			)}

			{/* Clear Selection */}
			<div>
				<button
					onClick={clearSelection}
					className="text-sm text-gray-500 hover:text-gray-700 underline"
				>
					Limpiar selección
				</button>
			</div>
		</div>
	);
}
