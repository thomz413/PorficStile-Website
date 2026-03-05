import { z } from "zod";

export const CategorySchema = z.object({
	id: z.number().int().default(0),
	documentId: z.string().optional().nullable().default(""),
	nombre: z.string().default(""),
	descripcion: z.string().optional().nullable().default(""),
});
export type StrapiCategory = z.infer<typeof CategorySchema>;
