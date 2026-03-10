import { z } from "zod";

export const CategorySchema = z.object({
	id: z.number().int().default(0),
	documentId: z.string().nullish().default(""),
	nombre: z.string().nullish().default(""),
	descripcion: z.string().nullish().default(""),
});
export type Category = z.infer<typeof CategorySchema>;

export const CategoriesSchema = z.array(CategorySchema);
