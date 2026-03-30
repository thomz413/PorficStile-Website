import { cache } from "react";
import { STRAPI_URL } from "@/lib/constants";

interface RetryOptions {
	maxRetries?: number;
	retryDelay?: number;
	timeout?: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
	maxRetries: 3,
	retryDelay: 1000,
	timeout: 15000,
};

async function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
	url: string,
	options: RequestInit = {},
	retryOptions: RetryOptions = {}
): Promise<Response> {
	const { maxRetries = 3, retryDelay = 1000, timeout = 15000 } = { ...DEFAULT_OPTIONS, ...retryOptions };
	
	let lastError: Error;
	
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);
			
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});
			
			clearTimeout(timeoutId);
			
			if (response.ok) {
				return response;
			}
			
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		} catch (error) {
			lastError = error as Error;
			
			// Don't retry on 4xx errors
			if (error instanceof Error && (error as any).status?.toString()?.startsWith('4')) {
				throw error;
			}
			
			// Log retry attempt
			console.warn(`Attempt ${attempt}/${maxRetries} failed for ${url}:`, error);
			
			if (attempt < maxRetries) {
				await sleep(retryDelay * attempt); // Exponential backoff
			}
		}
	}
	
	throw lastError!;
}

// Cached wrapper for retry logic
export function withRetry<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	options: RetryOptions = {}
): T {
	return cache(async (...args: Parameters<T>) => {
		return fn(...args);
	}) as T;
}

// Enhanced fetch with retry logic
export async function fetchStrapiWithRetry(
	endpoint: string,
	options: RequestInit = {},
	retryOptions: RetryOptions = {}
): Promise<Response> {
	const url = endpoint.startsWith('http') ? endpoint : `${STRAPI_URL}${endpoint}`;
	
	return fetchWithRetry(url, options, retryOptions);
}
