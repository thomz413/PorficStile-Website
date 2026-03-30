import { z } from "zod";
import { CategorySchema } from "@/lib/strapi/types/category";
import { ImageSchema } from "./shared";

/* ENUMS */
export const TallaEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);
export const TipoDescuentoEnum = z.enum(["porcentaje", "fijo"]);

/* VARIANTE */
export const VarianteSchema = z.object({
	talla: TallaEnum.nullish(),

	color: z.string().nullish(),

	// If a number takes precedence over disponible
	stock: z.number().int().min(0).nullish(),
	// allow number or null

	// If true then takes precedence if stock is none
	disponible: z.boolean().nullish().default(true),

	precioSobreescribir: z.number().nullish(),

	// Oferta
	precioOferta: z.number().nullish(),
	tipoDescuento: TipoDescuentoEnum.nullish(),
	valorDescuento: z.number().nullish(),

	fechaInicioOferta: z.string().nullish(),
	fechaFinOferta: z.string().nullish(),
});

export type Variante = z.infer<typeof VarianteSchema>;

/* PRODUCTO */
export const ProductoSchema = z.object({
	documentId: z.string().nullish(),
	nombre: z.string().default(""),
	descripcion: z.string().nullish().nullable().default(""),
	precio: z.number().default(0),

	// Oferta
	precioOferta: z.number().nullish(),

	tipoDescuento: TipoDescuentoEnum.nullish(),
	valorDescuento: z.number().nullish(),

	fechaInicioOferta: z.string().nullish(),
	fechaFinOferta: z.string().nullish(),

	textoBadgeOferta: z.string().nullish().default(""),

	disponible: z.boolean().default(true),
	cantidadStock: z.number().nullish(),

	categoria: CategorySchema.nullish(),

	// after normalization this will be a flat array of variants
	variantes: z.array(z.any()).nullish().transform((arr) => {
		if (!arr) return [];
		return z.array(VarianteSchema).parse(arr.filter((item) => item !== null && item !== undefined));
	}).default([]),

	galeria: z.array(z.any()).nullish().transform((arr) => {
		if (!arr) return [];
		return z.array(ImageSchema).parse(arr.filter((item) => item !== null && item !== undefined));
	}).default([]),

	imagenPrincipal: ImageSchema.nullish().nullable(),

	destacado: z.boolean().nullish().default(true),
	slug: z.string().nullish().default(""),
});

export type Producto = z.infer<typeof ProductoSchema>;

export const ProductosSchema = z.array(ProductoSchema).default([]);
