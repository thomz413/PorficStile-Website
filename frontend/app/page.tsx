import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import {getFeaturedProducts, getSettings, getStrapiImageUrl} from "@/lib/strapi";
import type { StrapiSettings } from "@/lib/strapi";

export const metadata = {
	title: "Moda Peru - Ropa y Textiles",
	description:
		"Ropa y textiles peruanos. Alta calidad, precios bajos. Envíos a todo el Perú. Pedidos por WhatsApp.",
};

export default async function Home() {
	// Fetch data from Strapi (parallel)
	const [products, settings] = await Promise.all([
		getFeaturedProducts(),
		getSettings(),
	]);

	const siteSettings = settings as StrapiSettings | null;
	const featuredProducts = products.slice(0, 6);

	const heroTitle = siteSettings?.tituloHero || "Moda Peru";
	const heroSubtitle =
		siteSettings?.subtituloHero ||
		"Ropa y textiles de calidad. Envíos a todo el Perú.";
	const estadisticas = siteSettings?.estadisticas;
	const whatsappNumber = siteSettings?.numeroWhatsapp;
	const heroImageUrl = siteSettings?.imagenHero?.url;

	return (
		<main className="min-h-screen bg-background">
			<Header />

			{/* Hero Section */}
			<section className="relative overflow-hidden min-h-[80vh] sm:min-h-screen flex items-center py-16 sm:py-20">
				{/* Background & Scrims */}
				<div className="absolute inset-0 z-0">
					{heroImageUrl ? (
						<div
							className="absolute inset-0 scale-105 animate-[subtle-zoom_20s_infinite_alternate]"
							style={{
								backgroundImage: `url(${heroImageUrl})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
						/>
					) : (
						<div className="absolute inset-0 bg-neutral-900" />
					)}
					{/* stronger overlay on small to ensure text contrast */}
					<div className="absolute inset-0 z-10 bg-linear-to-r from-black/90 via-black/50 to-transparent" />
				</div>

				{/* Container - tighter on mobile */}
				<div className="relative z-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-12 w-full">
					{/* Restrict readable width on small screens */}
					<div className="max-w-xl sm:max-w-2xl lg:max-w-4xl text-left">
						{/* Premium Badge */}
						<div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full mb-6">
							<span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
							<span className="text-white text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">
								Nueva colección
							</span>
						</div>

						{/* Headline */}
						<div className="space-y-5">
							<h1
								className="font-black text-white leading-[0.9] tracking-[-0.02em] drop-shadow-2xl"
								// clamp keeps the font big on desktop but reasonable on phones
								style={{ fontSize: "clamp(2.25rem, 8vw, 7.5rem)" }}
							>
								{heroTitle.split(" ").map((word, i) => (
									<span
										key={i}
										className={i % 2 === 1 ? "text-accent block md:inline" : "block"}
									>
										{word}{" "}
									</span>
								))}
							</h1>

							{/* Subtitle - border only on md+ to save horizontal space on mobile */}
							<p className="text-base md:text-lg text-white/90 leading-relaxed max-w-full md:max-w-md font-medium md:border-l-4 md:pl-6 mt-2">
								{heroSubtitle}
							</p>
						</div>

						{/* Action Buttons - stacked full-width on small screens */}
						<div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-8 sm:mt-12">
							<Link
								href="/products"
								className="inline-flex items-center justify-center gap-3 rounded-none bg-white px-6 sm:px-10 py-3 sm:py-5 font-black text-black hover:bg-accent transition-all duration-500 group shadow-2xl hover:-translate-y-1 uppercase tracking-widest text-sm w-full sm:w-auto"
							>
								Explorar Catálogo
								<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-2" />
							</Link>

							{/* Hide WhatsApp CTA if number missing */}
							{whatsappNumber ? (
								<WhatsAppCTA
									whatsappNumber={whatsappNumber}
									message="Hola, me interesa conocer más sobre sus productos."
									label="Contactar"
									className="w-full sm:w-auto bg-black/40 backdrop-blur-xl border-white/20 hover:bg-white/10 text-white border px-6 sm:px-10 py-3 sm:py-5 font-bold uppercase tracking-widest text-sm transition-all duration-300"
								/>
							) : (
								<button
									className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-5 border border-white/10 text-white bg-black/30 font-semibold rounded-none"
									disabled
								>
									Contactar
								</button>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Quick Stats */}
			<section className="bg-linear-to-r from-secondary to-secondary/90 text-white py-10 md:py-12 relative overflow-hidden">
				<div className="absolute inset-0 pattern-geometric opacity-8"></div>
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
						{estadisticas?.map((item, idx) => (
							<div
								key={idx}
								className="text-center transform hover:scale-105 transition-transform duration-300"
							>
								<p className="text-2xl md:text-4xl font-black mb-1 md:mb-2">
									{item.textoArriba}
								</p>
								<p className="text-xs md:text-sm text-white/75 uppercase tracking-wider font-semibold">
									{item.textoAbajo}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Featured Products Section */}
			<section className="py-16 md:py-24 bg-background relative">
				<div className="absolute top-0 left-0 w-56 h-56 md:w-80 md:h-80 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
					<div className="mb-12 md:mb-20 animate-slide-up">
						<h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground leading-tight">
							Productos destacados
						</h2>
						<p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl">
							Algunas de nuestras piezas más pedidas.
						</p>
					</div>

					{/* Product Grid */}
					{featuredProducts.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
							{featuredProducts.map((product, index) => (
								<div
									key={product.id}
									style={{ animationDelay: `${index * 90}ms` }}
									className="animate-slide-up"
								>
									<ProductCard
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
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<p className="text-muted-foreground text-lg">
								Sin productos por ahora. Vuelve pronto.
							</p>
						</div>
					)}

					{/* CTA Button */}
					<div className="mt-10 md:mt-16 text-center">
						<Link
							href="/products"
							className="inline-flex items-center gap-3 rounded-none border-2 border-primary px-6 py-3 md:px-8 md:py-4 font-semibold text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg transition-smooth text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
						>
							Ver todos los productos
							<ArrowRight className="h-5 w-5 transition-smooth group-hover:translate-x-1" />
						</Link>
					</div>
				</div>
			</section>

			{/* Why Choose Us Section */}
			<section className="py-16 md:py-24 bg-muted/40 relative overflow-hidden">
				<div className="absolute inset-0 pattern-geometric opacity-30"></div>

				<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 md:mb-20 animate-slide-up">
						<div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-full border border-primary/20 mb-4">
							<span className="w-2 h-2 bg-primary rounded-full"></span>
							<p className="text-primary font-semibold text-sm tracking-widest uppercase">
								Por qué elegirnos
							</p>
						</div>
						<h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground leading-tight">
							Qué nos importa
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
						{[
							{
								title: "Precios bajos",
								description:
									"Trabajamos directo con talleres locales. Sin intermediarios, precios más justos para ti.",
								color: "primary",
								icon: "◆",
							},
							{
								title: "Alta calidad",
								description:
									"Revisamos materiales y acabados. Prendas que duran.",
								color: "secondary",
								icon: "✔",
							},
							{
								title: "Atención personal",
								description:
									"Atendemos por WhatsApp. Dudas, pedidos o cotizaciones, te respondemos.",
								color: "accent",
								icon: "✉",
							},
						].map((feature, idx) => (
							<div
								key={idx}
								style={{ animationDelay: `${idx * 150}ms` }}
								className="animate-slide-up group"
							>
								<div
									/* Note: if you use dynamic color classes in Tailwind, prefer a map to fixed classes
									   to ensure classes aren't purged by the compiler. Keeping structure here to avoid big refactor. */
									className="relative overflow-hidden p-6 md:p-10 rounded-lg bg-white border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 space-y-4"
								>
									<div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-300"></div>

									<div className="relative">
										<div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/15 text-primary font-black text-xl mb-3 group-hover:scale-110 transition-transform duration-300">
											{feature.icon}
										</div>
										<h3 className="text-xl md:text-2xl font-black text-foreground mb-2">
											{feature.title}
										</h3>
										<p className="text-muted-foreground text-sm md:text-base leading-relaxed">
											{feature.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Direct Communication Section */}
			<section className="py-16 md:py-24 bg-linear-to-b from-background via-background to-primary/5 relative overflow-hidden">
				<div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"></div>
				<div className="absolute top-0 left-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl"></div>

				<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 md:mb-20 animate-slide-up text-center">
						<div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-full border border-primary/20 mb-4">
							<span className="w-2 h-2 bg-primary rounded-full"></span>
							<p className="text-primary font-semibold text-sm tracking-widest uppercase">
								Contacto
							</p>
						</div>
						<h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground mb-4 leading-tight">
							Pedidos y consultas
						</h2>
						<p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
							Dudas, cotizaciones o pedidos a medida. Escríbenos por WhatsApp y
							te respondemos.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
						<Link
							href="/contacto"
							className="block rounded-none border-2 border-secondary p-5 bg-secondary/5 hover:bg-secondary/10 transition-smooth text-center group"
						>
							<div className="flex items-center justify-center mb-3">
								<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-black">
									1
								</span>
							</div>
							<h3 className="font-semibold text-lg text-foreground mb-2">
								Preguntas sobre productos
							</h3>
							<p className="text-sm text-muted-foreground">
								Dudas sobre tallas, materiales o disponibilidad.
							</p>
						</Link>
						<Link
							href="/contacto"
							className="block rounded-none border-2 border-secondary p-5 bg-secondary/5 hover:bg-secondary/10 transition-smooth text-center group"
						>
							<div className="flex items-center justify-center mb-3">
								<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-black">
									2
								</span>
							</div>
							<h3 className="font-semibold text-lg text-foreground mb-2">
								Pedidos personalizados
							</h3>
							<p className="text-sm text-muted-foreground">
								Colecciones, uniformes o producción para tu marca.
							</p>
						</Link>
						<Link
							href="/contacto"
							className="block rounded-none border-2 border-secondary p-5 bg-secondary/5 hover:bg-secondary/10 transition-smooth text-center group"
						>
							<div className="flex items-center justify-center mb-3">
								<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-black">
									3
								</span>
							</div>
							<h3 className="font-semibold text-lg text-foreground mb-2">
								Negocios y mayoristas
							</h3>
							<p className="text-sm text-muted-foreground">
								Tienda física u online. Contamos cómo trabajar juntos.
							</p>
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border bg-background py-10 md:py-12">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 md:mb-12">
						<div>
							<h4 className="font-semibold text-foreground mb-3 text-lg">
								Moda Peru
							</h4>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Ropa y textiles. Envíos a todo el Perú.
							</p>
						</div>

						<div>
							<h4 className="font-semibold text-foreground mb-3 text-lg">
								Enlaces
							</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<Link
										href="/products"
										className="text-muted-foreground hover:text-primary transition-smooth"
									>
										Tienda
									</Link>
								</li>
								<li>
									<Link
										href="/contacto"
										className="text-muted-foreground hover:text-primary transition-smooth"
									>
										Contáctanos
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold text-foreground mb-3 text-lg">
								Contacto
							</h4>
							<div className="space-y-2 text-sm text-muted-foreground">
								<p>Tienda online. Envíos desde Perú.</p>
								<p className="text-primary font-medium">Atendemos por WhatsApp</p>
							</div>
						</div>
					</div>

					<div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
						<p>© 2024 Moda Peru. Todos los derechos reservados.</p>
					</div>
				</div>
			</footer>

			{/* Sticky WhatsApp Widget */}
			<WhatsAppCTA
				whatsappNumber={whatsappNumber}
				variant="sticky"
				message="Hola, me interesa saber más."
			/>
		</main>
	);
}