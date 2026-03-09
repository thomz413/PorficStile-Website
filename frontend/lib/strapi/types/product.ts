import { z } from "zod";
import { CategorySchema } from "@/lib/strapi/types/category";
import { ImageSchema } from "./shared"; // make sure this matches usage below

/* ENUMS */
export const TallaEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);
export const TipoDescuentoEnum = z.enum(["porcentaje", "fijo"]);

/* VARIANTE */
export const VarianteSchema = z.object({
	id: z.number().int().nullish(),

	sku: z.string().nullish().default(""),

	talla: TallaEnum.nullish(),

	color: z.string().nullish(),

	// If a number takes precedence over disponible
	stock: z.number().int().min(0).nullish(),
	// allow number or null

	// If true then takes precedence if stock is none
	disponible: z.boolean().default(true),

	precioSobreescribir: z.number().nullish(),
	// keep your spanish name if preferred

	enOferta: z.boolean().nullish(),
	precioOferta: z.number().nullish(),
	tipoDescuento: TipoDescuentoEnum.nullish(),
	valorDescuento: z.number().nullish(),

	fechaInicioOferta: z.string().nullish().nullable(),
	fechaFinOferta: z.string().nullish().nullable(),
});

export type Variante = z.infer<typeof VarianteSchema>;

/* PRODUCTO */
export const ProductoSchema = z.object({
	id: z.number().int(),
	documentId: z.string().nullish().default(""),
	nombre: z.string().default(""),
	descripcion: z.string().nullish().nullable().default(""),
	precio: z.number().default(0),

	enOferta: z.boolean().default(false),
	precioOferta: z.number().nullish(),
	tipoDescuento: TipoDescuentoEnum.nullish(),
	valorDescuento: z.number().nullish(),
	fechaInicioOferta: z.string().nullish(),
	fechaFinOferta: z.string().nullish(),
	mostrarPrecioOferta: z.boolean().default(true),
	textoBadgeOferta: z.string().nullish().default(""),

	disponible: z.boolean().default(true),
	cantidadStock: z.number().nullish(),

	categoria: CategorySchema.nullish(),

	// after normalization this will be a flat array of variants
	variantes: z.array(VarianteSchema).nullish().default([]),

	galeria: z.array(ImageSchema).nullish().default([]),

	imagenPrincipal: ImageSchema.nullish().nullable(),

	destacado: z.boolean().default(true),
	slug: z.string().nullish().default(""),
});

export type Producto = z.infer<typeof ProductoSchema>;

export const ProductosSchema = z.array(ProductoSchema).default([]);