import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const secret = searchParams.get("secret");

	if (secret !== REVALIDATE_SECRET) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const model = body.model; // Strapi model name
		const entry = body.entry; // The actual data

		console.log(`Revalidating ${model} for entry: ${entry?.documentId || 'unknown'}`);

		// --- 1. PRODUCT REVALIDATION ---
		if (model === "producto") {
			// Clear general lists (Featured, All, Category lists)
			revalidateTag("products", "max");
			revalidateTag("product-list", "max");

			if (entry?.slug) {
				revalidateTag(`product-${entry.slug}`, "max");
			}
		}

		// --- 2. CATEGORY REVALIDATION ---
		else if (model === "categoria") {
			revalidateTag("categories", "max");
			// Categories affect product lists, so we clear them too
			revalidateTag("products", "max");
			revalidateTag("product-list", "max");
		}

		// --- 3. SETTINGS REVALIDATION ---
		else if (model === "configuracion") {
			revalidateTag("settings", "max");
			revalidateTag("site-settings", "max");
			revalidateTag("footer-settings", "max");
		}

		return NextResponse.json({ revalidated: true, now: Date.now() });

	} catch (err) {
		// Fallback: Clear core tags if something goes wrong
		revalidateTag("products", "max");
		revalidateTag("settings", "max");
		return NextResponse.json({ message: "Fallback Revalidation Triggered" }, { status: 200 });
	}
}