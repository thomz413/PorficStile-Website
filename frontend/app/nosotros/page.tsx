import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { getSettings } from "@/lib/strapi";
import { WhatsAppMessageConfig } from "@/lib/whatsapp";

export const metadata = {
	title: "Nosotros - Atlantis Porfic Stile",
	description:
		"Conoce nuestra historia en Galería Santa Lucía. Ropa de calidad con estilo único y envíos a nivel nacional.",
};

export default async function NosotrosPage() {
	const settings = await getSettings();

	const descripcionTienda =
		settings?.descripcionTienda ??
		"Atlantis Porfic Stile ofrece ropa de calidad con estilo único. Visítanos en Galería Santa Lucía Piso 7 Tienda 709 Stand A. Envíos a nivel nacional.";

	const estadisticas = settings?.estadisticas ?? [];
	const whatsappNumber = settings?.numeroWhatsapp;

	// WhatsApp message configuration for collaboration inquiries
	const collaborationConfig: WhatsAppMessageConfig = {
		type: "custom_order",
		customNote: "Soy un negocio y quiero colaborar con ustedes",
	};

	return (
		<main className="min-h-screen bg-background">
			<Header />

			{/* Hero */}
			<section className="border-b border-border bg-linear-to-b from-background via-background to-secondary/10 py-16 md:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="max-w-2xl space-y-4">
						<p className="text-xs font-medium text-primary uppercase tracking-[0.2em]">
							Nuestra empresa
						</p>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
							Atlantis <span className="text-secondary">Porfic Stile</span>
						</h1>
						<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
							{descripcionTienda}
						</p>
					</div>
				</div>
			</section>

			{/* Stats / Highlights */}
			<section className="bg-linear-to-r from-secondary to-secondary/90 text-white py-12 md:py-16 relative overflow-hidden">
				<div className="absolute inset-0 pattern-geometric opacity-10" />
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
					<div className="mb-10">
						<h2 className="text-2xl md:text-3xl md:text-4xl font-bold tracking-tight">
							Nuestros números
						</h2>
						<p className="mt-3 text-sm md:text-base text-white/80 max-w-xl">
							Años de experiencia y clientes satisfechos con nuestros productos.
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 md:gap-10">
						{estadisticas.length > 0 ? (
							estadisticas.map((item, idx) => (
								<div
									key={idx}
									className="text-center transform hover:scale-110 transition-transform duration-300"
								>
									<p className="text-2xl md:text-3xl md:text-4xl font-bold mb-1">
										{item.textoArriba}
									</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										{item.textoAbajo}
									</p>
								</div>
							))
						) : (
							<>
								<div className="text-center">
									<p className="text-2xl md:text-3xl md:text-4xl font-bold mb-1">
										+5
									</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Años de experiencia
									</p>
								</div>
								<div className="text-center">
									<p className="text-2xl md:text-3xl md:text-4xl font-bold mb-1">
										+500
									</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Clientes satisfechos
									</p>
								</div>
								<div className="text-center">
									<p className="text-2xl md:text-3xl md:text-4xl font-bold mb-1">
										24/7
									</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Soporte WhatsApp
									</p>
								</div>
								<div className="text-center">
									<p className="text-2xl md:text-3xl md:text-4xl font-bold mb-1">
										100%
									</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Calidad garantizada
									</p>
								</div>
							</>
						)}
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="py-16 md:py-20 lg:py-24 bg-muted/40">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-8 md:mb-12 lg:mb-16 max-w-3xl">
						<p className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-3">
							Nuestro trabajo
						</p>
						<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
							Por qué elegirnos
						</h2>
						<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
							Ofrecemos ropa de buena calidad con atención personalizada y
							precios justos.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
						<div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-card p-6 md:p-8 shadow-lg">
							<div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
							<div className="relative space-y-3">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
									Buena calidad
								</p>
								<h3 className="text-lg md:text-xl font-semibold text-foreground">
									Materiales duraderos
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Seleccionamos telas resistentes y revisamos cada prenda para
									asegurar que recibas un producto que dura.
								</p>
							</div>
						</div>

						<div className="relative overflow-hidden rounded-2xl border-2 border-secondary/20 bg-card p-6 md:p-8 shadow-lg">
							<div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-secondary/15 blur-3xl" />
							<div className="relative space-y-3">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
									Precios justos
								</p>
								<h3 className="text-lg md:text-xl font-semibold text-foreground">
									Accesible para todos
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Trabajamos directamente con talleres para mantenerte precios
									bajos sin perder la calidad que esperas.
								</p>
							</div>
						</div>

						<div className="relative overflow-hidden rounded-2xl border-2 border-accent/20 bg-card p-6 md:p-8 shadow-lg">
							<div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/15 blur-3xl" />
							<div className="relative space-y-3">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
									Producción local
								</p>
								<h3 className="text-lg md:text-xl font-semibold text-foreground">
									Hecho en Perú
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Toda nuestra ropa se produce en talleres locales, apoyando la
									economía del país y garantizando calidad.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border bg-card py-12 md:py-16 lg:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
					<div className="flex-1 space-y-3 text-center lg:text-left">
						<p className="text-xs font-medium text-primary uppercase tracking-[0.2em]">
							Proyectos especiales
						</p>
						<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
							¿Necesitas algo personalizado?
						</h2>
						<p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0">
							Uniformes, colecciones o diseños específicos. Contáctanos y
							cotizamos tu proyecto.
						</p>
					</div>

					<div className="w-full lg:w-auto lg:flex-1">
						<WhatsAppCTA
							whatsappNumber={whatsappNumber}
							messageConfig={collaborationConfig}
							label="Solicitar cotización"
							className="w-full lg:w-auto justify-center bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
						/>
					</div>
				</div>
			</section>
		</main>
	);
}
