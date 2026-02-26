// lib/strapi.ts
import { z } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Config
 */
const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * Helpers
 */
function safeString(v: any) {
	if (v === null || v === undefined) return "";
	return String(v);
}
function safeNumber(v: any, defaultVal = 0) {
	if (v === null || v === undefined || v === "") return defaultVal;
	const n = Number(v);
	return Number.isNaN(n) ? defaultVal : n;
}
function safeBoolean(v: any) {
	return Boolean(v);
}

export function getStrapiImageUrl(path: string | undefined): string {
	if (!path) {
		return "https://placehold.co/400x400?text=No+Imagen";
	}

	if (path.startsWith("http")) {
		return path;
	}

	return `${STRAPI_URL}${path}`;
}

/**
 * Zod Schemas (normalized shapes)
 */
const CategorySchema = z.object({
	id: z.number().int().default(0),
	documentId: z.string().optional().nullable().default(""),
	nombre: z.string().default(""),
	descripcion: z.string().optional().nullable().default(""),
});
export type StrapiCategory = z.infer<typeof CategorySchema>;

const ImageSchema = z.object({
	url: z.string().url().optional().default(""),
	name: z.string().optional().default(""),
});
type ImageType = z.infer<typeof ImageSchema>;

const tallaEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);

const TallaProductoSchema = z.object({
	talla: z.preprocess(
		(v) => {
			if (typeof v !== "string") return v;
			return v.trim().toUpperCase();
		},
		tallaEnum
	),

	disponible: z
		.preprocess((v) => safeBoolean(v), z.boolean())
		.default(true),

	stock: z
		.preprocess((v) => safeNumber(v, 0), z.number().int().min(0))
		.default(0),
});

const ProductSchema = z.object({
	id: z.number().int(),
	documentId: z.string().optional().default(""),
	nombre: z.string().default(""),
	descripcion: z.string().optional().nullable().default(""),
	precio: z.preprocess((v) => safeNumber(v, 0), z.number()),
	precioDescuento: z
		.preprocess(
			(v) => (v == null ? undefined : safeNumber(v)),
			z.number().optional(),
		)
		.optional(),
	enOferta: z
		.preprocess((v) => safeBoolean(v), z.boolean())
		.optional()
		.default(false),
	porcentajeDescuento: z
		.preprocess(
			(v) => (v == null ? undefined : safeNumber(v)),
			z.number().optional(),
		)
		.optional(),
	categoria: CategorySchema.optional().default({
		id: 0,
		documentId: "",
		nombre: "",
		descripcion: "",
	}),
	tallaProducto: z.array(TallaProductoSchema).optional().default([]),
	destacado: z.preprocess((v) => safeBoolean(v), z.boolean()).default(true),
	disponible: z.preprocess((v) => safeBoolean(v), z.boolean()).default(true),
	cantidadStock: z.preprocess((v) => safeNumber(v, 0), z.number()).default(0),
	slug: z.string().optional().default(""),
	imagen: ImageSchema.default({ url: "", name: "" }),
});
export type StrapiProduct = z.infer<typeof ProductSchema>;

const StatisticSchema = z.object({
	id: z.number().int().optional().default(0),
	textoArriba: z.string().optional().default(""),
	textoAbajo: z.string().optional().default(""),
});

const SettingsSchema = z.object({
	id: z.number().int(),
	documentId: z.string().optional().default(""),
	tituloHero: z.string().optional().default(""),
	subtituloHero: z.string().optional().default(""),
	descripcionTienda: z.string().optional().default(""),
	numeroWhatsapp: z.string().optional().default(""),
	textoCTA: z.string().optional().nullable().default(""),
	imagenHero: ImageSchema.default({ url: "", name: "" }),
	estadisticas: z.array(StatisticSchema).optional().default([]),
});
export type StrapiSettings = z.infer<typeof SettingsSchema>;

/**
 * Normalizers
 *
 * Strapi can return:
 * - flattened: { id, nombre, imagen: { url, name } ... }
 * - nested: { id, attributes: { nombre, imagen: { data: { attributes: { url, name } } } } }
 * - image formats inside formats.small.url
 */
