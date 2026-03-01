// lib/whatsapp.ts
export interface WhatsAppMessageConfig {
	type: "product_order" | "general_question" | "custom_order";
	productName?: string;
	productPrice?: number;
	currency?: string;
	size?: string;
	quantity?: number;
	category?: string;
	customNote?: string;
}

export interface ProductInfo {
	nombre: string;
	precio?: number;
	categoria?: string;
	enOferta?: boolean;
	precioDescuento?: number;
	porcentajeDescuento?: number;
	descripcion?: string;
}

export function generateWhatsAppMessage(config: WhatsAppMessageConfig): string {
	const {
		type,
		productName,
		productPrice,
		currency,
		size,
		quantity,
		category,
		customNote,
	} = config;

	let message = "";

	switch (type) {
		case "product_order":
			message = `🛒 ¡Hola! Quiero comprar:

📦 ${productName}
${productPrice ? `💰 ${currency || "S/."} ${productPrice.toFixed(2)}` : ""}
${size ? `📏 Talla: ${size}` : ""}
${quantity ? `🔢 Cantidad: ${quantity}` : ""}

${customNote ? `📝 Nota: ${customNote}` : ""}

¿Hay stock y cómo puedo pagar?`;
			break;

		case "custom_order":
			message = `🎨 ¡Hola! Quiero un pedido personalizado:

${productName ? `📦 Basado en: ${productName}` : "🎨 Producto personalizado"}
${size ? `📏 Talla: ${size}` : ""}
${quantity ? `🔢 Cantidad: ${quantity}` : ""}

${customNote ? `✏️ Detalles: ${customNote}` : "✏️ Cuéntame qué necesitas..."}

¿Pueden hacerlo y cuál sería el precio?`;
			break;

		case "general_question":
		default:
			message = `👋 ¡Hola! 

${productName ? `📦 Vi el producto: ${productName}` : "📦 Estoy viendo sus productos"}

${customNote ? `❓ ${customNote}` : "❓ Tengo una pregunta sobre los productos..."}

¿Me pueden ayudar?`;
			break;
	}

	return message;
}

// Helper function for multi-size orders
export function createMultiSizeOrderMessage(
	product: ProductInfo,
	sizeSelections: { [size: string]: number },
	customNote?: string,
): string {
	const totalQuantity = Object.values(sizeSelections).reduce(
		(sum, qty) => sum + qty,
		0,
	);
	const sizeDetails = Object.entries(sizeSelections)
		.filter(([_, qty]) => qty > 0)
		.map(([size, qty]) => `${qty}x talla ${size}`)
		.join("\n");

	const config: WhatsAppMessageConfig = {
		type: "product_order",
		productName: product.nombre,
		productPrice:
			product.enOferta && product.precioDescuento
				? product.precioDescuento
				: product.precio,
		currency: "PEN",
		category: product.categoria,
		quantity: totalQuantity,
		size: sizeDetails,
		customNote: customNote || `Pedido múltiple:\n${sizeDetails}`,
	};

	return generateWhatsAppMessage(config);
}

// Helper function for product orders (most common use case)
export function createProductOrderMessage(
	product: ProductInfo,
	quantity: number = 1,
	size?: string,
	customNote?: string,
): string {
	const config: WhatsAppMessageConfig = {
		type: "product_order",
		productName: product.nombre,
		productPrice:
			product.enOferta && product.precioDescuento
				? product.precioDescuento
				: product.precio,
		currency: "PEN",
		category: product.categoria,
		quantity,
		size,
		customNote,
	};

	return generateWhatsAppMessage(config);
}

// Helper for general questions
export function createGeneralQuestionMessage(
	productName?: string,
	question?: string,
): string {
	const config: WhatsAppMessageConfig = {
		type: "general_question",
		productName,
		customNote: question,
	};

	return generateWhatsAppMessage(config);
}

// Helper for custom orders
export function createCustomOrderMessage(
	productName?: string,
	quantity?: number,
	details?: string,
): string {
	const config: WhatsAppMessageConfig = {
		type: "custom_order",
		productName,
		quantity,
		customNote: details,
	};

	return generateWhatsAppMessage(config);
}
