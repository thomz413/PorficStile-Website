import type { NextConfig } from "next";

// Helper to parse your API URL
const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const strapiAddr = new URL(STRAPI_URL);

const nextConfig: NextConfig = {
	// Performance optimizations
	cacheComponents: true,
	cacheLife: {
		products: {
			stale: 900,
			revalidate: 7200,
			expire: 86400,
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
