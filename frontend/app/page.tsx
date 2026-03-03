import Link from "next/link";
import { ArrowRight, Star, Award, Heart } from "lucide-react";
import Image from "next/image";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import {
  getFeaturedProducts,
  getSettings,
  getStrapiImageUrl,
} from "@/lib/strapi";
import { WhatsAppMessageConfig } from "@/lib/whatsapp";
import type { StrapiSettings } from "@/lib/strapi";

export const metadata = {
  title: "Atlantis Porfic Stile - Moda Premium Peruana",
  description:
    "Descubre colecciones exclusivas de Atlantis Porfic Stile. Moda premium peruana con diseño único y calidad excepcional. Tienda física en Galería Santa Lucía.",
};

export default async function Home() {
  // Fetch data from Strapi (parallel)
  const [products, settings] = await Promise.all([
    getFeaturedProducts(),
    getSettings(),
  ]);

  const siteSettings = settings as StrapiSettings | null;
  const featuredProducts = products.slice(0, 6);

  const heroTitle = "Atlantis Porfic Stile";
  const heroSubtitle =
    "Ropa de alta calidad con estilo único. Descubre nuestras colecciones exclusivas.";
  const estadisticas = siteSettings?.estadisticas;
  const whatsappNumber = settings?.numeroWhatsapp;

  console.log(whatsappNumber);

  // WhatsApp message configurations
  const generalQuestionConfig: WhatsAppMessageConfig = {
    type: "general_question",
  };
  const heroImageUrl = siteSettings?.imagenHero?.url;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
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
            <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Container */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 w-full">
          <div className="text-center space-y-8">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 bg-accent/10 backdrop-blur-md border border-accent/20 px-4 py-2 rounded-full mb-8">
              <span className="flex h-3 w-3 rounded-full bg-accent animate-pulse" />
              <span className="text-accent text-xs font-bold tracking-[0.3em] uppercase">
                Nueva Temporada
              </span>
            </div>

            {/* Brand Name */}
            <div className="flex flex-col items-center justify-center mb-4">
              <Image
                src="/AtlantisDorado.svg"
                alt="Atlantis logo"
                width={300}
                height={80}
                className="object-contain transition-all duration-300 w-48 md:w-64 lg:w-80 h-auto mb-4"
              />
              <span className="text-1xl md:text-3xl lg:text-4xl text-gold-shimmer font-black font-inter uppercase tracking-widest">
                PORFIC STILE
              </span>
            </div>

            {/* Tagline */}
            <div className="max-w-3xl mx-auto mb-12">
              <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light">
                {heroSubtitle}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center gap-3 bg-gold-shimmer text-accent-foreground px-8 py-4 font-black hover:bg-accent/90 transition-all duration-500 group shadow-2xl hover:-translate-y-1 uppercase tracking-widest text-sm hover:shadow-accent/25"
              >
                Ver Catálogo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
              </Link>

              {whatsappNumber ? (
                <WhatsAppCTA
                  whatsappNumber={whatsappNumber}
                  messageConfig={generalQuestionConfig}
                  label="Contactanos"
                  className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
                />
              ) : null}
            </div>

            {/* Brand Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-gold-shimmer mb-2">
                Variedad
              </div>
              <p className="text-white/80 text-sm uppercase tracking-wider">
                Muchas opciones para elegir
              </p>
            </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-gold-shimmer mb-2">
                  Premium
                </div>
                <p className="text-white/80 text-sm uppercase tracking-wider">
                  Calidad Excepcional
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-gold-shimmer mb-2">
                  Único
                </div>
                <p className="text-white/80 text-sm uppercase tracking-wider">
                  Estilo Inconfundible
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 md:py-32 bg-background relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-foreground leading-tight mb-6">
              Productos Destacados
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Conoce nuestras piezas más populares, diseñadas con alta calidad y
              variedad.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                style={{ animationDelay: `${Math.min(index * 150, 450)}ms` }}
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
                  whatsappNumber={whatsappNumber}
                />
              </div>
            ))}
          </div>

          <div className="mt-16 md:mt-24 text-center">
            <Link
              href="/productos"
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 font-black hover:bg-primary/90 transition-all duration-500 group shadow-xl hover:-translate-y-1 uppercase tracking-widest text-sm hover:shadow-primary/25"
            >
              Ver Todos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pattern-geometric opacity-20"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-foreground leading-tight">
                Calidad y Estilo
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                En Atlantis Porfic Stile creamos ropa de alta calidad con
                diseños que combinan tradición y modernidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-black text-foreground">
                  Diseño Único
                </h3>
                <p className="text-muted-foreground">
                  Piezas originales creadas con atención al detalle
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-black text-foreground">
                  Alta Calidad
                </h3>
                <p className="text-muted-foreground">
                  Materiales seleccionados y acabados duraderos
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-secondary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-black text-foreground">
                  Estilo Peruano
                </h3>
                <p className="text-muted-foreground">
                  Diseños que reflejan nuestra cultura
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
			

			{/* Premium CTA Section */}
			<section className="py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-white relative overflow-hidden">
				<div className="absolute inset-0 pattern-geometric opacity-20"></div>
				<div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
				<div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

				<div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
					<div className="space-y-8">
						<h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight">
							Encuentra tu Estilo
						</h2>
						<p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
							Descubre nuestra colección de ropa de calidad.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							{whatsappNumber ? (
								<WhatsAppCTA
									whatsappNumber={whatsappNumber}
									messageConfig={generalQuestionConfig}
									label="Asesoría Personal"
									className="cursor-pointer  border-white text-lg px-8 py-4 font-black"
								/>
							) : null}
							<Link
								href="/productos"
								className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white px-8 py-4 font-black hover:bg-white/20 transition-all duration-500 group uppercase tracking-widest text-sm"
							>
								Explorar Tienda
								<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-slate-900 text-white py-16 md:py-20 relative overflow-hidden">
				<div className="absolute inset-0 pattern-geometric opacity-10"></div>
				<div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

				<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
						<div className="md:col-span-2">
							<h3 className="text-3xl font-black mb-4">
								Atlantis <span className="text-gold-shimmer font-inter uppercase tracking-wider">PORFIC STILE</span>
							</h3>
							<p className="text-slate-300 leading-relaxed mb-6 max-w-md">
								Moda premium peruana que celebra la fusión entre artesanía
								tradicional y diseño contemporáneo. Cada pieza cuenta una
								historia de talento y pasión.
							</p>
							<div className="space-y-2 text-sm text-slate-400">
								<p>
									<span className="font-semibold text-white">
										Dirección de Tienda:
									</span>{" "}
									Galería Santa Lucía, Piso 7, Tienda 709
								</p>
							</div>
						</div>

						<div>
							<h4 className="font-semibold text-white mb-4 text-lg">
								Colecciones
							</h4>
							<ul className="space-y-3 text-sm">
								<li>
									<Link
										href="/productos"
										className="text-slate-300 hover:text-accent transition-colors"
									>
										Todas las Piezas
									</Link>
								</li>
								<li>
									<Link
										href="/productos?destacado=true"
										className="text-slate-300 hover:text-accent transition-colors"
									>
										Colección Destacada
									</Link>
								</li>
								<li>
									<Link
										href="/nosotros"
										className="text-slate-300 hover:text-accent transition-colors"
									>
										Nuestra Historia
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold text-white mb-4 text-lg">
								Servicios
							</h4>
							<ul className="space-y-3 text-sm">
								<li>
									<Link
										href="/contacto"
										className="text-slate-300 hover:text-accent transition-colors"
									>
										Asesoría Personal
									</Link>
								</li>
								<li>
									<Link
										href="/contacto"
										className="text-slate-300 hover:text-accent transition-colors"
									>
										Pedidos a Medida
									</Link>
								</li>
								<li>
									<Link
										href="/contacto"
										className="text-slate-300 hover:text-accent transition-colors"
									>
										Mayoristas
									</Link>
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="text-center md:text-left">
							<p className="text-slate-400 text-sm">
								© 2025 Atlantis Porfic Stile. Todos los derechos reservados.
							</p>
						</div>
						{whatsappNumber && (
							<div className="flex items-center gap-2 text-sm">
								<span className="text-slate-400">Atención WhatsApp:</span>
								<WhatsAppCTA
									whatsappNumber={whatsappNumber}
									messageConfig={generalQuestionConfig}
									label="Escribir ahora"
									className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90 border-accent text-xs px-4 py-2"
								/>
							</div>
						)}
					</div>
				</div>
			</footer>

			{/* Sticky WhatsApp Widget */}
			<WhatsAppCTA
				whatsappNumber={whatsappNumber}
				variant="sticky"
				messageConfig={generalQuestionConfig}
				className="border border-white"
			/>
		</main>
	);
}
