"use client";

import { useState, useEffect, Suspense } from "react";
import { ErrorFallback, TimeoutErrorFallback, NetworkErrorFallback } from "@/components/ui/error-fallback";
import { ProductDetailSkeleton } from "@/components/ui/loading-skeleton";
import ProductDetailClient from "./ProductDetailContent";

type ErrorType = "timeout" | "network" | "validation" | "unknown" | "no-data";

interface RetryState {
	shouldRetry: boolean;
	attempt: number;
	maxRetries: number;
}

export default function ProductDetailClientWithRetry({
	product,
	footerSettings,
}: {
	product: any;
	footerSettings?: any;
}) {
	const [error, setError] = useState<{ type: ErrorType; message: string } | null>(null);
	const [retryState, setRetryState] = useState<RetryState>({
		shouldRetry: false,
		attempt: 0,
		maxRetries: 3,
	});
	const [isLoading, setIsLoading] = useState(false);

	// Check if we need to fetch data on client side
	const needsClientFetch = !product;

	// Detect error type and provide appropriate fallback
	const getErrorType = (error: any): ErrorType => {
		if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
			return "timeout";
		}
		if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
			return "network";
		}
		if (error?.message?.includes('validation')) {
			return "validation";
		}
		return "unknown";
	};

	// Client-side data fetching with retry logic
	const fetchProductData = async (slug: string) => {
		setIsLoading(true);
		try {
			// Instead of importing server-only modules that break the client,
			// we just ping the Strapi server directly to wake it up.
			const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
			const pingUrl = `${strapiUrl}/api/configuracion`;
			
			let isAwake = false;
			
			// Retry loop to give Strapi time to wake up
			for (let i = 0; i < 5; i++) {
				try {
					const res = await fetch(pingUrl, { cache: 'no-store' });
					if (res.ok) {
						isAwake = true;
						break;
					}
				} catch (e) {
					console.log("Ping attempt failed, Strapi might still be waking up...", e);
				}
				// Wait 2 seconds before next ping
				await new Promise(r => setTimeout(r, 2000));
			}

			if (isAwake) {
				// Strapi is awake! Reload the page so the server can SSR fetch and render it.
				window.location.reload();
				return;
			}
			
			throw new Error("timeout");
			
		} catch (fetchError) {
			console.error("Client-side fetch error:", fetchError);
			const errorType = getErrorType(fetchError);
			setError({
				type: errorType,
				message: fetchError instanceof Error ? fetchError.message : "Fetch failed"
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Retry handler
	const handleRetry = () => {
		if (retryState.attempt < retryState.maxRetries) {
			setRetryState(prev => ({
				...prev,
				shouldRetry: true,
				attempt: prev.attempt + 1,
			}));
			setError(null);
			
			// If we need to fetch data, do it on client side
			if (needsClientFetch) {
				const slug = window.location.pathname.split('/').pop();
				if (slug) {
					fetchProductData(slug);
				}
			}
			
			// Reset retry flag after a short delay
			setTimeout(() => {
				setRetryState(prev => ({ ...prev, shouldRetry: false }));
			}, 100);
		}
	};

	// Error boundary simulation
	useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			console.error("ProductDetail error caught:", event.error);
			const errorType = getErrorType(event.error);
			setError({
				type: errorType,
				message: event.error?.message || "Unknown error occurred"
			});
		};

		window.addEventListener('error', handleError);
		return () => window.removeEventListener('error', handleError);
	}, []);

	// If we need to fetch data, show loading initially
	if (needsClientFetch && !isLoading && !error) {
		const slug = window.location.pathname.split('/').pop();
		if (slug) {
			fetchProductData(slug);
		}
		return <ProductDetailSkeleton />;
	}

	// Show loading during retry or fetch
	if (isLoading || retryState.shouldRetry) {
		return <ProductDetailSkeleton />;
	}

	// Show error fallback if there's an error
	if (error) {
		if (error.type === "no-data") {
			return (
				<ErrorFallback
					title="Producto no encontrado"
					message="El producto que buscas no existe o ha sido eliminado."
					showBackButton={true}
					backText="Ver todos los productos"
				/>
			);
		}

		const ErrorComponent = error.type === "timeout" 
			? TimeoutErrorFallback 
			: error.type === "network" 
			? NetworkErrorFallback 
			: ErrorFallback;

		return (
			<ErrorComponent
				onRetry={retryState.attempt < retryState.maxRetries ? handleRetry : undefined}
				retryText={retryState.attempt > 0 ? `Reintentar (${retryState.attempt}/${retryState.maxRetries})` : "Reintentar"}
			/>
		);
	}

	// Normal render with suspense for loading states
	return (
		<Suspense fallback={<ProductDetailSkeleton />}>
			<ProductDetailClient 
				product={product} 
				footerSettings={footerSettings} 
			/>
		</Suspense>
	);
}
