"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

export function FadeIn({
	children,
	delay = 0,
	className = "",
	direction = "up",
}: {
	children: ReactNode;
	delay?: number;
	className?: string;
	direction?: "up" | "down" | "left" | "right" | "none";
}) {
	const directions = {
		up: { y: 40, x: 0 },
		down: { y: -40, x: 0 },
		left: { x: 40, y: 0 },
		right: { x: -40, y: 0 },
		none: { x: 0, y: 0 },
	};

	return (
		<motion.div
			initial={{ opacity: 0, ...directions[direction] }}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
			viewport={{ once: true, margin: "-100px" }}
			transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function TextReveal({
	text,
	className = "",
}: {
	text: string;
	className?: string;
}) {
	const words = text.split(" ");

	const container: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1, delayChildren: 0.1 },
		},
	};

	const child: Variants = {
		hidden: { opacity: 0, y: 40, rotateX: -40 },
		visible: {
			opacity: 1,
			y: 0,
			rotateX: 0,
			// 'as const' ensures "spring" is treated as the literal type "spring"
			transition: { type: "spring", damping: 15, stiffness: 100 } as const,
		},
	};

	return (
		<motion.div
			variants={container}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-100px" }}
			className={`flex flex-wrap ${className}`}
			style={{ perspective: "1000px" }}
		>
			{words.map((word, index) => (
				<motion.span
					variants={child}
					key={index}
					className="mr-[0.25em] inline-block"
				>
					{word}
				</motion.span>
			))}
		</motion.div>
	);
}

export function StaggerContainer({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-100px" }}
			variants={{
				visible: { transition: { staggerChildren: 0.15 } },
				hidden: {},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function StaggerItem({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 30 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: 0.6, ease: "easeOut" },
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}
