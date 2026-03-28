export default function Loading() {
	return (
		<div className="w-full animate-pulse min-h-screen bg-gray-50 pt-21">
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="h-5 w-40 bg-gray-200 rounded-md" />
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					<div className="space-y-4">
						<div className="aspect-square w-full bg-gray-200 rounded-2xl" />
						<div className="flex gap-4 overflow-hidden">
							<div className="h-20 w-20 md:h-24 md:w-24 shrink-0 bg-gray-200 rounded-xl" />
							<div className="h-20 w-20 md:h-24 md:w-24 shrink-0 bg-gray-200 rounded-xl" />
							<div className="h-20 w-20 md:h-24 md:w-24 shrink-0 bg-gray-200 rounded-xl" />
							<div className="h-20 w-20 md:h-24 md:w-24 shrink-0 bg-gray-200 rounded-xl hidden sm:block" />
						</div>
					</div>

					<div className="space-y-6 pt-2 md:pt-6">
						<div className="h-6 w-24 bg-gray-200 rounded-full" />
						<div className="space-y-3">
							<div className="h-9 w-full bg-gray-300 rounded-lg" />
							<div className="h-9 w-3/4 bg-gray-300 rounded-lg" />
						</div>
						<div className="h-10 w-1/3 bg-gray-200 rounded-lg pt-2" />
						<div className="pt-4 space-y-4">
							<div className="h-5 w-16 bg-gray-200 rounded" />
							<div className="flex gap-3">
								<div className="h-10 w-14 bg-gray-200 rounded-md" />
								<div className="h-10 w-14 bg-gray-200 rounded-md" />
								<div className="h-10 w-14 bg-gray-200 rounded-md" />
							</div>
						</div>
						<div className="pt-4 space-y-3">
							<div className="h-5 w-20 bg-gray-200 rounded" />
							<div className="flex items-center gap-3">
								<div className="h-9 w-32 bg-gray-200 rounded-md" />
								<div className="h-9 w-40 bg-gray-300 rounded-md" />
							</div>
							<div className="h-4 w-28 bg-gray-200 rounded mt-2" />
						</div>
						<div className="space-y-4 pt-8">
							<div className="h-12 w-full bg-gray-300 rounded-md" />
							<div className="h-12 w-full bg-gray-200 rounded-md" />
							<div className="h-12 w-full bg-gray-200 rounded-md" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
