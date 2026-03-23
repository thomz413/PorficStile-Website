import { Producto, Variante } from "@/lib/strapi/types/product";

export interface CartItem {
	id: string;
	product: Producto;
	variant: Variante | null;
	quantity: number;
	finalPrice: number;
}

export interface CartSummary {
	items: CartItem[];
	totalItems: number;
	totalPrice: number;
}

// Add item to cart with variant selection
export function addToCart(
	product: Producto,
	variant: Variante | null,
	quantity: number = 1,
): CartItem {
	// Determine final price with variant override and discount logic
	let basePrice = product.precio;
	let finalPrice = product.precio;

	// Variant override logic
	if (variant?.precioSobreescribir) {
		basePrice = variant.precioSobreescribir;
		finalPrice = variant.precioSobreescribir;
	}

	// Discount priority: 1. Variant discount, 2. Product discount
	if (variant?.precioOferta) {
		finalPrice = variant.precioOferta;
	} else if (product.precioOferta) {
		finalPrice = product.precioOferta;
	}

	return {
		id: `${product.id}-${variant?.id || "default"}`,
		product,
		variant,
		quantity,
		finalPrice,
	};
}

// Check if item can be added to cart based on availability rules
export function canAddToCart(
	product: Producto,
	variant: Variante | null,
): boolean {
	// If product.disponible === true, item can be added regardless of cantidadStock
	if (product.disponible) {
		return true;
	}

	// If variant.disponible === true, item can be added regardless of variant stock
	if (variant?.disponible === true) {
		return true;
	}

	// Otherwise check stock levels
	if (variant) {
		return (variant.stock ?? 0) > 0;
	}

	return (product.cantidadStock ?? 0) > 0;
}

// Calculate cart summary
export function calculateCartSummary(cart: CartItem[]): CartSummary {
	const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
	const totalPrice = cart.reduce(
		(sum, item) => sum + item.finalPrice * item.quantity,
		0,
	);

	return {
		items: cart,
		totalItems,
		totalPrice,
	};
}

// Generate WhatsApp checkout message
export function generateWhatsAppMessage(cart: CartItem[]): string {
	if (cart.length === 0) {
		return "Hola! Estoy interesado en realizar un pedido.";
	}

	let message = "🛒 *Pedido Atlantis Porfic Stile*\n\n";

	cart.forEach((item, index) => {
		message += `${index + 1}. ${item.product.nombre}`;

		if (item.variant) {
			if (item.variant.talla) {
				message += ` - Talla: ${item.variant.talla}`;
			}
			if (item.variant.color) {
				message += `, Color: ${item.variant.color}`;
			}
		}

		message += `\n   Cantidad: ${item.quantity}`;
		message += `\n   Precio: S/ ${(item.finalPrice * item.quantity).toFixed(2)}`;
		message += "\n";
	});

	const total = cart.reduce(
		(sum, item) => sum + item.finalPrice * item.quantity,
		0,
	);
	message += `\n💰 *Total: S/ ${total.toFixed(2)}*\n\n`;
	message += "Por favor confirmen disponibilidad y tiempo de entrega.\n\n";
	message += "¡Gracias! 🙏";

	return message;
}
