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
			"enOferta",
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
					"enOferta",
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
