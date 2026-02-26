import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import {
	getCategories,
	getProducts,
	getProductsByCategory,
	getSettings,
	getStrapiImageUrl,
} from "@/lib/strapi";
import { WhatsAppMessageConfig } from "@/lib/whatsapp";

export const metadata = {
	title: "Tienda - Moda Peru",
	description:
		"Ropa y textiles peruanos. Buena calidad, precios bajos. Envíos a todo el Perú.",
};

interface ProductsPageProps {
	searchParams?: {
		categoria?: string;
	};
}

export default async function ProductsPage({
	searchParams,
}: ProductsPageProps) {
	const selectedCategory = searchParams?.categoria ?? "";

	// Fetch settings, categories and productss from Strapi in parallel
	const [settings, categories, products] = await Promise.all([
		getSettings(),
		getCategories(),
		selectedCategory ? getProductsByCategory(selectedCategory) : getProducts(),
	]);

	const whatsappNumber = settings?.numeroWhatsapp;

	// WhatsApp message configuration for general inquiries
	const generalInquiryConfig: WhatsAppMessageConfig = {
		type: 'general_inquiry',
		category: selectedCategory || 'Todos los productos'
	};

	return (
		<>
			<Header />
			<main className="min-h-screen bg-background">
				{/* Page Header */}
				<section className="border-b border-border py-12 md:py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
							{selectedCategory ? selectedCategory : "Todos los productos"}
						</h1>
						<p className="text-lg text-muted-foreground max-w-2xl">
							Ropa y textiles a buen precio. Filtra por categoría.
						</p>
					</div>
				</section>

				{/* Products Section */}
				<section className="py-20 md:py-32 bg-background">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						{products && products.length > 0 ? (
							<>
								{/* Filters + count */}
								<div className="mb-10 space-y-6">
									{/* Category filters */}
									<div className="flex flex-wrap gap-3">
										<Link
											href="/productos"
											className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-smooth ${
												!selectedCategory
													? "bg-primary text-primary-foreground border-primary shadow-sm"
													: "bg-background text-muted-foreground hover:text-foreground hover:border-primary/60"
											}`}
										>
											Todos
										</Link>
										{categories.map((category) => {
											const isActive = selectedCategory === category.nombre;
											return (
												<Link
													key={category.id ?? category.documentId}
													href={`/productos?categoria=${encodeURIComponent(
														category.nombre,
													)}`}
													className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-smooth ${
														isActive
															? "bg-primary text-primary-foreground border-primary shadow-sm"
															: "bg-background text-muted-foreground hover:text-foreground hover:border-primary/60"
													}`}
												>
													{category.nombre}
												</Link>
											);
										})}
									</div>

									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<p>
											<span className="text-foreground font-medium">
												{products.length}
											</span>{" "}
											productos
											{selectedCategory ? ` en ${selectedCategory}` : ""}
										</p>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
									{products.map((product) => (
										<ProductCard
											key={product.id}
											id={String(product.documentId)}
											nombre={product.nombre}
											precio={product.precio}
											imagen={getStrapiImageUrl(product.imagen?.url)}
											disponible={product.disponible}
											cantidadStock={product.cantidadStock}
											enOferta={product.enOferta}
											precioDescuento={product.precioDescuento}
											porcentajeDescuento={product.porcentajeDescuento}
										/>
									))}
								</div>
							</>
						) : (
							<div className="text-center py-20">
								<h2 className="text-3xl font-semibold text-foreground mb-4">
									Sin productos
								</h2>
								<p className="text-muted-foreground text-lg mb-8">
									No hay productos en esta categoría. Pronto tendremos más.
								</p>
							</div>
						)}
					</div>
				</section>

				{/* CTA Section */}
				<section className="border-t border-border bg-card py-12 md:py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
						<h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
							¿No encuentras algo?
						</h2>
						<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
							Escríbenos por WhatsApp para pedidos a medida o dudas.
						</p>
						<WhatsAppCTA
							whatsappNumber={whatsappNumber}
							messageConfig={generalInquiryConfig}
							label="Escribir por WhatsApp"
						/>
					</div>
				</section>
			</main>

			{/* Sticky WhatsApp Button */}
			<WhatsAppCTA
				whatsappNumber={whatsappNumber}
				variant="sticky"
				messageConfig={generalInquiryConfig}
			/>

			{/* Footer */}
			<footer className="border-t border-border bg-background py-12">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
					<p>© 2024 Moda Peru. Tienda online con envíos a todo el Perú.</p>
				</div>
			</footer>
		</>
	);
}
