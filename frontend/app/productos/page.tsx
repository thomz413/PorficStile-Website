import { Suspense } from "react";
import FooterWrapper from "@/components/footer/FooterWrapper";
import Header from "@/components/Header";
import { getCategories, getProducts, getSettings } from "@/lib/strapi";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
	// Fetch initial data on the server for better SEO/Speed
	const [products, categories, settings] = await Promise.all([
		getProducts(),
		getCategories(),
		getSettings(),
	]);

	return (
		<main className="min-h-screen bg-background pt-16">
			<Header whatsappNumber={settings?.numeroWhatsapp} />

			{/* All the interactive stuff goes here */}
			<ProductsClient
				products={products}
				categories={categories}
				settings={settings || undefined}
			/>

			{/* Now you can use FooterWrapper safely as a Server Component sibling */}
			<Suspense fallback={<div className="h-64 bg-muted animate-pulse" />}>
				<FooterWrapper />
			</Suspense>
		</main>
	);
}
