import { notFound } from "next/navigation";
import ProductDetailClient from "@/app/productos/[slug]/ProductDetailContent";
import { getFooterSettings, getProductBySlug } from "@/lib/strapi";
import { fetchWithRetry } from "@/lib/utils";

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	let product;
	let footerSettings;

	try {
		[product, footerSettings] = await Promise.all([
			fetchWithRetry(() => getProductBySlug(slug)),
			fetchWithRetry(() => getFooterSettings()),
		]);

		if (!product) {
			notFound();
		}
	} catch (error) {
		console.error(`Failed to load data for product ${slug}:`, error);
		notFound();
	}

	return (
		<ProductDetailClient
			key={slug}
			product={product}
			footerSettings={footerSettings}
		/>
	);
}