function pickImageAttr(src: any): ImageType {
	if (!src) return { url: "", name: "" };

	// possible shapes:
	// 1) src = { data: { attributes: { url, name, formats: {...} } } }
	// 2) src = { attributes: { url, name, formats: {...} } }
	// 3) src = { url: '/uploads/...', name: 'x' }
	const a = src?.data?.attributes ?? src?.attributes ?? src;

	if (!a) return { url: "", name: "" };

	// prefer formats.small.url -> formats.thumbnail.url -> url
	const formats = a.formats ?? a.formats ?? null;
	const smallUrl = formats?.small?.url ?? formats?.thumbnail?.url ?? null;

	const rawUrl = a.url ?? smallUrl ?? "";
	const finalUrl = rawUrl
		? rawUrl.startsWith("http")
			? rawUrl
			: `${STRAPI_URL}${rawUrl}`
		: "";
	const name = a.name ?? a.alternativeText ?? "";

	return { url: finalUrl, name: safeString(name) };
}

function pickCategoryAttr(src: any): StrapiCategory {
	const emptyCategory = {
		id: 0,
		documentId: "",
		nombre: "",
		descripcion: "",
	};

	if (!src) return CategorySchema.parse(emptyCategory);

	const a = src?.data?.attributes ?? src?.attributes ?? src;
	if (!a) return CategorySchema.parse(emptyCategory);

	return CategorySchema.parse({
		id: safeNumber(a.id, 0),
		documentId: safeString(a.documentId),
		nombre: safeString(a.nombre ?? a.name),
		descripcion: safeString(a.descripcion ?? ""),
	});
}

const VALID_TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];

function normalizeProductRaw(raw: any) {
	const src = raw?.attributes ?? raw;

	const img = pickImageAttr(src.imagen ?? src.imagenHero ?? src.imagen);
	const categoria = pickCategoryAttr(src.categoria);

	const tallaProducto = Array.isArray(src.tallaProducto)
		? src.tallaProducto
			.map((t: any) => {
				const talla =
					typeof t.talla === "string"
						? t.talla.trim().toUpperCase()
						: "";

				if (!VALID_TALLAS.includes(talla)) {
					console.warn("Invalid talla from Strapi:", t.talla);
					return null;
				}

				return {
					talla,
					disponible: safeBoolean(t.disponible),
					stock: safeNumber(t.stock, 0),
				};
			})
			.filter(Boolean)
		: [];

	return {
		id: safeNumber(raw.id ?? src.id, 0),
		documentId: safeString(src.documentId),
		nombre: safeString(src.nombre),
		descripcion: src.descripcion ?? "",
		precio: safeNumber(src.precio, 0),
		precioDescuento:
			src.precioDescuento == null
				? undefined
				: safeNumber(src.precioDescuento),
		enOferta: safeBoolean(src.enOferta),
		porcentajeDescuento:
			src.porcentajeDescuento == null
				? undefined
				: safeNumber(src.porcentajeDescuento),
		categoria,
		disponible: safeBoolean(src.disponible),
		cantidadStock: safeNumber(src.cantidadStock, 0),
		slug: safeString(src.slug),
		imagen: img,
		tallaProducto, // ← normalized safely
	};
}

function normalizeSettingsRaw(raw: any) {
	const src = raw?.attributes ?? raw;

	const img = pickImageAttr(src.imagenHero ?? src.imagen);
	const estadisticasRaw = src.estadisticas ?? [];
	const estadisticas = Array.isArray(estadisticasRaw)
		? estadisticasRaw.map((s: any) => {
				const a = s?.attributes ?? s;
				return {
					id: safeNumber(s?.id ?? a?.id ?? 0),
					textoArriba: safeString(a?.textoArriba),
					textoAbajo: safeString(a?.textoAbajo),
				};
			})
		: [];

	return {
		id: safeNumber(raw.id ?? src.id, 0),
		documentId: safeString(src.documentId),
		tituloHero: safeString(src.tituloHero),
		subtituloHero: safeString(src.subtituloHero),
		descripcionTienda: safeString(src.descripcionTienda),
		numeroWhatsapp: safeString(src.numeroWhatsapp),
		textoCTA: src.textoCTA ?? null,
		imagenHero: img,
		estadisticas,
	};
}

