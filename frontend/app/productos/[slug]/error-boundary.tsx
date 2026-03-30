"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ProductDetail Error Boundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-background flex items-center justify-center p-6">
					<div className="max-w-md w-full text-center space-y-6">
						<AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
						<div>
							<h1 className="text-2xl font-bold text-gray-900 mb-2">
								Error en la página del producto
							</h1>
							<p className="text-gray-600">
								No se pudo cargar la información del producto. Por favor, intenta recargar la página.
							</p>
						</div>
						<div className="flex gap-4 justify-center">
							<Button onClick={() => window.location.reload()}>
								Recargar página
							</Button>
							<Button variant="outline" asChild>
								<Link href="/productos">Volver a productos</Link>
							</Button>
						</div>
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className="text-left text-xs text-gray-500 mt-4">
								<summary className="cursor-pointer">Error details (dev only)</summary>
								<pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
									{this.state.error.stack}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
