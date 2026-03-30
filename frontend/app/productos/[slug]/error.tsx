"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Product detail page error:", error);
	}, [error]);

	return (
		<div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
			<AlertCircle className="w-16 h-16 text-red-500 mb-6" />
			<h2 className="text-3xl font-bold text-gray-900 mb-4">
				¡Ups! Algo salió mal
			</h2>
			<p className="text-gray-600 max-w-md mb-8">
				Tuvimos un problema al cargar los detalles de este producto. Por favor, 
				intenta recargar la página o vuelve al inicio.
			</p>
			
			<div className="flex gap-4">
				<Button 
					onClick={() => reset()}
					variant="default"
				>
					Intentar de nuevo
				</Button>
				<Button asChild variant="outline">
					<Link href="/productos">Volver a Productos</Link>
				</Button>
			</div>
		</div>
	);
}