function buildProductQuery() {
	return (
		// top-level product fields
		"fields[0]=id" +
		"&fields[1]=documentId" +
		"&fields[2]=nombre" +
		"&fields[3]=descripcion" +
		"&fields[4]=precio" +
		"&fields[5]=precioDescuento" +
		"&fields[6]=enOferta" +
		"&fields[7]=porcentajeDescuento" +
		"&fields[8]=disponible" +
		"&fields[9]=cantidadStock" +
		"&fields[10]=slug" +
		"&fields[11]=destacado" +
		// imagen
		"&populate[imagen][fields][0]=url" +
		"&populate[imagen][fields][1]=name" +
		// categoria
		"&populate[categoria][fields][0]=id" +
		"&populate[categoria][fields][1]=documentId" +
		"&populate[categoria][fields][2]=nombre" +
		"&populate[categoria][fields][3]=descripcion" +
		// tallaProducto
		"&populate[tallaProducto][fields][0]=talla" +
		"&populate[tallaProducto][fields][1]=disponible" +
		"&populate[tallaProducto][fields][2]=stock"
	);
}

/** Get featured productos (destacado = true) */
export async function getFeaturedProducts(): Promise<StrapiProduct[]> {
	try {
		const qs =
			"filters[destacado][$eq]=true&" +
			buildProductQuery();

		const res = await fetch(`${STRAPI_URL}/api/productos?${qs}`, {
			next: { revalidate: 60 },
		});

		if (!res.ok) {
			throw new Error(`Strapi API error: ${res.status}`);
		}

		const json = await res.json();
		const items = json.data ?? [];

		return items.map((raw: any) => {
			const normalized = normalizeProductRaw(raw);

			return ProductSchema.parse(normalized);
		});
	} catch (err) {
		console.error("[Strapi] getFeaturedProducts error:", err);
		return [];
	}
}

/**
 * API functions (zodified)
 */

/** Get all productos */
export async function getProducts(): Promise<StrapiProduct[]> {
	try {
		const qs =
			// top-level product fields
			"fields[0]=id" +
			"&fields[1]=documentId" +
			"&fields[2]=nombre" +
			"&fields[3]=descripcion" +
			"&fields[4]=precio" +
			"&fields[5]=precioDescuento" +
			"&fields[6]=enOferta" +
			"&fields[7]=porcentajeDescuento" +
			"&fields[8]=disponible" +
			"&fields[9]=cantidadStock" +
			"&fields[10]=slug" +
			"&fields[11]=destacado" +
			// imagen (media)
			"&populate[imagen][fields][0]=url" +
			"&populate[imagen][fields][1]=name" +
			// categoria (relation)
			"&populate[categoria][fields][0]=id" +
			"&populate[categoria][fields][1]=documentId" +
			"&populate[categoria][fields][2]=nombre" +
			"&populate[categoria][fields][3]=descripcion" +
			// tallaProducto
			"&populate[tallaProducto][fields][0]=talla" +
			"&populate[tallaProducto][fields][1]=disponible" +
			"&populate[tallaProducto][fields][2]=stock";

		const res = await fetch(`${STRAPI_URL}/api/productos?${qs}`, {
			next: { revalidate: 60 },
		});

		if (!res.ok) {
			throw new Error(`Strapi API error: ${res.status}`);
		}

		const json = await res.json();
		const items = json.data ?? [];

		return items.map((raw: any) => {
			const normalized = normalizeProductRaw(raw);

			return ProductSchema.parse(normalized);
		});
	} catch (err) {
		console.error("[Strapi] getProducts error:", err);
		return [];
	}
}

