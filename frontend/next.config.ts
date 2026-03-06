import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ["placehold.co", "localhost"],
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "1337",
				pathname: "/uploads/**",
			},
		],
		dangerouslyAllowLocalIP: true,
	},
};

export default nextConfig;
