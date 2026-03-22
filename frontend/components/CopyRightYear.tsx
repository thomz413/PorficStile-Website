"use client";

import { useState } from "react";

export default function CopyrightYear() {
	const [year] = useState<number>(new Date().getFullYear());

	return <>{year}</>;
}