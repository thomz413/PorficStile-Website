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
		currency = "S/.", // Default to Soles
		size,
		quantity,
		customNote,
	} = config;

	// We use an array to build the message line by line.
	// This prevents awkward blank lines if a property is undefined.
	const messageLines: string[] = [];

	// Helper to format price
	const formatPrice = (price: number) => `${currency} ${price.toFixed(2)}`;

	switch (type) {
		case "product_order":
			messageLines.push("¡Hola! Me gustaría realizar una compra.");
			messageLines.push(""); // Empty string creates a blank line

			if (productName) messageLines.push(`*Producto:* ${productName}`);

			// Combine size and quantity for a more natural sentence flow
			if (quantity || size) {
				const qtyText = quantity
					? `${quantity} unidad${quantity > 1 ? "es" : ""}`
					: "";
				const sizeText = size ? `en talla *${size}*` : "";
				if (qtyText && sizeText) {
					messageLines.push(`*Detalles:* ${qtyText} ${sizeText}`);
				} else if (qtyText || sizeText) {
					messageLines.push(`*Detalles:* ${qtyText}${sizeText}`);
				}
			}

			if (productPrice)
				messageLines.push(`*Precio unitario:* ${formatPrice(productPrice)}`);
			if (customNote) {
				messageLines.push("");
				messageLines.push(`*Nota del pedido:* _${customNote}_`);
			}

			messageLines.push("");
			messageLines.push(
				"¿Tienen disponibilidad para coordinar el pago y la entrega?",
			);
			break;

		case "custom_order":
			messageLines.push("¡Hola! Quisiera cotizar un pedido especial.");
			messageLines.push("");

			if (productName)
				messageLines.push(`*Modelo de referencia:* ${productName}`);
			if (quantity)
				messageLines.push(`*Cantidad aproximada:* ${quantity} unidades`);
			if (size) messageLines.push(`*Tallas requeridas:* ${size}`);

			messageLines.push("");
			if (customNote) {
				messageLines.push("*Especificaciones del pedido:*");
				messageLines.push(`_${customNote}_`);
			} else {
				messageLines.push(
					"_Me gustaría brindarles más detalles sobre lo que necesito._",
				);
			}

			messageLines.push("");
			messageLines.push(
				"¿Me podrían confirmar si es posible fabricarlo y cuál sería el costo?",
			);
			break;

		case "general_question":
		default:
			messageLines.push("¡Hola! Tengo una consulta.");
			messageLines.push("");

			if (productName) {
				messageLines.push(`Estoy viendo el producto: *${productName}*`);
				messageLines.push("");
			}

			if (customNote) {
				messageLines.push(`*Mi consulta es:* ${customNote}`);
			} else {
				messageLines.push("Me gustaría obtener más información, por favor.");
			}

			messageLines.push("");
			messageLines.push("Quedo atento a su respuesta. ¡Gracias!");
			break;
	}

	// Filter out any undefined/null values, then join with line breaks
	return messageLines
		.filter((line) => line !== undefined && line !== null)
		.join("\n");
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

	// Formats sizes nicely: "• 2 en talla M"
	const sizeDetails = Object.entries(sizeSelections)
		.filter(([_, qty]) => qty > 0)
		.map(([size, qty]) => `• ${qty} en talla ${size}`)
		.join("\n");

	const config: WhatsAppMessageConfig = {
		type: "product_order",
		productName: product.nombre,
		productPrice:
			product.enOferta && product.precioDescuento
				? product.precioDescuento
				: product.precio,
		currency: "S/.",
		category: product.categoria,
		quantity: totalQuantity,
		size: `\n${sizeDetails}`, // Adds a break before the bullet points
		customNote: customNote,
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
		currency: "S/.",
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
