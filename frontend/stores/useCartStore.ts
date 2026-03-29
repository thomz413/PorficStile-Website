import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
	id: string; // documentId or slug
	nombre: string;
	precio: number;
	precioDescuento?: number;
	categoria?: { nombre: string };
	imagen?: { url: string };
	tallas: Array<{
		talla: string;
		color?: string | null;
		stock: number;
		disponible: boolean;
	}>;
	selectedItems: Array<{
		variantKey: string;
		talla: string;
		color?: string | null;
		cantidad: number;
		precioUnitario: number;
	}>;
};

type OmittedCartItem = Omit<CartItem, "selectedItems">;

type CartState = {
	cart: CartItem[];
	addToCart: (
		product: OmittedCartItem,
		selectedItems: CartItem["selectedItems"],
	) => void;
	removeFromCart: (productId: string) => void;
	updateCartItem: (
		productId: string,
		selectedItems: CartItem["selectedItems"],
	) => void;
	updateVariantQuantity: (productId: string, variantKey: string, delta: number) => void;
	clearCart: () => void;
	getTotalItems: () => number;
	getTotalPrice: () => number;
	getCartSummary: () => string;
};

// Add small image saved in here too
export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			cart: [],

			addToCart: (product, selectedItems) => {
				if (selectedItems.length === 0) return;

				set((state) => {
					const existingItemIndex = state.cart.findIndex(
						(item) => item.id === product.id,
					);

					if (existingItemIndex >= 0) {
						const updatedCart = [...state.cart];
						const existingItem = updatedCart[existingItemIndex];

						// Merge selected items
						const mergedSelectedItems = [...existingItem.selectedItems];
						selectedItems.forEach((newItem) => {
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

						return {
							cart: updatedCart.filter((item) => item.selectedItems.length > 0),
						};
					} else {
						return { cart: [...state.cart, { ...product, selectedItems }] };
					}
				});
			},

			removeFromCart: (productId) => {
				set((state) => ({
					cart: state.cart.filter((item) => item.id !== productId),
				}));
			},

			updateCartItem: (productId, selectedItems) => {
				set((state) => ({
					cart: state.cart
						.map((item) => {
							if (item.id === productId) {
								return {
									...item,
									selectedItems: selectedItems.filter(
										(item) => item.cantidad > 0,
									),
								};
							}
							return item;
						})
						.filter((item) => item.selectedItems.length > 0),
				}));
			},

			clearCart: () => set({ cart: [] }),

			getTotalItems: () => {
				return get().cart.reduce((total, item) => {
					return (
						total +
						item.selectedItems.reduce(
							(subtotal, selectedItem) => subtotal + selectedItem.cantidad,
							0,
						)
					);
				}, 0);
			},

			getTotalPrice: () => {
				return get().cart.reduce((total, item) => {
					return (
						total +
						item.selectedItems.reduce((subtotal, selectedItem) => {
							return (
								subtotal + selectedItem.precioUnitario * selectedItem.cantidad
							);
						}, 0)
					);
				}, 0);
			},

			getCartSummary: () => {
				const { cart } = get();
				if (cart.length === 0) return "";

				return cart
					.map((item) => {
						return item.selectedItems
							.map((selected) => {
								const colorText = selected.color ? ` - ${selected.color}` : "";
								const tallaText = selected.talla
									? ` - Talla ${selected.talla}`
									: "";
								return `${selected.cantidad}x ${item.nombre}${tallaText}${colorText}`;
							})
							.join("\n");
					})
					.join("\n");
			},

			// Inside useCartStore.ts -> persist -> set, get
			updateVariantQuantity: (productId, variantKey, delta) => {
				set((state) => ({
					cart: state.cart.map((item) => {
						if (item.id !== productId) return item;

						const updatedSelectedItems = item.selectedItems.map((selected) => {
							if (selected.variantKey !== variantKey) return selected;

							// Find the stock limit for this specific variant from the 'tallas' array
							const variantMeta = item.tallas.find(
								(t) =>
									`v-${t.talla}-${t.color || "nocolor"}`.toLowerCase() ===
									variantKey,
							);

							const newQty = selected.cantidad + delta;
							const maxStock = variantMeta?.stock ?? 99;

							// Ensure quantity stays between 1 and max stock
							return {
								...selected,
								cantidad: Math.max(1, Math.min(newQty, maxStock)),
							};
						});

						return { ...item, selectedItems: updatedSelectedItems };
					}),
				}));
			},
		}),
		{
			name: "moda-peru-cart", // Key used in localStorage
			storage: createJSONStorage(() => localStorage),
		},
	),
);
