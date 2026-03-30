import type { NextConfig } from "next";

// Helper to parse your API URL
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const strapiAddr = new URL(STRAPI_URL);

const nextConfig: NextConfig = {
	// Performance optimizations
	reactStrictMode: false,
	cacheComponents: true,
	cacheLife: {
		products: {
			stale: 3600, // 1 hour client-side
			revalidate: 900, // 15 mins server background refresh
			expire: 86400, // 1 day hard expiry
		},
		favourites: {
			/** * Keep it for a long time on the client.
			 * User's don't expect their favorite list to change unless they click 'remove'.
			 */
			stale: 86400, // 24 hours client-side
			/** * Check Strapi for price/stock updates every 5 minutes.
			 * Since people often "watch" favorites for price drops, we check more often than general products.
			 */
			revalidate: 300,
			/** * Hard expiry after a week.
			 * If they haven't checked their favorites in 7 days, clear the cache entry.
			 */
			expire: 604800,
		},
		// MEDIUM: For Categories (Added occasionally)
		categories: {
			stale: 86400, // 1 day
			revalidate: 3600, // 1 hour background refresh
			expire: 604800, // 1 week hard expiry
		},
		// SLOW: For Store Settings (Rarely changes)
		settings: {
			stale: 604800, // 1 week
			revalidate: 86400, // 1 day background refresh
			expire: 2592000, // 30 days hard expiry
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
		removeConsole: process.env.NODE_ENV === "production",
	},

	// Compression
	compress: true,

	// Experimental features for performance

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
