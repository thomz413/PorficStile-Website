import { notFound } from "next/navigation";
import ProductDetailClient from "@/app/productos/[slug]/ProductDetailContent";
import { getFooterSettings, getProductBySlug } from "@/lib/strapi";

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
			getProductBySlug(slug),
			getFooterSettings(),
		]);

		if (!product) {
			console.log(`Product not found for slug: ${slug}`);
			notFound();
		}
	} catch (error) {
		console.error(`Failed to load data for product ${slug}:`, error);
		// Graceful fallback - show 404 instead of throwing
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
