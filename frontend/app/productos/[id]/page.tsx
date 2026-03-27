import { notFound } from "next/navigation";
import ProductDetailClient from "@/app/productos/[id]/ProductDetailContent";
import { getProductById, getSettings } from "@/lib/strapi";

async function fetchWithRetry<T>(
	fn: () => Promise<T>,
	retries = 3,
	delay = 500
): Promise<T> {
	try {
		return await fn();
	} catch (err) {
		if (retries <= 0) throw err;
		await new Promise((res) => setTimeout(res, delay));
		return fetchWithRetry(fn, retries - 1, delay * 2);
	}
}

export default async function ProductPage({
											  params,
										  }: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	let product;
	let settings;

	try {
		[product, settings] = await Promise.all([
			fetchWithRetry(() => getProductById(id)),
			fetchWithRetry(() => getSettings()),
		]);

		if (!product) {
			notFound();
		}
	} catch (error) {
		console.error(`🔥 Failed to load data for product ${id}:`, error);
		notFound();
	}

	return (
		<ProductDetailClient
			key={id}
			product={product}
			settings={settings}
		/>
	);
}