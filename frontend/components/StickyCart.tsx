"use client";

import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image"; // <-- Added Image import
import React, { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useCartStore } from "@/stores/useCartStore";

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
	const {
		cart,
		getTotalItems,
		getTotalPrice,
		removeFromCart,
		clearCart,
		updateVariantQuantity,
	} = useCartStore();
	const hasHydrated = useHasHydrated();
	const { convertAndFormatPrice } = useCurrency();
	const [internalOpen, setInternalOpen] = useState(false);

	const totalItems = hasHydrated ? getTotalItems() : 0;
	const totalPrice = hasHydrated ? getTotalPrice() : 0;
	const cartItems = hasHydrated ? cart : [];

	const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

	const setIsOpen = (open: boolean) => {
		if (externalOpen !== undefined && onExternalClose) {
			if (!open) onExternalClose();
		} else {
			setInternalOpen(open);
		}
	};

	const shouldShowSidebar =
		isOpen || (externalOpen !== undefined && externalOpen);

	const handleWhatsAppCheckout = () => {
		if (cartItems.length === 0) {
			toast.error("Tu carrito está vacío", { position: "bottom-center" });
			return;
		}

		const message = cartItems
			.map((item) =>
				item.selectedItems
					.map((selected) => {
						const details = [
							selected.talla ? `Talla ${selected.talla}` : null,
							selected.color ? `Color ${selected.color}` : null,
						]
							.filter(Boolean)
							.join(", ");

						return `${selected.cantidad}x ${item.nombre}${details ? ` (${details})` : ""}`;
					})
					.join("\n"),
			)
			.join("\n\n");

		const totalText = convertAndFormatPrice(totalPrice);
		const fullMessage = `¡Hola! Quiero hacer un pedido:\n\n${message}\n\nTotal: ${totalText}`;

		const number = whatsappNumber?.replace(/\D/g, "") || "51999999999";
		const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(fullMessage)}`;
		window.open(whatsappUrl, "_blank");
	};

	const handleRemoveItem = (productId: string) => {
		removeFromCart(productId);
		toast.success("Producto eliminado");
	};

	const handleClearCart = () => {
		clearCart();
		toast.success("Carrito vaciado");
		setIsOpen(false);
	};

	if (totalItems === 0 && !shouldShowSidebar) {
		return null;
	}

	return (
		<>
			{/* Sticky Cart Button */}
			{externalOpen === undefined && totalItems > 0 && (
				<div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 animate-in fade-in duration-300">
					<motion.div
						animate={{
							scale: [1, 1.06, 1],
							boxShadow: [
								"0 10px 25px rgba(0,0,0,0.18)",
								"0 14px 32px rgba(0,0,0,0.24)",
								"0 10px 25px rgba(0,0,0,0.18)",
							],
						}}
						transition={{
							duration: 2.8,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
						className="relative"
					>
						<Button
							onClick={() => setIsOpen(true)}
							className="relative w-16 h-16 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-black/15 ring-1 ring-white/20"
							size="lg"
						>
							<ShoppingCart className="h-6 w-6" />
							<Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md">
								{totalItems}
							</Badge>
						</Button>
					</motion.div>
				</div>
			)}

			{/* Cart Sidebar */}
			{shouldShowSidebar && (
				<>
					<div
						className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
						onClick={() => setIsOpen(false)}
					/>

					<div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 animate-in slide-in-from-right duration-300">
						<div className="flex flex-col h-full">
							{/* Header */}
							<div className="flex items-center justify-between p-4 border-b">
								<h2 className="text-lg font-semibold uppercase tracking-tight">
									Tu Carrito
								</h2>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsOpen(false)}
									className="h-9 w-9 p-0 rounded-full"
								>
									<X className="h-5 w-5" />
								</Button>
							</div>

							{/* Cart Items */}
							<div className="flex-1 overflow-y-auto p-4">
								{cartItems.length === 0 ? (
									<div className="text-center py-12">
										<ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
										<p className="text-gray-500">Tu carrito está vacío</p>
									</div>
								) : (
									<div className="space-y-4">
										{cartItems.map((item) => (
											<div
												key={item.id}
												className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col"
											>
												{/* IMAGE + TITLE + DELETE BUTTON ROW */}
												<div className="flex gap-4 mb-4 items-start">
													{/* Thumbnail Image Container */}
													<div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100 shadow-sm">
														{item.imagen?.url ? (
															<Image
																src={item.imagen.url}
																alt={item.nombre}
																fill
																className="object-cover"
																sizes="64px"
															/>
														) : (
															<div className="flex h-full w-full items-center justify-center bg-gray-50">
																<ShoppingCart className="h-5 w-5 text-gray-300" />
															</div>
														)}
													</div>

													{/* Product Details & Delete */}
													<div className="flex flex-1 justify-between items-start gap-2 min-w-0">
														<div className="flex-1 min-w-0 pt-1">
															<h4 className="font-bold text-sm uppercase truncate text-gray-900">
																{item.nombre}
															</h4>
															{item.categoria && (
																<p className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
																	{item.categoria.nombre}
																</p>
															)}
														</div>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleRemoveItem(item.id)}
															className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 shrink-0 mt-0.5"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>

												{/* Selected Variants List */}
												<div className="space-y-2">
													{item.selectedItems.map((selected) => (
														<div
															key={selected.variantKey}
															className="flex justify-between items-center text-xs gap-3 bg-white/50 p-2 rounded-lg border border-gray-100"
														>
															<div className="flex flex-col gap-1">
																<span className="text-gray-600">
																	{selected.talla && `Talla ${selected.talla}`}
																	{selected.color && ` • ${selected.color}`}
																</span>
																<span className="font-bold text-gray-900">
																	{convertAndFormatPrice(
																		selected.precioUnitario * selected.cantidad,
																	)}
																</span>
															</div>

															{/* QUANTITY CONTROLLER */}
															<div className="flex items-center gap-1 bg-gray-200/50 rounded-md p-1">
																<button
																	onClick={() =>
																		updateVariantQuantity(
																			item.id,
																			selected.variantKey,
																			-1,
																		)
																	}
																	className="h-6 w-6 flex items-center justify-center hover:bg-white rounded transition-colors text-gray-600"
																	disabled={selected.cantidad <= 1}
																>
																	<Minus className="h-3 w-3" />
																</button>

																<span className="w-6 text-center font-bold text-primary text-sm">
																	{selected.cantidad}
																</span>

																<button
																	onClick={() =>
																		updateVariantQuantity(
																			item.id,
																			selected.variantKey,
																			1,
																		)
																	}
																	className="h-6 w-6 flex items-center justify-center hover:bg-white rounded transition-colors text-gray-600"
																>
																	<Plus className="h-3 w-3" />
																</button>
															</div>
														</div>
													))}
												</div>

												{/* Item Subtotal */}
												<div className="border-t border-gray-200 pt-3 mt-4 flex justify-between items-center">
													<span className="text-[10px] uppercase text-gray-400 font-bold tracking-wide">
														Subtotal Producto
													</span>
													<span className="font-bold text-sm text-gray-900">
														{convertAndFormatPrice(
															item.selectedItems.reduce(
																(sum, s) => sum + s.precioUnitario * s.cantidad,
																0,
															),
														)}
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Footer */}
							{cartItems.length > 0 && (
								<div className="border-t p-6 space-y-4 bg-gray-50/50">
									<div className="flex justify-between items-center">
										<span className="text-base font-bold uppercase tracking-tighter">
											Total a pagar
										</span>
										<span className="text-xl font-black text-primary">
											{convertAndFormatPrice(totalPrice)}
										</span>
									</div>

									<div className="space-y-2">
										<motion.div
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.96 }}
											className="w-full"
										>
											<Button
												onClick={handleWhatsAppCheckout}
												className="
      w-full h-12 rounded-xl
      /* Base Colors */
      bg-secondary text-white font-bold tracking-widest

      /* Hover State: Brighten + Glow */
      hover:bg-secondary/80
      hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]
      hover:brightness-110

      /* Active/Click State: Deepen + Inset */
      active:bg-secondary
      active:brightness-90
      active:shadow-inner

      /* Smoothness */
      transition-all duration-200 ease-out
      shadow-lg shadow-emerald-500/10
      uppercase
    "
											>
												<div className="flex items-center gap-2">
													<span>PEDIR POR WHATSAPP</span>
													<motion.span
														initial={{ x: 0 }}
														whileHover={{ x: 3 }}
														transition={{ type: "spring", stiffness: 400 }}
													>
														→
													</motion.span>
												</div>
											</Button>
										</motion.div>

										<button
											onClick={handleClearCart}
											className="w-full py-2 text-gray-700 text-sm hover:text-red-500 transition-colors"
										>
											VACIAR TODO EL CARRITO
										</button>
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
