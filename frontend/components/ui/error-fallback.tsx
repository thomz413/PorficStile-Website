import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorFallbackProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
	retryText?: string;
	showBackButton?: boolean;
	backText?: string;
	variant?: "page" | "card" | "inline";
}

export function ErrorFallback({
	title = "Algo salió mal",
	message = "No se pudo cargar el contenido. Por favor, intenta de nuevo.",
	onRetry,
	retryText = "Intentar de nuevo",
	showBackButton = true,
	backText = "Volver",
	variant = "page"
}: ErrorFallbackProps) {
	const variantStyles = {
		page: "min-h-screen bg-background flex items-center justify-center p-6",
		card: "bg-white rounded-lg border p-6 text-center",
		inline: "flex flex-col items-center gap-4 p-4 text-center"
	};

	const contentStyles = {
		page: "max-w-md w-full space-y-6",
		card: "space-y-4",
		inline: "space-y-2"
	};

	return (
		<div className={variantStyles[variant]}>
			<div className={contentStyles[variant]}>
				<AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
				
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						{title}
					</h3>
					<p className="text-sm text-gray-600">
						{message}
					</p>
				</div>

				<div className="flex gap-3 justify-center">
					{onRetry && (
						<Button onClick={onRetry} size="sm">
							<RefreshCw className="w-4 h-4 mr-2" />
							{retryText}
						</Button>
					)}
					
					{showBackButton && (
						<Button variant="outline" size="sm" asChild>
							<Link href="/productos">
								<ArrowLeft className="w-4 h-4 mr-2" />
								{backText}
							</Link>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

export function NetworkErrorFallback({ onRetry }: { onRetry?: () => void }) {
	return (
		<ErrorFallback
			title="Error de conexión"
			message="No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo."
			onRetry={onRetry}
			retryText="Reintentar conexión"
		/>
	);
}

export function TimeoutErrorFallback({ onRetry }: { onRetry?: () => void }) {
	return (
		<ErrorFallback
			title="Tiempo de espera agotado"
			message="El servidor está tardando demasiado en responder. Esto puede pasar cuando el servicio está iniciando. ¿Intentar de nuevo?"
			onRetry={onRetry}
			retryText="Reintentar"
		/>
	);
}

export function NotFoundFallback() {
	return (
		<ErrorFallback
			title="Producto no encontrado"
			message="El producto que buscas no existe o ha sido eliminado."
			showBackButton={true}
			backText="Ver todos los productos"
		/>
	);
}
