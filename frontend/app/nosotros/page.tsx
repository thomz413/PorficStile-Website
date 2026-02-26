import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { getSettings } from "@/lib/strapi";

export const metadata = {
	title: "Nosotros - Moda Peru",
	description:
		"Quiénes somos. Moda Peru: ropa y textiles peruanos con envíos a todo el Perú.",
};

export default async function NosotrosPage() {
	const settings = await getSettings();

	const descripcionTienda =
		settings?.descripcionTienda ??
		"Somos un negocio online que trabaja con talleres en Perú. Buscamos buena calidad y precios justos en ropa y textiles que representen al país.";

	const estadisticas = settings?.estadisticas ?? [];
	const whatsappNumber = settings?.numeroWhatsapp;

	return (
		<main className="min-h-screen bg-background">
			<Header />

			{/* Hero / Intro */}
			<section className="border-b border-border bg-linear-to-r from-background via-background to-primary/5 py-16 md:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 md:grid-cols-[1.2fr_minmax(0,1fr)] items-center">
					<div className="space-y-6">
						<p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
							Sobre nosotros
						</p>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
							Moda peruana, <span className="text-primary">hecha en Perú</span>
						</h1>
						<p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
							{descripcionTienda}
						</p>
					</div>

					<div className="relative">
						<div className="absolute -inset-6 rounded-3xl bg-primary/10 blur-3xl" />
						<div className="relative rounded-3xl border border-border bg-card/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
							<p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-4">
								Tienda online
							</p>
							<p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
								Trabajamos con talleres locales. Cercanía con quien confecciona
								para cuidar detalles y mantener precios bajos con buena calidad.
							</p>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide">
										Enfoque
									</p>
									<p className="font-medium text-foreground">
										Mayoristas y minoristas
									</p>
								</div>
								<div>
									<p className="text-xs uppercase text-muted-foreground font-medium tracking-wide">
										Envíos
									</p>
									<p className="font-medium text-foreground">A todo el Perú</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats / Highlights */}
			<section className="bg-linear-to-r from-secondary to-secondary/90 text-white py-12 md:py-16 relative overflow-hidden">
				<div className="absolute inset-0 pattern-geometric opacity-10" />
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
					<div className="mb-10">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
							En números
						</h2>
						<p className="mt-3 text-sm md:text-base text-white/80 max-w-xl">
							Clientes, pedidos y años atendiendo por WhatsApp.
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
						{estadisticas.length > 0 ? (
							estadisticas.map((item, idx) => (
								<div
									key={idx}
									className="text-left md:text-center transform hover:scale-110 transition-transform duration-300"
								>
									<p className="text-3xl md:text-4xl font-bold mb-1">
										{item.textoArriba}
									</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										{item.textoAbajo}
									</p>
								</div>
							))
						) : (
							<>
								<div className="text-left md:text-center">
									<p className="text-3xl md:text-4xl font-bold mb-1">+5</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Años de experiencia
									</p>
								</div>
								<div className="text-left md:text-center">
									<p className="text-3xl md:text-4xl font-bold mb-1">+500</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Clientes
									</p>
								</div>
								<div className="text-left md:text-center">
									<p className="text-3xl md:text-4xl font-bold mb-1">24/7</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Atendemos por WhatsApp
									</p>
								</div>
								<div className="text-left md:text-center">
									<p className="text-3xl md:text-4xl font-bold mb-1">100%</p>
									<p className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
										Producción local
									</p>
								</div>
							</>
						)}
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="py-20 md:py-24 bg-muted/40">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 md:mb-16 max-w-3xl">
						<p className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-3">
							Valores
						</p>
						<h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
							Qué nos importa
						</h2>
						<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
							Talleres, clientes y familias que nos eligen para sus pedidos.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
						<div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-card p-6 md:p-8 shadow-lg">
							<div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
							<div className="relative space-y-3">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
									Alta calidad
								</p>
								<h3 className="text-xl font-semibold text-foreground">
									Prendas que duran
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Revisamos materiales y acabados. Muchos clientes nos piden
									para revender; la prenda tiene que aguantar.
								</p>
							</div>
						</div>

						<div className="relative overflow-hidden rounded-2xl border-2 border-secondary/20 bg-card p-6 md:p-8 shadow-lg">
							<div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-secondary/15 blur-3xl" />
							<div className="relative space-y-3">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
									Precios bajos
								</p>
								<h3 className="text-xl font-semibold text-foreground">
									Directo contigo
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Atendemos por WhatsApp. Pedidos a medida, ajustes y respuestas
									rápidas.
								</p>
							</div>
						</div>

						<div className="relative overflow-hidden rounded-2xl border-2 border-accent/20 bg-card p-6 md:p-8 shadow-lg">
							<div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/15 blur-3xl" />
							<div className="relative space-y-3">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
									Hecho en Perú
								</p>
								<h3 className="text-xl font-semibold text-foreground">
									Diseños que representan
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Colores, texturas y detalles pensados para el mercado peruano.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border bg-card py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-12">
					<div className="flex-1 space-y-3">
						<p className="text-xs font-medium text-primary uppercase tracking-[0.2em]">
							Proyectos y mayoristas
						</p>
						<h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
							¿Tienes tienda o marca?
						</h2>
						<p className="text-sm md:text-base text-muted-foreground max-w-xl">
							Colecciones, uniformes o lotes. Cuéntanos qué necesitas y te
							respondemos por WhatsApp.
						</p>
					</div>

					<div className="flex-1 w-full md:w-auto">
						<WhatsAppCTA
							whatsappNumber={whatsappNumber}
							message="Hola, me gustaría hablar sobre un proyecto o pedido para mi tienda."
							label="Escribir por WhatsApp"
							className="w-full justify-center bg-primary border-primary hover:bg-primary/90"
						/>
					</div>
				</div>
			</section>
		</main>
	);
}
