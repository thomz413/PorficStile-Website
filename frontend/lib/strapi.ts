import { CategorySchema, StrapiCategory } from "@/lib/strapi/types/category";
import { SettingsSchema, StrapiSettings } from "@/lib/strapi/types/settings";
import { ImageSchema, ImageType } from "./strapi/types/shared";
import { Producto, ProductoSchema } from "./strapi/types/product";

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
 * Normalizers
 *
 * Strapi can return:
 * - flattened: { id, nombre, imagen: { url, name } ... }
 * - nested: { id, attributes: { nombre, imagen: { data: { attributes: { url, name } } } } }
 * - image formats inside formats.small.url
 *
 * We request only necessary fields (url + name) for images, and minimal fields for variantes.
 */

/**
 * Convert any Strapi image shape into your ImageType:
 * { url: string, name: string }
 */
function pickImageAttr(src: any): ImageType {
  if (!src) return ImageSchema.parse({ url: "", name: "" });

  // possible shapes:
  // 1) src = { data: { attributes: { url, name, formats: {...} } } }
  // 2) src = { attributes: { url, name, formats: {...} } }
  // 3) src = { url: '/uploads/...', name: 'x' }
  const a = src?.data?.attributes ?? src?.attributes ?? src;

  if (!a) return ImageSchema.parse({ url: "", name: "" });

  // prefer formats.small.url -> formats.thumbnail.url -> url
  const formats = a.formats ?? null;
  const smallUrl = formats?.small?.url ?? formats?.thumbnail?.url ?? null;

  const rawUrl = a.url ?? smallUrl ?? "";
  const finalUrl = rawUrl ? (rawUrl.startsWith("http") ? rawUrl : `${STRAPI_URL}${rawUrl}`) : "";
  const name = a.name ?? a.alternativeText ?? "";

  return ImageSchema.parse({
    url: finalUrl ? finalUrl : "",
    name: safeString(name),
  });
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
    id: safeNumber(src?.data?.id ?? src?.id ?? a?.id ?? 0),
    documentId: safeString(a.documentId),
    nombre: safeString(a.nombre ?? a.name),
    descripcion: safeString(a.descripcion ?? ""),
  });
}

const VALID_TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];

