"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

export interface CartItem {
	id: string; // This is now your documentId or slug
	nombre: string;
	precio: number;
	precioDescuento?: number;
	categoria?: { nombre: string };
	imagen?: { url: string };
	tallas: Array<{
		talla: string;
		color?: string | null; // Added color
		stock: number;
		disponible: boolean;
	}>;
	selectedItems: Array<{
		variantKey: string; // NEW: Crucial for separating variants
		talla: string;
		color?: string | null; // NEW: To display in the cart UI
		cantidad: number;
		precioUnitario: number;
	}>;
}

interface CartContextType {
	cart: CartItem[];
	addToCart: (
		product: Omit<CartItem, "selectedItems">,
		selectedItems: CartItem["selectedItems"],
	) => void;
	removeFromCart: (productId: string) => void;
	updateCartItem: (
		productId: string,
		selectedItems: CartItem["selectedItems"],
	) => void;
	clearCart: () => void;
	getTotalItems: () => number;
	getTotalPrice: () => number;
	getCartSummary: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [cart, setCart] = useState<CartItem[]>([]);

	const addToCart = (
		product: Omit<CartItem, "selectedItems">,
		selectedItems: CartItem["selectedItems"],
	) => {
		if (selectedItems.length === 0) return;

		setCart((prevCart) => {
			const existingItemIndex = prevCart.findIndex(
				(item) => item.id === product.id,
			);

			if (existingItemIndex >= 0) {
				const updatedCart = [...prevCart];
				const existingItem = updatedCart[existingItemIndex];

				// Merge selected items
				const mergedSelectedItems = [...existingItem.selectedItems];
				selectedItems.forEach((newItem) => {
					// FIXED: Now we match by variantKey, not just talla
					const existingIndex = mergedSelectedItems.findIndex(
						(item) => item.variantKey === newItem.variantKey,
					);
					if (existingIndex >= 0) {
						mergedSelectedItems[existingIndex].cantidad += newItem.cantidad;
					} else {
						mergedSelectedItems.push(newItem);
					}
				});

				updatedCart[existingItemIndex] = {
					...existingItem,
					selectedItems: mergedSelectedItems.filter(
						(item) => item.cantidad > 0,
					),
				};

				return updatedCart.filter((item) => item.selectedItems.length > 0);
			} else {
				return [...prevCart, { ...product, selectedItems }];
			}
		});
	};

	const removeFromCart = (productId: string) => {
		setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
	};

	const updateCartItem = (
		productId: string,
		selectedItems: CartItem["selectedItems"],
	) => {
		setCart((prevCart) => {
			return prevCart
				.map((item) => {
					if (item.id === productId) {
						return {
							...item,
							selectedItems: selectedItems.filter((item) => item.cantidad > 0),
						};
					}
					return item;
				})
				.filter((item) => item.selectedItems.length > 0);
		});
	};

	const clearCart = () => setCart([]);

	const getTotalItems = () => {
		return cart.reduce((total, item) => {
			return (
				total +
				item.selectedItems.reduce(
					(subtotal, selectedItem) => subtotal + selectedItem.cantidad,
					0,
				)
			);
		}, 0);
	};

	const getTotalPrice = () => {
		return cart.reduce((total, item) => {
			return (
				total +
				item.selectedItems.reduce((subtotal, selectedItem) => {
					return subtotal + selectedItem.precioUnitario * selectedItem.cantidad;
				}, 0)
			);
		}, 0);
	};

	const getCartSummary = () => {
		if (cart.length === 0) return "";

		return cart
			.map((item) => {
				return item.selectedItems
					.map((selected) => {
						// FIXED: Include color in the summary if it exists
						const colorText = selected.color ? ` - ${selected.color}` : "";
						const tallaText = selected.talla
							? ` - Talla ${selected.talla}`
							: "";
						return `${selected.cantidad}x ${item.nombre}${tallaText}${colorText}`;
					})
					.join("\n");
			})
			.join("\n");
	};

	return (
		<CartContext.Provider
			value={{
				cart,
				addToCart,
				removeFromCart,
				updateCartItem,
				clearCart,
				getTotalItems,
				getTotalPrice,
				getCartSummary,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
