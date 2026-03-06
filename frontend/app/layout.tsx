import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/sonner";
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
	title: "Atlantis Porfic Stile - Moda Premium Peruana",
	description:
		"Descubre colecciones exclusivas de Atlantis Porfic Stile. Moda premium peruana con diseño único y calidad excepcional. Tienda física en Galería Santa Lucía.",
	icons: {
		icon: "/favicon.ico",
	},
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
						{children}
						<Toaster />
					</CartProvider>
				</CurrencyProvider>
			</body>
		</html>
	);
}
