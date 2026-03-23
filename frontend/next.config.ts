import type { NextConfig } from "next";

// Helper to parse your API URL
const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const strapiAddr = new URL(STRAPI_URL);

const nextConfig: NextConfig = {
	cacheComponents: true,
	cacheLife: {
		products: {
			stale: 300,
			revalidate: 3600,
			expire: 86400,
		},
	},
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: strapiAddr.protocol.slice(0, -1) as "http" | "https",
				hostname: strapiAddr.hostname,
				// Only include port if it's actually defined (like in localhost)
				port: strapiAddr.port !== "" ? strapiAddr.port : undefined,
				pathname: "/uploads/**",
			},
			{
				protocol: "https",
				hostname: "placehold.co",
				pathname: "/**",
			},
		],
		dangerouslyAllowSVG: false,
		dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
	},
};

export default nextConfig;
