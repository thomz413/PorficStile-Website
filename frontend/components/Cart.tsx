"use client";

import React, { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { generateWhatsAppMessage, WhatsAppMessageConfig } from "@/lib/whatsapp";
import { X, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";

interface CartProps {
	isOpen: boolean;
	onClose: () => void;
	whatsappNumber?: string | null;
}

export default function Cart({ isOpen, onClose, whatsappNumber }: CartProps) {
	const {
		cart,
		removeFromCart,
		updateCartItem,
		clearCart,
		getTotalItems,
		getTotalPrice,
		getCartSummary,
	} = useCart();
	const { convertAndFormatPrice, currencyInfo } = useCurrency();

	// Prevent page scroll while cart is open
	useEffect(() => {
		const prev = document.body.style.overflow;
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = prev || "";
		}
		return () => {
			document.body.style.overflow = prev || "";
		};
	}, [isOpen]);

	const updateQuantity = (
		productId: string,
		talla: string,
		newCantidad: number,
	) => {
		const cartItem = cart.find((item) => item.id === productId);
		if (!cartItem) return;

		const tallasInfo = cartItem.tallas.find((t) => t.talla === talla);
		if (!tallasInfo) return;

		const maxStock = tallasInfo.stock;
		const validCantidad = Math.min(Math.max(0, newCantidad), maxStock);

		const updatedSelectedItems = cartItem.selectedItems.map((item) => {
			if (item.talla === talla) {
				return { ...item, cantidad: validCantidad };
			}
			return item;
		});

		updateCartItem(productId, updatedSelectedItems);
	};

	const getWhatsAppConfig = (): WhatsAppMessageConfig => {
		const totalPrice = getTotalPrice();
		const summary = getCartSummary();

		return {
			type: "custom_order",
			productName: "Carrito de compras",
			productPrice: totalPrice,
			currency: currencyInfo.code,
			quantity: getTotalItems(),
			customNote: `Resumen del pedido:\n${summary}\n\nTotal: ${convertAndFormatPrice(
				totalPrice,
			)}`,
		};
	};

	// ---------- RENDER ----------
	// We render the cart always (mounted) but hide it visually when closed.
	// This avoids layout shift / accidental rendering issues and keeps transitions smooth.

	return (
		<div
			aria-hidden={!isOpen}
			className={`fixed inset-0 z-50 pointer-events-none`}
			// pointer-events-none at the container level — individual children will enable events when open
		>
			{/* Backdrop */}
			<div
				onClick={() => {
					if (isOpen) onClose();
				}}
				className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
					isOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
			/>

			{/* Slide-in panel */}
			<aside
				role="dialog"
				aria-label="Carrito de compras"
				className={`absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"}
        `}
			>
				{/* Cart Header */}
				<div className="sticky top-0 z-10 bg-background border-b border-border p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-foreground">
							Tu Carrito
						</h2>
						<div className="flex items-center gap-2">
							{getTotalItems() > 0 && (
								<span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-medium">
									{getTotalItems()}
								</span>
							)}
							<button
								onClick={onClose}
								className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-muted transition-colors"
								aria-label="Cerrar carrito"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>

				{/* Cart Items */}
				<div className="flex-1 overflow-y-auto p-4">
					{cart.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-muted-foreground mb-2">
								Tu carrito está vacío
							</p>
							<p className="text-sm text-muted-foreground">
								Agrega productos para continuar
							</p>
							<p className="text-xs text-muted-foreground mt-4 max-w-xs">
								Los pedidos se procesan por WhatsApp, no es una compra directa
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{cart.map((item) => (
								<div
									key={item.id}
									className="border border-border rounded-lg p-4 space-y-3"
								>
									{/* Product Header */}
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h3 className="font-medium text-foreground">
												{item.nombre}
											</h3>
											<p className="text-sm text-muted-foreground">
												{item.categoria?.nombre}
											</p>
										</div>
										<button
											onClick={() => removeFromCart(item.id)}
											className="h-8 w-8 p-0 flex items-center justify-center rounded text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
											aria-label={`Eliminar ${item.nombre}`}
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>

									{/* Size and Quantity Selections */}
									<div className="space-y-2">
										{item.selectedItems.map((selected) => {
											const tallaInfo = item.tallas.find(
												(t) => t.talla === selected.talla,
											);
											const maxStock = tallaInfo?.stock || 0;

											return (
												<div
													key={selected.talla}
													className="flex items-center justify-between bg-muted/50 rounded p-2"
												>
													<div className="flex items-center gap-2">
														<span className="font-medium text-sm">
															Talla {selected.talla}
														</span>
														<span className="text-xs text-muted-foreground">
															({maxStock} disponibles)
														</span>
													</div>
													<div className="flex items-center gap-2">
														<span className="text-sm font-medium">
															{convertAndFormatPrice(selected.precioUnitario)}
														</span>
														<div className="flex items-center gap-1">
															<button
																className="h-7 w-7 p-0 flex items-center justify-center rounded border border-border hover:bg-muted transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
																onClick={() =>
																	updateQuantity(
																		item.id,
																		selected.talla,
																		selected.cantidad - 1,
																	)
																}
																disabled={selected.cantidad <= 0}
																aria-label="Disminuir cantidad"
															>
																<Minus className="h-3 w-3" />
															</button>
															<div className="w-10 text-center text-sm font-medium">
																{selected.cantidad}
															</div>
															<button
																className="h-7 w-7 p-0 flex items-center justify-center rounded border border-border hover:bg-muted transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
																onClick={() =>
																	updateQuantity(
																		item.id,
																		selected.talla,
																		selected.cantidad + 1,
																	)
																}
																disabled={selected.cantidad >= maxStock}
																aria-label="Aumentar cantidad"
															>
																<Plus className="h-3 w-3" />
															</button>
														</div>
													</div>
												</div>
											);
										})}
									</div>

									{/* Item Subtotal */}
									<div className="text-right text-sm font-medium">
										Subtotal:{" "}
										{convertAndFormatPrice(
											item.selectedItems.reduce(
												(sum, selected) =>
													sum + selected.precioUnitario * selected.cantidad,
												0,
											),
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				{cart.length > 0 && (
					<div className="border-t border-border p-4 space-y-3">
						<div className="flex items-center justify-between">
							<span className="font-medium">Total:</span>
							<span className="text-lg font-bold text-primary">
								{convertAndFormatPrice(getTotalPrice())}
							</span>
						</div>

						<div className="space-y-2">
							<WhatsAppCTA
								whatsappNumber={whatsappNumber}
								messageConfig={getWhatsAppConfig()}
								label="Enviar pedido por WhatsApp"
								className="w-full justify-center bg-primary hover:bg-primary/90"
							/>
							<button
								onClick={clearCart}
								className="w-full py-2 px-4 border border-border rounded hover:bg-muted transition-colors text-sm font-medium"
							>
								Vaciar Carrito
							</button>
							<p className="text-xs text-muted-foreground text-center">
								📱 Recibirás confirmación y detalles de pago por WhatsApp
							</p>
						</div>
					</div>
				)}
			</aside>
		</div>
	);
}
