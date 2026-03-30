import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
	variant?: "text" | "circular" | "rectangular" | "rounded";
	width?: string | number;
	height?: string | number;
}

export function Skeleton({ 
	className = "", 
	variant = "rectangular",
	width,
	height,
	...props 
}: SkeletonProps) {
	const variantClasses = {
		text: "h-4 w-full rounded",
		circular: "rounded-full",
		rectangular: "rounded-md",
		rounded: "rounded-xl",
	};

	const style = {
		...(width && { width: typeof width === 'number' ? `${width}px` : width }),
		...(height && { height: typeof height === 'number' ? `${height}px` : height }),
	};

	return (
		<div
			className={cn(
				"animate-pulse bg-muted",
				variantClasses[variant],
				className
			)}
			style={style}
			{...props}
		/>
	);
}

export function ProductDetailSkeleton() {
	return (
		<div className="min-h-screen bg-background pt-20 lg:pt-20">
			{/* Header placeholder */}
			<div className="h-20 bg-border animate-pulse" />
			
			{/* Breadcrumb */}
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<Skeleton className="h-6 w-32" variant="text" />
				</div>
			</div>

			{/* Main content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Image gallery */}
					<div className="space-y-4">
						<Skeleton className="aspect-square w-full" variant="rounded" height={500} />
						<div className="grid grid-cols-4 gap-2">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} className="aspect-square" variant="rounded" height={100} />
							))}
						</div>
					</div>

					{/* Product info */}
					<div className="space-y-6">
						<Skeleton className="h-8 w-32" variant="text" />
						<Skeleton className="h-10 w-3/4" variant="text" />
						
						<div className="space-y-2">
							<Skeleton className="h-8 w-40" variant="text" />
							<Skeleton className="h-6 w-24" variant="text" />
						</div>

						{/* Variant selector */}
						<div className="space-y-3">
							<Skeleton className="h-6 w-24" variant="text" />
							<div className="flex gap-2">
								{[1, 2, 3, 4].map((i) => (
									<Skeleton key={i} className="h-10 w-16" variant="rounded" />
								))}
							</div>
						</div>

						{/* Quantity selector */}
						<div className="space-y-3">
							<Skeleton className="h-6 w-24" variant="text" />
							<div className="flex items-center gap-3">
								<Skeleton className="h-10 w-10" variant="rounded" />
								<Skeleton className="h-10 w-20" variant="rounded" />
								<Skeleton className="h-10 w-10" variant="rounded" />
							</div>
						</div>

						{/* Buttons */}
						<div className="space-y-4 pt-6">
							<Skeleton className="h-14 w-full" variant="rounded" />
							<Skeleton className="h-14 w-full" variant="rounded" />
							<Skeleton className="h-14 w-full" variant="rounded" />
						</div>
					</div>
				</div>

				{/* Description section */}
				<div className="mt-16 pt-8 border-t">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						<div className="space-y-4">
							<Skeleton className="h-8 w-48" variant="text" />
							<div className="space-y-2">
								{[1, 2, 3, 4].map((i) => (
									<Skeleton key={i} className="h-6 w-full" variant="text" />
								))}
							</div>
						</div>
						<div className="space-y-4">
							<Skeleton className="h-8 w-32" variant="text" />
							<Skeleton className="h-6 w-full" variant="text" />
							<Skeleton className="h-14 w-full" variant="rounded" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ProductCardSkeleton() {
	return (
		<div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden">
			{/* Image */}
			<Skeleton className="aspect-[4/5] w-full" variant="rectangular" />
			
			{/* Content */}
			<div className="p-5 flex flex-col gap-2">
				<Skeleton className="h-4 w-20" variant="text" />
				<Skeleton className="h-6 w-full" variant="text" />
				<div className="flex items-center gap-2.5 pt-1">
					<Skeleton className="h-6 w-24" variant="text" />
				</div>
			</div>
		</div>
	);
}
