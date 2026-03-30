import type { NextConfig } from "next";

// Helper to parse your API URL
//const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const STRAPI_URL = "https://big-festival-62d725d687.strapiapp.com";

const strapiAddr = new URL(STRAPI_URL);

const nextConfig: NextConfig = {
	// Performance optimizations
	reactStrictMode: false,
	cacheComponents: true,
	cacheLife: {
		// 1. PRODUCTS: Managed via Strapi Webhooks
		products: {
			stale: 86400,         // 1 day browser safety net
			revalidate: 31536000, // 1 year (Wait for manual/webhook trigger)
			expire: 31536000,     // 1 year
		},

		// 2. FAVORITES: User-specific data
		favourites: {
			stale: 604800,        // 1 week client-side persistence
			revalidate: 3600,     // 1 hour check for stock/price updates
			expire: 2592000,      // 30 days
		},

		// 3. CATEGORIES: Structural navigation
		categories: {
			stale: 86400,         // 1 day browser safety net
			revalidate: 31536000, // 1 year (Wait for manual/webhook trigger)
			expire: 31536000,
		},

		// 4. SETTINGS: Global store configuration
		settings: {
			stale: 86400,         // 1 day browser safety net
			revalidate: 31536000, // 1 year (Wait for manual/webhook trigger)
			expire: 31536000,
		},
	},

	// Image optimizations
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: strapiAddr.protocol.slice(0, -1) as "http" | "https",
				hostname: strapiAddr.hostname,
				port: strapiAddr.port !== "" ? strapiAddr.port : undefined,
				pathname: "/uploads/**",
			},
			{
				protocol: "https",
				hostname: "placehold.co",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.media.strapiapp.com",
				pathname: "/**",
			},
		],
		dangerouslyAllowSVG: false,
		dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
	},

	// Build optimizations
	compiler: {
		//removeConsole: process.env.NODE_ENV === "production",
		removeConsole: false,
	},

	// Compression
	compress: true,

	// Experimental features for performance
	experimental: {
		optimizeCss: true,
		optimizeServerReact: true,
	},

	// Headers for caching and security
	async headers() {
		return [
			{
				source: "/images/(.*)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/_next/static/(.*)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},

	// Redirects for SEO
	async redirects() {
		return [];
	},
};

export default nextConfig;
