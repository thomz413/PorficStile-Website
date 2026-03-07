"use client";

import React, { useState } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createWhatsAppCheckoutURL } from "@/lib/cart";
import { toast } from "sonner";

interface StickyCartProps {
	externalOpen?: boolean;
	onExternalClose?: () => void;
	whatsappNumber?: string | null;
}

export default function StickyCart({
	externalOpen,
	onExternalClose,
	whatsappNumber,
}: StickyCartProps = {}) {
	const { cart, getTotalItems, getTotalPrice, removeFromCart, clearCart } =
		useCart();
	const { convertAndFormatPrice } = useCurrency();
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external open state if provided, otherwise use internal state
	const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
	const setIsOpen = (open: boolean) => {
		if (externalOpen !== undefined && onExternalClose) {
			// External control - only allow closing
			if (!open) onExternalClose();
		} else {
			// Internal control
			setInternalOpen(open);
		}
	};

	const totalItems = getTotalItems();
	const totalPrice = getTotalPrice();

	// Always show the sidebar if externally opened, even if cart is empty
	const shouldShowSidebar =
		isOpen || (externalOpen !== undefined && externalOpen);

	const handleWhatsAppCheckout = () => {
		if (cart.length === 0) {
			toast.error("Tu carrito está vacío", { position: "bottom-center" });
			return;
		}

		// Create WhatsApp message from cart items
		const message = cart
			.map((item) => {
				const itemsText = item.selectedItems
					.map(
						(selected) =>
							`${selected.cantidad}x ${item.nombre} - Talla ${selected.talla}`,
					)
					.join("\n");
				return itemsText;
			})
			.join("\n\n");

		const totalText = convertAndFormatPrice(totalPrice);
		const fullMessage = `Hola! Quiero hacer un pedido:\n\n${message}\n\nTotal: ${totalText}`;

		// Use provided whatsappNumber or fallback
		const number = whatsappNumber || "51999999999";
		const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(fullMessage)}`;
		window.open(whatsappUrl, "_blank");
	};

	const handleRemoveItem = (productId: string) => {
		removeFromCart(productId);
		toast.success("Producto eliminado del carrito", {
			position: "bottom-center",
		});
	};

	const handleClearCart = () => {
		clearCart();
		toast.success("Carrito vaciado", { position: "bottom-center" });
		setIsOpen(false);
	};

	// Don't render sticky button if cart is empty, but allow sidebar to show
	if (totalItems === 0 && !shouldShowSidebar) {
		return null;
	}

	return (
		<>
			{/* Sticky Cart Button - Only show when not externally controlled and cart has items */}
			{externalOpen === undefined && totalItems > 0 && (
				<div className="fixed bottom-6 right-6 z-50 animate-fade-in">
					<Button
						onClick={() => setIsOpen(true)}
						className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover-lift relative"
						size="lg"
					>
						<ShoppingCart className="h-6 w-6" />
						<Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5">
							{totalItems}
						</Badge>
					</Button>
				</div>
			)}

			{/* Cart Sidebar */}
			{shouldShowSidebar && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
						onClick={() => setIsOpen(false)}
					/>

					{/* Cart Panel */}
					<div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 animate-slide-in-right">
						<div className="flex flex-col h-full">
							{/* Header */}
							<div className="flex items-center justify-between p-4 border-b">
								<h2 className="text-lg font-semibold">Tu Carrito</h2>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsOpen(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Cart Items */}
							<div className="flex-1 overflow-y-auto p-4">
								{cart.length === 0 ? (
									<div className="text-center py-8">
										<ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
										<p className="text-gray-500">Tu carrito está vacío</p>
									</div>
								) : (
									<div className="space-y-4">
										{cart.map((item) => (
											<div key={item.id} className="bg-gray-50 rounded-lg p-4">
												<div className="flex justify-between items-start mb-2">
													<div className="flex-1">
														<h4 className="font-medium">{item.nombre}</h4>
														{item.categoria && (
															<p className="text-sm text-gray-500">
																{item.categoria.nombre}
															</p>
														)}
													</div>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleRemoveItem(item.id)}
														className="text-red-500 hover:text-red-700"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>

												{/* Selected Items */}
												<div className="space-y-2">
													{item.selectedItems.map((selected, index) => (
														<div
															key={index}
															className="flex justify-between items-center text-sm"
														>
															<span>
																{selected.cantidad}x Talla {selected.talla}
															</span>
															<span className="font-medium">
																{convertAndFormatPrice(
																	selected.precioUnitario * selected.cantidad,
																)}
															</span>
														</div>
													))}
												</div>

												{/* Item Total */}
												<div className="border-t pt-2 mt-2">
													<div className="flex justify-between items-center">
														<span className="font-medium">Subtotal</span>
														<span className="font-semibold">
															{convertAndFormatPrice(
																item.selectedItems.reduce(
																	(sum, selected) =>
																		sum +
																		selected.precioUnitario * selected.cantidad,
																	0,
																),
															)}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Footer */}
							{cart.length > 0 && (
								<div className="border-t p-4 space-y-3">
									{/* Total */}
									<div className="flex justify-between items-center text-lg font-semibold">
										<span>Total</span>
										<span>{convertAndFormatPrice(totalPrice)}</span>
									</div>

									{/* Actions */}
									<div className="space-y-2">
										<Button
											onClick={handleWhatsAppCheckout}
											className="w-full bg-secondary hover:bg-secondary/90 text-white"
										>
											Pedir por WhatsApp
										</Button>
										<Button
											variant="outline"
											onClick={handleClearCart}
											className="w-full"
										>
											Vaciar Carrito
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</>
	);
}
