// Corrected: Manual Lucide "ChevronLeft" icon
export const ChevronLeftIcon = ({ className = "w-6 h-6", ...props }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2" /* Changed from stroke-width */
		strokeLinecap="round" /* Changed from stroke-linecap */
		strokeLinejoin="round" /* Changed from stroke-linejoin */
		className={`lucide lucide-chevron-left ${className}`}
		{...props}
	>
		<path d="m15 18-6-6 6-6" />
	</svg>
);
