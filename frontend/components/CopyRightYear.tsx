"use client";

import { useEffect, useState } from "react";

export default function CopyrightYear() {
	const [year, setYear] = useState<number | null>(null);

	useEffect(() => {
		// This runs ONLY on the client after the first render
		setYear(new Date().getFullYear());
	}, []);

	// Render a placeholder (like 2025 or nothing) while waiting for mount
	return <>{year ?? "2026"}</>;
}
