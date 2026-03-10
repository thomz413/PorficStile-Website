import Link from "next/link";
import { MapPin, Mail } from "lucide-react";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import CopyrightYear from "@/components/CopyRightYear";
import Image from "next/image";

export default function Footer({
	whatsappNumber,
}: {
	whatsappNumber?: string;
}) {
	return (
		<footer className="bg-[#0f172a] text-slate-200 pt-20 pb-10 relative overflow-hidden border-t border-white/5">
			{/* Subtle Decorative Elements */}
			<div className="absolute inset-0 pattern-geometric opacity-[0.03] pointer-events-none" />
			<div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[120px] -translate-y-1/2" />

			<div className="relative mx-auto max-w-7xl px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
					{/* Brand Column */}
					<div className="lg:col-span-4 space-y-8 flex flex-col items-start">
						<div className="flex flex-col items-start">
							<h3 className="sr-only">ATLANTIS PORFIC STILE</h3>

							{/* Logo: Fixed height prevents layout jumps */}
							<div className="relative h-12 w-48 mb-3">
								<Image
									src="/AtlantisTitle.svg"
									alt="ATLANTIS"
									fill
									className="object-contain object-left"
									priority
								/>
							</div>

							{/* Tagline: Refined for luxury feel */}
							<span className="text-sm text-gold-shimmer font-bold uppercase tracking-[0.5em] leading-none ml-1">
								PORFIC STILE
							</span>
						</div>

						<p className="text-slate-400 leading-relaxed text-sm max-w-[320px]">
							Elevando la moda premium peruana. Fusionamos técnicas ancestrales
							con cortes contemporáneos para la mujer que lidera su propia
							historia.
						</p>

						{/* Socials: More subtle approach */}
						<div className="flex items-center gap-4 pt-2">
							<SocialLink
								href="#"
								icon={<FaInstagram size={18} />}
								label="Instagram"
							/>
							<SocialLink
								href="#"
								icon={<FaTiktok size={18} />}
								label="TikTok"
							/>
							<SocialLink
								href="#"
								icon={<FaFacebook size={18} />}
								label="Facebook"
							/>
						</div>
					</div>

					{/* Quick Links Group */}
					<div className="lg:col-span-5 grid grid-cols-2 gap-8">
						<div>
							<h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">
								Colecciones
							</h4>
							<ul className="space-y-4 text-sm">
								<FooterLink href="/productos">Todas las Piezas</FooterLink>
								<FooterLink href="/productos?destacado=true">
									Edición Limitada
								</FooterLink>
								<FooterLink href="/nosotros">Nuestra Esencia</FooterLink>
								<FooterLink href="/blog">Estilo & Tendencias</FooterLink>
							</ul>
						</div>
						<div>
							<h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">
								Atención
							</h4>
							<ul className="space-y-4 text-sm">
								<FooterLink href="/contacto">Asesoría de Imagen</FooterLink>
								<FooterLink href="/contacto">Ventas al por Mayor</FooterLink>
								<FooterLink href="/envios">Políticas de Envío</FooterLink>
								<FooterLink href="/faq">Preguntas Frecuentes</FooterLink>
							</ul>
						</div>
					</div>

					{/* Contact/Location Column */}
					<div className="lg:col-span-3 space-y-6">
						<h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">
							Visítanos
						</h4>
						<div className="space-y-4 text-sm">
							<div className="flex gap-3 items-start group">
								<MapPin
									size={18}
									className="text-accent shrink-0 group-hover:scale-110 transition-transform"
								/>
								<p className="text-slate-400">
									Galería Santa Lucía, <br />
									Piso 7, Tienda 709 <br />
									Gamarra, Lima - Perú
								</p>
							</div>
							<div className="flex gap-3 items-center text-slate-400">
								<Mail size={18} className="text-accent" />
								<span>contacto@atlantisporfic.com</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="order-2 md:order-1 text-center md:text-left">
						<p className="text-slate-500 text-xs tracking-wide">
							© <CopyrightYear /> ATLANTIS PORFIC STILE.{" "}
							<br className="md:hidden" />
							HECHO CON PASIÓN EN PERÚ.
						</p>
					</div>

					<div className="order-1 md:order-2 flex flex-col items-center md:items-end gap-3">
						{whatsappNumber && (
							<div className="flex items-center gap-4 bg-white/5 p-1 pl-4 rounded-full border border-white/10">
								<span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
									Soporte VIP
								</span>
								<WhatsAppCTA
									whatsappNumber={whatsappNumber}
									messageConfig={{
										type: "general_question",
									}}
									label="WhatsApp"
									className="rounded-full bg-accent text-accent-foreground px-6 py-2 text-xs font-bold hover:brightness-110 transition-all"
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</footer>
	);
}

/** Helper Components for Cleaner Code */

function FooterLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<li>
			<Link
				href={href}
				className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
			>
				{children}
			</Link>
		</li>
	);
}

function SocialLink({
	href,
	icon,
	label,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={label}
			className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
		>
			{icon}
		</a>
	);
}