/** Get product by ID */
export async function getProductById(
	id: string,
): Promise<StrapiProduct | null> {
	try {
		const qs =
			// top-level product fields
			"fields[0]=id" +
			"&fields[1]=documentId" +
			"&fields[2]=nombre" +
			"&fields[3]=descripcion" +
			"&fields[4]=precio" +
			"&fields[5]=precioDescuento" +
			"&fields[6]=enOferta" +
			"&fields[7]=porcentajeDescuento" +
			"&fields[8]=disponible" +
			"&fields[9]=cantidadStock" +
			"&fields[10]=slug" +
			"&fields[11]=destacado" +
			// imagen
			"&populate[imagen][fields][0]=url" +
			"&populate[imagen][fields][1]=name" +
			// categoria
			"&populate[categoria][fields][0]=id" +
			"&populate[categoria][fields][1]=documentId" +
			"&populate[categoria][fields][2]=nombre" +
			"&populate[categoria][fields][3]=descripcion" +
			// tallaProducto
			"&populate[tallaProducto][fields][0]=talla" +
			"&populate[tallaProducto][fields][1]=disponible" +
			"&populate[tallaProducto][fields][2]=stock";

		const res = await fetch(
			`${STRAPI_URL}/api/productos/${encodeURIComponent(id)}?${qs}`,
			{ next: { revalidate: 60 } },
		);

		if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);

		const json = await res.json();
		const item = json.data ?? null;
		if (!item) return null;

		const normalized = normalizeProductRaw(item);
		return ProductSchema.parse(normalized);
	} catch (err) {
		console.error("[Strapi] getProductById error:", err);
		return null;
	}
}

/** Get all categories */
export async function getCategories(): Promise<StrapiCategory[]> {
	try {
		const res = await fetch(`${STRAPI_URL}/api/categorias?populate=*`, {
			next: { revalidate: 60 },
		});
		if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);
		const json = await res.json();
		const items = json.data ?? [];
		return items.map((raw: any) => {
			const attr = raw?.attributes ?? raw;
			const c = {
				id: safeNumber(raw.id ?? attr.id, 0),
				documentId: safeString(attr.documentId),
				nombre: safeString(attr.nombre),
				descripcion: safeString(attr.descripcion),
			};
			return CategorySchema.parse(c);
		});
	} catch (err) {
		console.error("[Strapi] getCategories error:", err);
		return [];
	}
}

/** Get productos by category (expects `category` to be the category slug or name depending on your Strapi filters) */
export async function getProductsByCategory(
	category: string,
): Promise<StrapiProduct[]> {
	try {
		const encoded = encodeURIComponent(category);
		// NOTE: adjust filter key according to your Strapi field name (categoria vs category)
		const res = await fetch(
			`${STRAPI_URL}/api/productos?filters[categoria][nombre][$eq]=${encoded}&populate=*`,
			{ next: { revalidate: 60 } },
		);
		if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);
		const json = await res.json();
		const items = json.data ?? [];
		return items.map((raw: any) => {
			const normalized = normalizeProductRaw(raw);
			return ProductSchema.parse(normalized);
		});
	} catch (err) {
		console.error("[Strapi] getProductsByCategory error:", err);
		return [];
	}
}

/** Get site settings */
export async function getSettings(): Promise<StrapiSettings | null> {
	try {
		// only request top-level fields we use + minimal populate for imagenHero and estadisticas
		const qs =
			"fields[0]=id" +
			"&fields[1]=documentId" +
			"&fields[2]=tituloHero" +
			"&fields[3]=subtituloHero" +
			"&fields[4]=descripcionTienda" +
			"&fields[5]=numeroWhatsapp" +
			"&fields[6]=textoCTA" +
			// populate imagenHero but only its 'url' and 'name' fields
			"&populate[imagenHero][fields][0]=url&populate[imagenHero][fields][1]=name" +
			// populate estadisticas (relation/component) — you can narrow fields further if needed
			"&populate[estadisticas]=*";

		const res = await fetch(`${STRAPI_URL}/api/configuracion?${qs}`, {
			next: { revalidate: 60 },
		});
		if (!res.ok) {
			return null;
		}
		const json = await res.json();
		const raw = json.data ?? null;
		if (!raw) return null;
		const normalized = normalizeSettingsRaw(raw);
		return SettingsSchema.parse(normalized);
	} catch (err) {
		console.error("[Strapi] getSettings error:", err);
		return null;
	}
}
