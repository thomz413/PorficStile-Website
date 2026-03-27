"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Producto, Variante } from "@/lib/strapi/types/product";

interface VariantSelectorProps {
	product: Producto;
	selectedVariant: Variante | null;
	onVariantSelect: (variant: Variante | null) => void;
	className?: string;
}

export default function VariantSelector({
											product,
											selectedVariant,
											onVariantSelect,
											className = "",
										}: VariantSelectorProps) {
	// 1. Keep track of the prop to know if it changed from the outside
	const [prevPropVariant, setPrevPropVariant] = useState<Variante | null>(selectedVariant);

	// 2. Local selected talla/color to allow independent selection
	const [selectedTalla, setSelectedTalla] = useState<string | null>(
		selectedVariant?.talla ?? null,
	);
	const [selectedColor, setSelectedColor] = useState<string | null>(
		selectedVariant?.color ?? null,
	);

	// 3. THE FIX: Sync state during render if the parent changed the prop externally.
	// This entirely replaces the useEffect and satisfies ESLint without cascading renders.
	if (selectedVariant !== prevPropVariant) {
		setPrevPropVariant(selectedVariant);
		setSelectedTalla(selectedVariant?.talla ?? null);
		setSelectedColor(selectedVariant?.color ?? null);
	}

	// helpers: determine if a variant is "available" for UI enabling purposes
	// Wrapped in useCallback so it can be safely used in dependency arrays
	const isVariantAvailableForUI = useCallback((v: Variante) => {
		if (v.disponible) return true;
		return typeof v.stock === "number" && v.stock > 0;
	}, []);

	// All unique tallas in product
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
	}, [product.variantes]);

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
	}, [product.variantes]);

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
			// accumulate stock numbers present at variant-level
			if (typeof v.stock === "number") {
				curr.totalStock = (curr.totalStock ?? 0) + v.stock;
			}
			map.set(v.talla, curr);
		});
		return map;
	}, [product.variantes, isVariantAvailableForUI]);

	// For a given talla, return available colors
	// Wrapped in useCallback to satisfy the availableColorsForCurrentTalla useMemo
	const getAvailableColorsForTalla = useCallback((talla?: string | null) => {
		const set = new Set<string>();
		(product.variantes ?? []).forEach((v) => {
			if (!v.color) return;
			if (talla && v.talla !== talla) return;
			if (isVariantAvailableForUI(v)) {
				set.add(v.color);
			}
		});
		return Array.from(set);
	}, [product.variantes, isVariantAvailableForUI]);

	// Given selectedTalla/selectedColor, resolve a variant.
	// Wrapped in useCallback so it doesn't break the resolvedVariant useMemo
	const resolveVariant = useCallback((talla?: string | null, color?: string | null) => {
		const candidates = (product.variantes ?? []).filter((v) => {
			if (talla && v.talla !== talla) return false;
			return !(color && v.color !== color);
		});
		if (candidates.length === 0) return null;

		const preferDisponible = candidates.find((v) => v.disponible === true);
		if (preferDisponible) return preferDisponible;

		const preferStock = candidates.find(
			(v) => typeof v.stock === "number" && v.stock > 0,
		);
		if (preferStock) return preferStock;

		return candidates[0];
	}, [product.variantes]);

	// When user clicks a talla button
	const handleTallaClick = (talla: string) => {
		const nextTalla = selectedTalla === talla ? null : talla;
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
		let nextTalla = selectedTalla;
		if (nextTalla) {
			const colorsForTalla = getAvailableColorsForTalla(nextTalla);
			if (
				colorsForTalla.length > 0 &&
				!colorsForTalla.includes(nextColor ?? "")
			) {
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

	// Current resolved variant
	const resolvedVariant = useMemo(
		() => resolveVariant(selectedTalla, selectedColor) ?? selectedVariant,
		[selectedTalla, selectedColor, selectedVariant, resolveVariant],
	);

	// stock info to display
	const stockMessage = useMemo(() => {
		const v = resolvedVariant ?? selectedVariant;
		if (v) {
			if (typeof v.stock === "number") {
				if (v.disponible) return `✓ ${v.stock} unidades disponibles`;
				return `✗ Agotado (${v.stock})`;
			}
			if (typeof product.cantidadStock === "number") {
				if (v.disponible)
					return `✓ ${product.cantidadStock} disponibles (nivel producto)`;
				return `✗ Agotado (nivel producto: ${product.cantidadStock})`;
			}
			return v.disponible ? "✓ Disponible" : "✗ Agotado";
		}

		return product.disponible
			? `✓ ${product.cantidadStock} disponibles`
			: `✗ Agotado (${product.cantidadStock})`;
	}, [resolvedVariant, selectedVariant, product.cantidadStock, product.disponible]);

	const availableColorsForCurrentTalla = useMemo(
		() => getAvailableColorsForTalla(selectedTalla),
		[selectedTalla, getAvailableColorsForTalla],
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