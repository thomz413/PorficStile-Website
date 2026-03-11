import type { NextConfig } from "next";

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
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "1337",
				pathname: "/uploads/**",
			},
			{
				protocol: "https",
				hostname: "placehold.co",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
