import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "qs";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Build product query safely using qs.stringify.
 * This avoids malformed nested populate strings and 400 errors.
 */
export function buildProductQuery() {
	const queryObj = {
		fields: [
			"id",
			"documentId",
			"nombre",
			"descripcion",
			"precio",
			"precioOferta",
			"tipoDescuento",
			"valorDescuento",
			"disponible",
			"cantidadStock",
			"slug",
			"destacado",
		],
		populate: {
			imagenPrincipal: { fields: ["url", "name", "alternativeText"] },
			galeria: { fields: ["url", "name", "alternativeText"] },
			categoria: { fields: ["id", "documentId", "nombre", "descripcion"] },
			variantes: {
				fields: [
					"id",
					"sku",
					"talla",
					"color",
					"stock",
					"disponible",
					"precioSobreescribir",
					"precioOferta",
					"tipoDescuento",
					"valorDescuento",
					"fechaInicioOferta",
					"fechaFinOferta",
				],
			},
		},
	};

	// encodeValuesOnly keeps bracket structure readable for Strapi
	return qs.stringify(queryObj, { encodeValuesOnly: true });
}

export function buildProductListQuery() {
	const queryObj = {
		fields: [
			"documentId",
			"nombre",
			"precio",
			"precioOferta",
			"tipoDescuento",
			"valorDescuento",
			// "slug" // Add this back if ProductCard needs it for the link
		],
		populate: {
			// Only fetch the first image needed for the card
			imagenPrincipal: {
				fields: ["url", "alternativeText"]
			},
			// Needed for your category filtering logic
			categoria: {
				fields: ["nombre"]
			},
		},
	};

	return qs.stringify(queryObj, { encodeValuesOnly: true });
}

export function placeholderImage({
	text = "No Imagen",
	width = 600,
	height = 800,
	bg = "f3f4f6",
	color = "6b7280",
}: {
	text?: string;
	width?: number;
	height?: number;
	bg?: string;
	color?: string;
} = {}) {
	const encoded = encodeURIComponent(text);
	return `https://placehold.co/${width}x${height}/${bg}/${color}?text=${encoded}`;
}