function normalizeVariantRaw(rawVar: any) {
  // rawVar may be in shapes:
  // - { id, attributes: { ... } }
  // - { ... } flattened
  const v = rawVar?.attributes ? { id: rawVar.id, ...rawVar.attributes } : rawVar;

  const imagenesRaw = v.imagenes?.data ?? v.imagenes ?? [];
  const imagenes = Array.isArray(imagenesRaw) ? imagenesRaw.map(pickImageAttr) : [];

  return {
    id: safeNumber(v.id, 0),
    sku: safeString(v.sku),
    talla: typeof v.talla === "string" ? v.talla : null,
    color: safeString(v.color),
    stock: v.stock == null ? null : safeNumber(v.stock, 0),
    disponible: safeBoolean(v.disponible ?? true),
    precioSobreescribir: v.precioSobreescribir ?? v.precioOverride ?? undefined,
    imagenes,
    enOferta: safeBoolean(v.enOferta ?? false),
    precioOferta: v.precioOferta == null ? undefined : safeNumber(v.precioOferta),
    tipoDescuento: v.tipoDescuento ?? undefined,
    valorDescuento: v.valorDescuento == null ? undefined : safeNumber(v.valorDescuento),
    fechaInicioOferta: v.fechaInicioOferta ?? null,
    fechaFinOferta: v.fechaFinOferta ?? null,
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

function normalizeProductRaw(raw: any) {
  const src = raw?.attributes ?? raw;

  // main product image (if you use imagen or imagenHero)
  const img = pickImageAttr(src.imagen ?? src.imagenHero ?? src.imagenPrincipal ?? null);
  const categoria = pickCategoryAttr(src.categoria);

  const tallaProducto = Array.isArray(src.tallaProducto)
    ? src.tallaProducto
        .map((t: any) => {
          const talla =
            typeof t.talla === "string" ? t.talla.trim().toUpperCase() : "";

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

  // variantes: normalized from relation shape (data/attributes) or flattened
  const variantesRaw = src.variantes?.data ?? src.variantes ?? [];
  const variantes = Array.isArray(variantesRaw)
    ? variantesRaw.map(normalizeVariantRaw)
    : [];

  // galeria: array of media
  const galeriaRaw = src.galeria?.data ?? src.galeria ?? [];
  const galeria = Array.isArray(galeriaRaw) ? galeriaRaw.map(pickImageAttr) : [];

  return {
    id: safeNumber(raw.id ?? src.id, 0),
    documentId: safeString(src.documentId),
    nombre: safeString(src.nombre),
    descripcion: src.descripcion ?? "",
    precio: safeNumber(src.precio, 0),
    precioDescuento:
      src.precioDescuento == null ? undefined : safeNumber(src.precioDescuento),
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
    galeria,
    variantes,
    tallaProducto, // ← normalized safely
    destacado: safeBoolean(src.destacado ?? true),
  };
}

/**
 * Build product query string that requests only necessary fields and populates
 * the minimal nested data for imagen / galeria / categoria / variantes.imagenes
 */
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
    // imagen (media) - only need url + name
    "&populate[imagen][fields][0]=url" +
    "&populate[imagen][fields][1]=name" +
    // galeria (multiple media) - only url + name
    "&populate[galeria][fields][0]=url" +
    "&populate[galeria][fields][1]=name" +
    // categoria (relation) - only the fields we need
    "&populate[categoria][fields][0]=id" +
    "&populate[categoria][fields][1]=documentId" +
    "&populate[categoria][fields][2]=nombre" +
    "&populate[categoria][fields][3]=descripcion" +
    // variantes (relation) - include variant fields and populate only imagenes (url + name)
    "&populate[variantes][fields][0]=id" +
    "&populate[variantes][fields][1]=sku" +
    "&populate[variantes][fields][2]=talla" +
    "&populate[variantes][fields][3]=color" +
    "&populate[variantes][fields][4]=stock" +
    "&populate[variantes][fields][5]=disponible" +
    "&populate[variantes][fields][6]=precioSobreescribir" +
    "&populate[variantes][fields][7]=enOferta" +
    "&populate[variantes][fields][8]=precioOferta" +
    "&populate[variantes][fields][9]=tipoDescuento" +
    "&populate[variantes][fields][10]=valorDescuento" +
    "&populate[variantes][fields][11]=fechaInicioOferta" +
    "&populate[variantes][fields][12]=fechaFinOferta" +
    // populate variant images (only url + name)
    "&populate[variantes][populate][imagenes][fields][0]=url" +
    "&populate[variantes][populate][imagenes][fields][1]=name"
  );
}

/** Get featured productos (destacado = true) */
export async function getFeaturedProducts(): Promise<Producto[]> {
  try {
    const qs = "filters[destacado][$eq]=true&" + buildProductQuery();

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
      return ProductoSchema.parse(normalized);
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
export async function getProducts(): Promise<Producto[]> {
  try {
    const qs = buildProductQuery();

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
      return ProductoSchema.parse(normalized);
    });
  } catch (err) {
    console.error("[Strapi] getProducts error:", err);
    return [];
  }
}

/** Get product by ID */
export async function getProductById(
  id: string,
): Promise<Producto | null> {
  try {
    const qs = buildProductQuery();

    const res = await fetch(
      `${STRAPI_URL}/api/productos/${encodeURIComponent(id)}?${qs}`,
      { next: { revalidate: 60 } },
    );

    if (!res.ok) throw new Error(`Strapi API error: ${res.status}`);

    const json = await res.json();
    const item = json.data ?? null;
    if (!item) return null;

    const normalized = normalizeProductRaw(item);
    return ProductoSchema.parse(normalized);
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
): Promise<Producto[]> {
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
      return ProductoSchema.parse(normalized);
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