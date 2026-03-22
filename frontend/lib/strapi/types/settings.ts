import { z } from "zod";
import { ImageSchema } from "@/lib/strapi/types/shared";

export const StatisticSchema = z.object({
	id: z.number().int().optional().default(0),
	textoArriba: z.string().optional().default(""),
	textoAbajo: z.string().optional().default(""),
});

export type Statistic = z.infer<typeof StatisticSchema>;

export const SiteSettingsSchema = z.object({
	id: z.number().int(),
	documentId: z.string().optional().default(""),
	tituloHero: z.string().optional().default(""),
	subtituloHero: z.string().optional().default(""),
	descripcionTienda: z.string().nullable().default(""),
	numeroWhatsapp: z.string().optional().default(""),
	textoCTA: z.string().optional().nullable().default(""),
	imagenHero: ImageSchema.default({ url: "", name: "", alternativeText: "" }),
	estadisticas: z.array(StatisticSchema).optional().default([]),
	direccionTienda: z.string().optional().default(""),
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
