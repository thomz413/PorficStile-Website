"use cache";

import { cacheLife, cacheTag } from "next/cache";
import qs from "qs";
import { STRAPI_URL } from "@/lib/constants";
import { CategoriesSchema, Category } from "@/lib/strapi/types/category";
import {
	FooterSettings,
	FooterSettingsSchema,
	SiteSettings,
	SiteSettingsSchema,
} from "@/lib/strapi/types/settings";
import { buildProductListQuery, buildProductQuery } from "@/lib/utils";
import {
	Producto,
	ProductoSchema,
	ProductosSchema,
} from "./strapi/types/product";

/** Get featured productos (destacado = true) */
export async function getFeaturedProducts(): Promise<Producto[]> {
	"use cache";
	cacheTag("products", "product-list", "featured-products");
	cacheLife("products"); // Fast refresh

	const qs = "filters[destacado][$eq]=true&" + buildProductListQuery();
	const res = await fetch(`${STRAPI_URL}/api/productos?${qs}`);

	if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);
	const json = await res.json();
	return ProductosSchema.parse(json.data ?? []);
}
/** Get all productos */
export async function getProducts(): Promise<Producto[]> {
	"use cache";
	cacheTag("products", "product-list", "all-products");
	cacheLife("products");

	const qs = buildProductListQuery();
	const res = await fetch(`${STRAPI_URL}/api/productos?${qs}`);
	if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);
	const json = await res.json();
	return ProductosSchema.parse(json.data ?? []);
}

export async function getProductsByIds(ids: string[]): Promise<Producto[]> {
	"use cache";
	cacheTag("products", "favourites");
	cacheLife("favourites");

	if (ids.length === 0) return [];

	const sortedIds = [...ids].sort();

	const query = qs.stringify(
		{
			filters: {
				documentId: { $in: sortedIds },
			},
			fields: [
				"documentId",
				"nombre",
				"precio",
				"precioOferta",
				"tipoDescuento",
				"valorDescuento",
				"slug",
			],
			populate: {
				imagenPrincipal: {
					fields: ["url", "alternativeText"],
				},
				categoria: {
					fields: ["nombre"],
				},
			},
		},
		{ encodeValuesOnly: true },
	);

	const res = await fetch(`${STRAPI_URL}/api/productos?${query}`);
	const json = await res.json();
	return ProductosSchema.parse(json.data);
}

/** Get product by ID */
export async function getProductBySlug(slug: string): Promise<Producto | null> {
	"use cache";
	// Target the specific slug for invalidation
	cacheTag("products", "product-detail", `product-${slug}`);
	cacheLife("products");

	const qs = buildProductQuery();

	// We add the filter to the query string
	// This assumes your UID field in Strapi}is named 'slug'
	const url = `${STRAPI_URL}/api/productos?filters[slug][$eq]=${encodeURIComponent(slug)}&${qs}`;

	const res = await fetch(url);
	if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);

	const json = await res.json();

	console.log(json);

	// Strapi filter queries return an array in 'data'
	const productData = json.data?.[0];

	if (!productData) return null;

	try {
		return ProductoSchema.parse(productData);
	} catch (err) {
		console.error(`Validation error for product slug ${slug}:`, err);
		return null;
	}
}

/** Get all categories */
export async function getCategories(): Promise<Category[]> {
	"use cache";
	cacheTag("categories");
	cacheLife("categories"); // MEDIUM refresh (Fixed from "products")

	const res = await fetch(`${STRAPI_URL}/api/categorias?populate=*`);
	if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);
	const json = await res.json();
	return CategoriesSchema.parse(json.data ?? []);
}

/** Get productos by category */
export async function getProductsByCategory(
	category: string,
): Promise<Producto[]> {
	"use cache";
	cacheTag("products", "product-list", `category-list-${category}`);
	cacheLife("products");

	const encoded = encodeURIComponent(category);
	const res = await fetch(
		`${STRAPI_URL}/api/productos?filters[categoria][nombre][$eq]=${encoded}&populate=*`,
	);
	if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);
	const json = await res.json();
	return ProductosSchema.parse(json.data ?? []);
}

/** Get site settings */
export async function getSettings(): Promise<SiteSettings | null> {
	"use cache";
	cacheTag("settings", "site-settings");
	cacheLife("settings"); // SLOW refresh (Fixed from "products")

	const query = qs.stringify(
		{
			fields: [
				"id",
				"documentId",
				"tituloHero",
				"subtituloHero",
				"direccionTienda",
				"numeroWhatsapp",
				"linkTiktok",
				"linkFacebook",
			],
			populate: {
				imagenHero: { fields: ["url", "name", "alternativeText"] },
				estadisticas: { fields: ["id", "textoArriba", "textoAbajo"] },
			},
		},
		{ encodeValuesOnly: true },
	);

	const res = await fetch(`${STRAPI_URL}/api/configuracion?${query}`);

	if (!res.ok) throw new Error(`Strapi Fetch failed: ${res.statusText}`);

	const { data } = await res.json();
	if (!data) return null;

	return SiteSettingsSchema.parse(data);
}

export async function getFooterSettings(): Promise<FooterSettings | undefined> {
	"use cache";
	cacheTag("settings", "footer-settings");
	cacheLife("settings");

	const query = qs.stringify({
		fields: ["numeroWhatsapp", "linkTiktok", "linkFacebook"],
	});
	const res = await fetch(`${STRAPI_URL}/api/configuracion?${query}`);

	console.log(`${STRAPI_URL}/api/configuracion?${query}`);
	const { data } = await res.json();

	if (!data) return undefined;

	return FooterSettingsSchema.parse(data);
}
