"use client";

import { useMemo, useState, useEffect } from "react";
import { generateWhatsAppMessage, WhatsAppMessageConfig } from "@/lib/whatsapp";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppCTAProps {
	whatsappNumber?: string | null;
	message?: string;
	messageConfig?: WhatsAppMessageConfig;
	variant?: "button" | "sticky" | "card";
	className?: string;
	label?: string;
}

export default function WhatsAppCTA({
	whatsappNumber,
	message,
	messageConfig,
	variant = "button",
	className = "",
	label = "Escribir por WhatsApp",
}: WhatsAppCTAProps) {
	const [isClient, setIsClient] = useState(false);

	// Initialize client state after mount
	useEffect(() => {
		setIsClient(true);
	}, []);

	// 1. PERFORMANCE: Memoize URL calculation so it doesn't run on every render
	const whatsappURL = useMemo(() => {
		if (!whatsappNumber) return "";

		const cleanNumber = whatsappNumber.replace(/[^\d]/g, "");
		const finalMessage = messageConfig
			? generateWhatsAppMessage(messageConfig)
			: message || "Hola, me interesa conocer más sobre sus prendas.";

		return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(finalMessage)}`;
	}, [whatsappNumber, message, messageConfig]);

	// If there is no configured WhatsApp number, we don't render CTA.
	if (!whatsappNumber) return null;

	// Pre-computed stable values
	const ariaLabel = `Abrir WhatsApp: ${label}`;
	const externalLinkProps = {
		target: "_blank",
		rel: "noopener noreferrer",
		"aria-label": ariaLabel,
	};

	// Pre-computed stable class names
	const stickyClasses = `fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-full bg-secondary text-white shadow-2xl hover:bg-secondary/90 transition-all hover:scale-110 border-2 border-transparent hover:border-white/20 group ${className}`;
	const cardClasses = `block rounded-xl border-2 border-secondary/20 p-6 bg-secondary/5 hover:bg-secondary/10 transition-all text-center group ${className}`;
	const buttonClasses = `inline-flex items-center justify-center gap-3 rounded-none bg-secondary px-8 py-4 font-bold text-white hover:bg-secondary/90 transition-all border-2 border-transparent hover:shadow-lg group uppercase tracking-wide ${className}`;

	// 3. SEMANTICS: Using <button> for better accessibility and hydration consistency
	if (variant === "sticky") {
		return (
			<button
				onClick={() => isClient && window.open(whatsappURL, '_blank', 'noopener,noreferrer')}
				className={stickyClasses}
				title="Contactar por WhatsApp"
				aria-label={ariaLabel}
				type="button"
			>
				<FaWhatsapp className="h-7 w-7 group-hover:rotate-12 transition-transform" />
			</button>
		);
	}

	if (variant === "card") {
		return (
			<button
				onClick={() => isClient && window.open(whatsappURL, '_blank', 'noopener,noreferrer')}
				className={cardClasses}
				aria-label={ariaLabel}
				type="button"
			>
				<div className="flex items-center justify-center mb-3 text-secondary">
					<FaWhatsapp className="h-8 w-8 group-hover:rotate-12 transition-transform" />
				</div>
				<h3 className="font-semibold text-lg text-foreground mb-2">{label}</h3>
				<p className="text-sm text-muted-foreground">
					Atención directa y personalizada
				</p>
			</button>
		);
	}

	return (
		<button
			onClick={() => isClient && window.open(whatsappURL, '_blank', 'noopener,noreferrer')}
			className={buttonClasses}
			aria-label={ariaLabel}
			type="button"
		>
			<FaWhatsapp className="h-6 w-6 group-hover:rotate-12 transition-transform" />
			<span>{label}</span>
		</button>
	);
}
