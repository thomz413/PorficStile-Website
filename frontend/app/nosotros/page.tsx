import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import Image from "next/image";
import { getSettings } from "@/lib/strapi";
import { WhatsAppMessageConfig } from "@/lib/whatsapp";

export const metadata = {
	title: "Nosotros - Atlantis Porfic Stile",
	description:
		"Conoce nuestra historia en Galería Santa Lucía. Ropa de calidad con estilo propio y envíos a nivel nacional.",
};

export default async function NosotrosPage() {
	const settings = await getSettings();

	const descripcionTienda =
		settings?.descripcionTienda ??
		"Atlantis Porfic Stile ofrece ropa con diseño propio y fabricación local. Visítanos en Galería Santa Lucía — Piso 7, Tienda 709. Envíos a todo el país.";

	const estadisticas = settings?.estadisticas ?? [];
	const whatsappNumber = settings?.numeroWhatsapp;

	// WhatsApp message configuration for collaboration inquiries
	const collaborationConfig: WhatsAppMessageConfig = {
		type: "custom_order",
		customNote:
			"Hola, soy un negocio y quiero conversar sobre una colaboración",
	};

	return (
		<main className="min-h-screen bg-background text-foreground">
			<Header />

			{/* Hero */}
			<section
				aria-labelledby="nosotros-hero-title"
				className="border-b border-borderbg py-16 md:py-24"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="max-w-2xl">
						<p className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-4">
							Nuestra empresa
						</p>

						<div className="flex flex-col items-start gap-4">
							<Image
								src="/Atlantis.svg"
								alt="Logo de Atlantis Porfic Stile"
								width={300}
								height={80}
								className="object-contain w-40 sm:w-48 md:w-56 lg:w-64 h-auto filter drop-shadow-[0_0_12px_rgba(255,215,0,0.35)]"
								priority
							/>

							<h1
								id="nosotros-hero-title"
								className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
							>
								<span className="font-inter uppercase tracking-widest text-gold-dark">
									PORFIC STILE
								</span>
							</h1>

							<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
								{descripcionTienda}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Stats / Highlights */}
			<section
				className="bg-linear-to-r from-secondary to-secondary/90 text-white py-12 md:py-16 relative overflow-hidden"
				aria-labelledby="nuestros-numeros"
			>
				<div
					className="absolute inset-0 pattern-geometric opacity-10"
					aria-hidden
				/>

				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
					<div className="mb-10">
						<h2
							id="nuestros-numeros"
							className="text-2xl md:text-3xl font-bold"
						>
							Nuestros números
						</h2>
						<p className="mt-3 text-sm md:text-base text-white/80 max-w-xl">
							Años de experiencia y clientes que repiten por nuestra atención y
							calidad.
						</p>
					</div>

					<dl className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
						{estadisticas.length > 0 ? (
							estadisticas.map((item, idx) => (
								<div
									key={`${item.textoArriba}-${idx}`}
									className="text-center transform hover:scale-105 transition-transform duration-200"
								>
									<dt className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
										{item.textoArriba}
									</dt>
									<dd className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										{item.textoAbajo}
									</dd>
								</div>
							))
						) : (
							<>
								<div className="text-center">
									<dt className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
										+5
									</dt>
									<dd className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Años de experiencia
									</dd>
								</div>

								<div className="text-center">
									<dt className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
										+500
									</dt>
									<dd className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Clientes satisfechos
									</dd>
								</div>

								<div className="text-center">
									<dt className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
										24/7
									</dt>
									<dd className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Soporte por WhatsApp
									</dd>
								</div>

								<div className="text-center">
									<dt className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
										Variedad
									</dt>
									<dd className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Opciones para todos los gustos
									</dd>
								</div>
							</>
						)}
					</dl>
				</div>
			</section>

			{/* Values */}
			<section
				className="py-16 md:py-20 lg:py-24 bg-muted/40"
				aria-labelledby="por-que-elegirnos"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-8 md:mb-12 max-w-3xl">
						<p className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-3">
							Nuestro trabajo
						</p>
						<h2
							id="por-que-elegirnos"
							className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4"
						>
							Por qué elegirnos
						</h2>
						<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
							Ropa bien hecha, atención cercana y precios transparentes.
							Trabajamos con talleres locales para ofrecer prendas con buen
							acabado.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
						<article className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-card p-6 md:p-8 shadow">
							<div
								className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
								aria-hidden
							/>
							<div className="relative space-y-3">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
									Buena calidad
								</p>
								<h3 className="text-lg md:text-xl font-semibold text-foreground">
									Materiales duraderos
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Seleccionamos telas y controles de producción para asegurarnos
									de que las prendas mantengan su forma y color.
								</p>
							</div>
						</article>

						<article className="relative overflow-hidden rounded-2xl border-2 border-secondary/20 bg-card p-6 md:p-8 shadow">
							<div
								className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-secondary/15 blur-3xl"
								aria-hidden
							/>
							<div className="relative space-y-3">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
									Precios justos
								</p>
								<h3 className="text-lg md:text-xl font-semibold text-foreground">
									Transparencia en precios
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Colaboramos directo con talleres para evitar intermediarios y
									mantener precios equilibrados sin sacrificar acabados.
								</p>
							</div>
						</article>

						<article className="relative overflow-hidden rounded-2xl border-2 border-accent/20 bg-card p-6 md:p-8 shadow">
							<div
								className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/15 blur-3xl"
								aria-hidden
							/>
							<div className="relative space-y-3">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
									Producción local
								</p>
								<h3 className="text-lg md:text-xl font-semibold text-foreground">
									Hecho en Perú
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Todas nuestras piezas se producen en talleres locales,
									apoyando la economía y facilitando controles de calidad.
								</p>
							</div>
						</article>
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
							Uniformes, colecciones o piezas únicas. Cuéntanos tu idea y te
							damos una propuesta clara y sin sorpresas.
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
