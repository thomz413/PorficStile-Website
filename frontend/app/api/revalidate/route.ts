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
		const model = body.model; // e.g., 'producto', 'categoria', or 'configuracion'
		const entry = body.entry; // The actual data that changed
		console.log("The actual Data from Strapi:", JSON.stringify(body, null, 2));
		console.log(`Strapi Webhook received for model: ${model}`);

		// 2. Surgical Revalidation Logic
		if (model === "producto") {
			// Clear the general list AND the specific product detail
			revalidateTag("products", "max");
			if (entry?.documentId) {
				revalidateTag(`product-${entry.documentId}`, "max");
			}
		} else if (model === "categoria") {
			// Categories affect the category list AND the products within them
			revalidateTag("categories", "max");
			revalidateTag("products", "max");
		} else if (model === "configuracion") {
			// Only clear the settings/footer
			revalidateTag("settings", "max");
		}

		return NextResponse.json({
			revalidated: true,
			model,
			now: Date.now(),
		});
	} catch (err) {
		// If the body is empty or malformed, just clear everything as a safety fallback
		revalidateTag("products", "max");
		revalidateTag("settings", "max");
		return NextResponse.json(
			{ message: "Revalidated All (Fallback)" },
			{ status: 200 },
		);
	}
}
