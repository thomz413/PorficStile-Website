"use client";

import React from "react";
import { Producto, Variante } from "@/lib/strapi/types/product";
import { TallaEnum } from "@/lib/strapi/types/product";

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
  className = "" 
}: VariantSelectorProps) {
  
  const handleTallaChange = (talla: string) => {
    // Find variant with matching talla
    const variant = product.variantes?.find(v => v.talla === talla) || null;
    onVariantSelect(variant);
  };

  const handleColorChange = (color: string) => {
    // Find variant with matching color (if multiple variants have same talla)
    const variant = product.variantes?.find(v => v.color === color) || null;
    onVariantSelect(variant);
  };

  const getAvailableTallas = () => {
    const tallas = new Set<string>();
    product.variantes?.forEach(variant => {
      if (variant.talla && variant.disponible) {
        tallas.add(variant.talla);
      }
    });
    return Array.from(tallas);
  };

  const getAvailableColors = () => {
    const colors = new Set<string>();
    product.variantes?.forEach(variant => {
      if (variant.color && variant.disponible) {
        colors.add(variant.color);
      }
    });
    return Array.from(colors);
  };

  const availableTallas = getAvailableTallas();
  const availableColors = getAvailableColors();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Size Selector */}
      {availableTallas.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Talla</h3>
          <div className="flex flex-wrap gap-2">
            {availableTallas.map((talla) => (
              <button
                key={talla}
                onClick={() => handleTallaChange(talla)}
                className={`px-4 py-2 border rounded-md font-medium transition-colors ${
                  selectedVariant?.talla === talla
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
                aria-label={`Seleccionar talla ${talla}`}
                aria-pressed={selectedVariant?.talla === talla}
              >
                {talla}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {availableColors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-12 h-12 border-2 rounded-md transition-colors ${
                  selectedVariant?.color === color
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Seleccionar color ${color}`}
                aria-pressed={selectedVariant?.color === color}
              >
                <span className="sr-only">{color}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock Info */}
      {selectedVariant && (
        <div className="text-sm text-gray-600">
          {selectedVariant.disponible ? (
            <span>✓ {selectedVariant.stock ?? 0} unidades disponibles</span>
          ) : (
            <span>✗ Agotado</span>
          )}
        </div>
      )}

      {/* Clear Selection */}
      {(selectedVariant || availableTallas.length === 0) && (
        <button
          onClick={() => onVariantSelect(null)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Limpiar selección
        </button>
      )}
    </div>
  );
}
