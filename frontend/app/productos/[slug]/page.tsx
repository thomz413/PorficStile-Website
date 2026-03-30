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
			notFound();
		}
	} catch (error) {
		console.error(`Failed to load data for product ${slug}:`, error);
		// Let the error boundary (error.tsx) handle it instead of forcing a 404
		throw error;
	}

	return (
		<ProductDetailClient
			key={slug}
			product={product}
			footerSettings={footerSettings}
		/>
	);
}
