import { z } from "zod";
import { ImageSchema } from "@/lib/strapi/types/shared";

export const StatisticSchema = z.object({
	documentId: z.string().nullish(),
	textoArriba: z.string().nullish().default(""),
	textoAbajo: z.string().nullish().default(""),
});

export type Statistic = z.infer<typeof StatisticSchema>;

export const SiteSettingsSchema = z.object({
	tituloHero: z.string().nullish().default(""),
	subtituloHero: z.string().nullish().default(""),
	numeroWhatsapp: z.string().nullish().default(""),
	imagenHero: ImageSchema.nullish().default({
		url: "",
		name: "",
		alternativeText: "",
	}),
	estadisticas: z.array(StatisticSchema).optional().default([]),
	direccionTienda: z.string().nullish().default(""),
	linkTiktok: z.string().nullish().default(""),
	linkFacebook: z.string().nullish().default(""),
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

export const FooterSettingsSchema = SiteSettingsSchema.pick({
	linkFacebook: true,
	linkTiktok: true,
	numeroWhatsapp: true,
});

export type FooterSettings = z.infer<typeof FooterSettingsSchema>;
