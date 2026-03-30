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
			const errorMessage = error instanceof Error 
				? `${error.name}: ${error.message}\n\nStack:\n${error.stack}` 
				: String(error);

			return (
				<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", backgroundColor: "#fef2f2" }}>
					<div style={{ width: "100%", maxWidth: "48rem", backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
						<h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc2626", marginBottom: "1rem" }}>
							Server Error in Production (Debug)
						</h1>
						<p style={{ color: "#4b5563", marginBottom: "1rem" }}>
							Failed to load data for product: <strong>{slug}</strong>
						</p>
						<div style={{ backgroundColor: "#f3f4f6", padding: "1rem", borderRadius: "0.25rem", overflow: "auto", maxHeight: "60vh" }}>
							<pre style={{ fontSize: "0.875rem", color: "#1f2937", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
								{errorMessage}
							</pre>
						</div>
					</div>
				</div>
			);
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
