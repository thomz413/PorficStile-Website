import { z } from "zod";
import { CategorySchema } from "@/lib/strapi/types/category";
import { ImageSchema } from "./shared"; // make sure this matches usage below

/* ENUMS */
export const TallaEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);
export const TipoDescuentoEnum = z.enum(["porcentaje", "fijo"]);

/* VARIANTE */
export const VarianteSchema = z.object({
	id: z.number().int().optional(),

	sku: z.string().optional().default(""),

	talla: TallaEnum.optional().nullable(),

	color: z.string().optional(),

	// If a number takes precedence over disponible
	stock: z.union([z.number().int().min(0), z.null()]).optional(),
	// allow number or null

	// If true then takes precedence if stock is none
	disponible: z.boolean().default(true),

	precioSobreescribir: z.number().optional(),
	// keep your spanish name if preferred

	enOferta: z.boolean().optional(),
	precioOferta: z.number().optional(),
	tipoDescuento: TipoDescuentoEnum.optional(),
	valorDescuento: z.number().optional(),

	fechaInicioOferta: z.string().optional().nullable(),
	fechaFinOferta: z.string().optional().nullable(),
});

export type Variante = z.infer<typeof VarianteSchema>;

/* PRODUCTO */
export const ProductoSchema = z.object({
	id: z.number().int(),
	documentId: z.string().optional().default(""),
	nombre: z.string().default(""),
	descripcion: z.string().optional().nullable().default(""),
	precio: z.number().default(0),

	enOferta: z.boolean().default(false),
	precioOferta: z.number().optional(),
	tipoDescuento: TipoDescuentoEnum.optional(),
	valorDescuento: z.number().optional(),
	fechaInicioOferta: z.string().optional().nullable(),
	fechaFinOferta: z.string().optional().nullable(),
	mostrarPrecioOferta: z.boolean().default(true),
	textoBadgeOferta: z.string().optional().default(""),

	disponible: z.boolean().default(true),
	cantidadStock: z.number().optional(),

	categoria: CategorySchema.optional(),

	// after normalization this will be a flat array of variants
	variantes: z.array(VarianteSchema).optional().default([]),

	galeria: z.array(ImageSchema).optional().default([]),

	imagenPrincipal: ImageSchema.optional().nullable(),

	destacado: z.boolean().default(true),
	slug: z.string().optional().default(""),
});

export type Producto = z.infer<typeof ProductoSchema>;
