import { z } from "zod";

export const ImageSchema = z.object({
	url: z.url().optional().default(""),
	name: z.string().optional().default(""),
});
export type ImageType = z.infer<typeof ImageSchema>;
