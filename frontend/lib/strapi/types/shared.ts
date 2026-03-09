import { z } from "zod";
import { STRAPI_URL } from "@/lib/constants";

export const ImageSchema = z.object({
	url: z
		.string()
		.nullish()
		.transform((val) => {
			if (!val) return "";
			// If it's already an absolute URL (e.g. hosted on S3/Cloudinary), return it
			if (val.startsWith("http://") || val.startsWith("https://")) {
				return val;
			}
			// Otherwise, prepend the Strapi URL
			return `${STRAPI_URL}${val}`;
		}),
	name: z
		.string()
		.nullish()
		.transform((v) => v ?? ""),
	alternativeText: z
		.string()
		.nullish()
		.transform((v) => v ?? ""),
});

export type ImageType = z.infer<typeof ImageSchema>;
