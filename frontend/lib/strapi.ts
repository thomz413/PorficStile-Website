"use cache";

import { Category, CategoriesSchema } from "@/lib/strapi/types/category";
import { SiteSettingsSchema, SiteSettings } from "@/lib/strapi/types/settings";
import {
	ProductoSchema,
	Producto,
	ProductosSchema,
} from "./strapi/types/product";
import qs from "qs";
import { STRAPI_URL } from "@/lib/constants";
import { buildProductQuery } from "@/lib/utils";
import { cacheLife, cacheTag } from "next/cache";

/** Get featured productos (destacado = true) */
export async function getFeaturedProducts(): Promise<Producto[]> {
	"use cache";
	cacheTag("products", "featured-products");
	cacheLife("products");

	const qs = "filters[destacado][$eq]=true&" + buildProductQuery();
	const res = await fetch(`${STRAPI_URL}/api/productos?${qs}`);

	if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);

	const json = await res.json();
	return ProductosSchema.parse(json.data ?? []);
}

/** Get all productos */
export async function getProducts(): Promise<Producto[]> {
	"use cache";
	cacheTag("products");
	cacheLife("products");

	const qs = buildProductQuery();
	const res = await fetch(`${STRAPI_URL}/api/productos?${qs}`);

	if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);

	const json = await res.json();
	return ProductosSchema.parse(json.data ?? []);
}

/** Get product by ID */
export async function getProductById(id: string): Promise<Producto | null> {
	"use cache";
	cacheTag("products", `product-${id}`);
	cacheLife("products");

	const qs = buildProductQuery();
	console.log(`${STRAPI_URL}/api/productos/${encodeURIComponent(id)}?${qs}`);
	const res = await fetch(
		`${STRAPI_URL}/api/productos/${encodeURIComponent(id)}?${qs}`,
	);

	if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);

	const json = await res.json();
	if (!json.data) return null;

	return ProductoSchema.parse(json.data);
}

/** Get all categories */
export async function getCategories(): Promise<Category[]> {
	"use cache";
	cacheTag("categories");
	cacheLife("products");

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
	cacheTag("products", `category-${category}`);
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
	cacheTag("settings");
	cacheLife("products");

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

export async function getWhatsAppNumber(): Promise<string | undefined> {
	"use cache";
	cacheTag("settings");

	const query = qs.stringify({ fields: ["numeroWhatsapp"] });
	const res = await fetch(`${STRAPI_URL}/api/configuracion?${query}`);

	const { data } = await res.json();
	return data?.numeroWhatsapp ?? undefined;
}