// Base animation presets
export const animations = {
	fadeInUp: {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	},
	fadeInRight: {
		hidden: { opacity: 0, x: 20 },
		visible: { opacity: 1, x: 0 },
	},
	scaleIn: {
		hidden: { opacity: 0, scale: 0.95 },
		visible: { opacity: 1, scale: 1 },
	},
	container: {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	},
} as const;

// Default transition settings
export const transitions = {
	smooth: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
	fast: { duration: 0.3, ease: "easeOut" },
	bounce: { type: "spring", stiffness: 400, damping: 25 },
} as const;
