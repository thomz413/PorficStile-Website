"use client";

import { useSyncExternalStore } from "react";

// A dummy subscriber since the year doesn't change while the user is on the page
const subscribe = () => () => {};

export default function CopyrightYear() {
	// 1. Subscribe function
	// 2. Client-side value (Runs only in the browser)
	// 3. Server-side fallback (Runs only on the server, keeping Next.js happy)
	const year = useSyncExternalStore(
		subscribe,
		() => new Date().getFullYear(),
		() => 2026
	);

	return <>{year}</>;
}