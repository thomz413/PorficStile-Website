import { notFound } from "next/navigation";
import ErrorBoundary from "@/app/productos/[slug]/error-boundary";
import ProductDetailClientWithRetry from "@/app/productos/[slug]/ProductDetailClientWithRetry";
import { getFooterSettings, getProductBySlug } from "@/lib/strapi";

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	let product;
	let footerSettings;
	let isColdStart = false;

	try {
		// Attempt to fetch data; timeouts will throw AbortError or fetch failed within Netlify limit
		[product, footerSettings] = await Promise.all([
			getProductBySlug(slug),
			getFooterSettings(),
		]);
	} catch (error) {
		console.error(`Failed to load data for product ${slug}:`, error);
		
		// Detect cold-start timeout drops
		if (error instanceof Error && (
			error.name === 'AbortError' || 
			error.message.includes('timeout') ||
			error.message.includes('fetch failed') ||
			error.message.includes('AbortSignal')
		)) {
			console.log(`Cold start detected for product ${slug}, delegating to client`);
			isColdStart = true;
		} else {
			// Real errors should hit the error boundary
			throw error;
		}
	}

	// If Strapi was asleep and the timeout was hit, render fallback to let client handle waking it up
	if (isColdStart) {
		return (
			<ErrorBoundary>
				<ProductDetailClientWithRetry
					product={null}
					footerSettings={null}
				/>
			</ErrorBoundary>
		);
	}

	if (!product) {
		console.log(`Product not found for slug: ${slug}`);
		notFound();
	}

	return (
		<ErrorBoundary>
			<ProductDetailClientWithRetry
				product={product}
				footerSettings={footerSettings}
			/>
		</ErrorBoundary>
	);
}
