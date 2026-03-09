import { Category, CategoriesSchema } from "@/lib/strapi/types/category";
import { SiteSettingsSchema, SiteSettings } from "@/lib/strapi/types/settings";
import {
	ProductoSchema,
	Producto,
	ProductosSchema,
} from "./strapi/types/product";
import qs from "qs";
import { STRAPI_URL } from "@/lib/constants";

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

/** Get featured productos (destacado = true) */
export async function getFeaturedProducts(): Promise<Producto[]> {
	try {
		const qs = "filters[destacado][$eq]=true&" + buildProductQuery();

		const res = await fetch(`${STRAPI_URL}/api/productos?${qs}`);

		console.log(`${STRAPI_URL}/api/productos?${qs}`);

		if (!res.ok) {
			throw new Error(`Strapi API error: ${res.status}`);
		}

		const json = await res.json();
		const items = json.data ?? [];

		return ProductosSchema.parse(items);
	} catch (err) {
		console.error("[Strapi] getFeaturedProducts error:", err);
		return [];
	}
}

/**
 * API functions (zodified)
 */

/** Get all productos */
export async function getProducts(): Promise<Producto[]> {
	try {
		const qs = buildProductQuery();

		console.log(`${STRAPI_URL}/api/productos?${qs}`);

		const res = await fetch(`${STRAPI_URL}/api/productos?${qs}`);

		if (!res.ok) {
			throw new Error(`Strapi API error: ${res.status}`);
		}

		const json = await res.json();
		const items = json.data ?? [];

		return ProductosSchema.parse(items);
	} catch (err) {
		console.error("[Strapi] getProducts error:", err);
		return [];
	}
}

/** Get product by ID */
export async function getProductById(id: string): Promise<Producto | null> {
	try {
		const qs = buildProductQuery();

		const res = await fetch(
			`${STRAPI_URL}/api/productos/${encodeURIComponent(id)}?${qs}`,
		);

		if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);

		const json = await res.json();
		const item = json.data ?? null;
		if (!item) return null;

		return ProductoSchema.parse(item);
	} catch (err) {
		console.error("[Strapi] getProductById error:", err);
		return null;
	}
}

/** Get all categories */
export async function getCategories(): Promise<Category[]> {
	try {
		const res = await fetch(`${STRAPI_URL}/api/categorias?populate=*`);
		if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);
		const json = await res.json();
		const items = json.data ?? [];

		return CategoriesSchema.parse(items);
	} catch (err) {
		console.error("[Strapi] getCategories error:", err);
		return [];
	}
}

/** Get productos by category (expects `category` to be the category slug or name depending on your Strapi filters) */
export async function getProductsByCategory(
	category: string,
): Promise<Producto[]> {
	try {
		const encoded = encodeURIComponent(category);
		// NOTE: adjust filter key according to your Strapi field name (categoria vs category)
		const res = await fetch(
			`${STRAPI_URL}/api/productos?filters[categoria][nombre][$eq]=${encoded}&populate=*`,
		);
		if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);
		const json = await res.json();
		const items = json.data ?? [];

		return ProductosSchema.parse(items);
	} catch (err) {
		console.error("[Strapi] getProductsByCategory error:", err);
		return [];
	}
}

/** Get site settings */
export async function getSettings(): Promise<SiteSettings | null> {
	const query = qs.stringify(
		{
			fields: [
				"id",
				"documentId",
				"tituloHero",
				"subtituloHero",
				"descripcionTienda",
				"numeroWhatsapp",
				"textoCTA",
			],
			populate: {
				imagenHero: {
					fields: ["url", "name", "alternativeText"],
				},
				estadisticas: {
					fields: ["id", "textoArriba", "textoAbajo"],
				},
			},
		},
		{ encodeValuesOnly: true },
	);

	try {
		const res = await fetch(`${STRAPI_URL}/api/configuracion?${query}`);

		if (!res.ok) {
			console.error(`[Strapi] Fetch failed: ${res.statusText}`);
			return null;
		}

		const { data } = await res.json();

		if (!data) return null;

		// Validation with Zod
		return SiteSettingsSchema.parse(data);
	} catch (err) {
		console.error("[Strapi] Network error:", err);
		return null;
	}
}
