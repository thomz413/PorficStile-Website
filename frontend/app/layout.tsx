import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";
import { ImprovedToastProvider } from "@/components/ImprovedToast";
import HeaderWrapper from "@/components/HeaderWrapper";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Moda Peru - Ropa y Textiles",
	description:
		"Ropa y textiles peruanos. Alta calidad, precios bajos. Envíos a todo el Perú. Pedidos por WhatsApp.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<CurrencyProvider>
					<CartProvider>
						<ImprovedToastProvider>
							{children}
						</ImprovedToastProvider>
					</CartProvider>
				</CurrencyProvider>
			</body>
		</html>
	);
}
