import Link from "next/link";
import { FadeIn } from "@/components/Animations";
import { MoveLeft, ArrowUpRight } from "lucide-react";

export default function NotFound() {
	return (
		<main className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
			{/* Background Grid - Reduced opacity for better content focus */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

			<div className="relative z-10 flex flex-col items-center max-w-md text-center">
				{/* 02. Typography - Tightened leading and tracking */}
				<FadeIn delay={0.2}>
					<h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight uppercase leading-[0.9] mb-6">
						Página No <br />
						<span className="text-muted-foreground/30 italic font-serif lowercase">
							Encontrada
						</span>
					</h1>
					<p className="text-sm text-muted-foreground/80 max-w-70 mx-auto leading-relaxed mb-10">
						El contenido que estás buscando ha sido movido o ya no existe en
						nuestra colección actual.
					</p>
				</FadeIn>

				{/* 03. Navigation - More substantial Lucide integration */}
				<div className="flex flex-col sm:flex-row items-center gap-6">
					<FadeIn delay={0.4}>
						<Link
							href="/"
							className="group flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-foreground bg-foreground/5 hover:bg-foreground hover:text-background px-6 py-3 transition-all duration-300"
						>
							<MoveLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
							Regresar
						</Link>
					</FadeIn>

					<FadeIn delay={0.5}>
						<Link
							href="/productos"
							className="group flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted-foreground hover:text-gold-shimmer transition-colors py-2"
						>
							Explorar Tienda
							<ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
						</Link>
					</FadeIn>
				</div>
			</div>
		</main>
	);
}
