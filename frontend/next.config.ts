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
		products: {
			stale: 3600,      // 1 hour: Browser won't even ask the server for a refresh.
			revalidate: 1800,  // 30 mins: Server checks Strapi in the background.
			expire: 86400,    // 1 day: If no one visits for a day, delete the cache.
		},

		// 2. FAVORITES: The "User-Specific"
		// Since these are specific to the user's session/ID, we keep them long-term.
		favourites: {
			stale: 604800,    // 1 week: Keep it on the client; it's very "sticky".
			revalidate: 3600, // 1 hour: Only check for price/stock changes once an hour.
			expire: 2592000,  // 30 days: Monthly cleanup.
		},

		// 3. CATEGORIES: The "Structural"
		// Categories (Men, Women, Tech, etc.) almost NEVER change.
		// Only hit Strapi once every 12 hours.
		categories: {
			stale: 604800,     // 1 week client-side.
			revalidate: 43200, // 12 hours: Background refresh twice a day.
			expire: 2592000,   // 30 days.
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
