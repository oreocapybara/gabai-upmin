import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "gyjfqhfxtjqibitzspbs.supabase.co",
			},
		],
	},
};

export default nextConfig;
