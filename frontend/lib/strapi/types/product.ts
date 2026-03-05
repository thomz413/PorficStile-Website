import { z } from "zod";
import { CategorySchema } from "@/lib/strapi/types/category";
import { ImageSchema } from "./shared";

/* =========================================================
   ENUMERACIONES
   ========================================================= */

export const TallaEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);
// Tallas permitidas del producto

export const TipoDescuentoEnum = z.enum(["porcentaje", "fijo"]);
// Tipo de descuento:
// - percentage → descuento porcentual (ej: 20%)
// - fixed → monto fijo (ej: 15 soles)

/* =========================================================
   VARIANTE (Unidad vendible real)
   ========================================================= */

export const VarianteSchema = z.object({
	id: z.number().int().optional(),
	// ID interno de Strapi

	sku: z.string().optional().default(""),
	// Código interno único para inventario (Stock Keeping Unit)

	talla: TallaEnum.optional(),
	// Talla específica de esta variante

	color: z.string().optional(),
	// Color de esta variante
	// Puede ayudar a manejar

	stock: z.number().int().min(0).nullable().optional(),
	// Cantidad disponible en inventario
	// null → no se controla stock
	// 0 → sin stock
	// >0 → unidades disponibles

	disponible: z.boolean().default(true),
	// Control manual de disponibilidad
	// Útil cuando no se maneja stock

	precioSobreescribir: z.number().optional(),
	// Permite que esta variante tenga un precio diferente al producto base

	imagenes: z.array(ImagenProductoSchema).optional().default([]),
	// Imágenes específicas de esta variante
	// Reemplazan la galería del producto al seleccionarla

	enOferta: z.boolean().optional(),
	// Indica si esta variante tiene descuento propio

	precioOferta: z.number().optional(),
	// Precio por la oferta

	tipoDescuento: TipoDescuentoEnum.optional(),
	// Tipo de descuento aplicado a la variante

	valorDescuento: z.number().optional(),
	// Valor del descuento (porcentaje o monto fijo)

	fechaInicioOferta: z.string().optional(),
	// Fecha de inicio de la promoción (ISO string)

	fechaFinOferta: z.string().optional(),
	// Fecha de fin de la promoción (ISO string)
});

export type Variante = z.infer<typeof VarianteSchema>;

/* =========================================================
   PRODUCTO PRINCIPAL
   ========================================================= */
// Fields repeating on childs must override parent ones, and parent fields repeating should

export const ProductoSchema = z.object({
	id: z.number().int(),
	// ID del producto en Strapi

	documentId: z.string().optional().default(""),
	// ID interno adicional de Strapi (si lo usas)

	nombre: z.string().default(""),
	// Nombre del producto

	descripcion: z.string().optional().nullable().default(""),
	// Descripción detallada (puede venir null desde Strapi)

	precio: z.number().default(0),
	// Precio base del producto

	/* ----------- DESCUENTO A NIVEL PRODUCTO ----------- */

	enOferta: z.boolean().default(false),
	// Indica si el producto tiene descuento general

	precioOferta: z.number().optional(),
	// Precio por la oferta

	tipoDescuento: TipoDescuentoEnum.optional(),
	// Tipo de descuento aplicado al producto

	valorDescuento: z.number().optional(),
	// Valor del descuento (porcentaje o monto fijo)

	fechaInicioOferta: z.string().optional(),
	// Fecha de inicio del descuento

	fechaFinOferta: z.string().optional(),
	// Fecha de fin del descuento

	mostrarPrecioOferta: z.boolean().default(true),
	// Define si se debe mostrar el precio original tachado en UI

	textoBadgeOferta: z.string().optional().default(""),
	// Texto opcional para mostrar en una etiqueta (ej: "SALE", "-30%")

	/* ----------- CONTROL DE INVENTARIO ----------- */
	disponible: z.boolean().default(true),
	// Disponibilidad general del producto
	// Útil si no se usan variantes, se sobrepone sobre los otros de lo mismo

	cantidadStock: z.number().default(0),
	// Stock global (solo útil si no se usan variantes)

	/* ----------- RELACIONES Y MEDIA ----------- */

	categoria: CategorySchema.optional(),
	// Categoría a la que pertenece el producto

	variantes: z.array(VarianteSchema).optional().default([]),
	// Lista de combinaciones vendibles (talla + color)

	galeria: z.array(ImageSchema).optional().default([]),
	// Imágenes generales del producto

   imagenPrincipal: ImageSchema.optional(),

	destacado: z.boolean().default(true),
	// Indica si el producto es destacado en la tienda, esto para mostrar en la pagina inicial

	slug: z.string().optional().default(""),
	// URL amigable del producto
});

export type Producto = z.infer<typeof ProductoSchema>;
