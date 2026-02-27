"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export interface ToastProps {
	id: string;
	type: "success" | "error" | "info";
	title: string;
	message?: string;
	duration?: number;
}

interface ToastComponentProps {
	toast: ToastProps;
	onClose: (id: string) => void;
}

function ToastComponent({ toast, onClose }: ToastComponentProps) {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose(toast.id);
		}, toast.duration || 5000);

		return () => clearTimeout(timer);
	}, [toast.id, toast.duration, onClose]);

	const icons = {
		success: <CheckCircle className="h-5 w-5 text-green-500" />,
		error: <AlertCircle className="h-5 w-5 text-red-500" />,
		info: <Info className="h-5 w-5 text-blue-500" />
	};

	const backgrounds = {
		success: "bg-green-50 border-green-200",
		error: "bg-red-50 border-red-200", 
		info: "bg-blue-50 border-blue-200"
	};

	return (
		<div className={`
			max-w-sm w-full bg-white border rounded-lg shadow-lg pointer-events-auto
			transform transition-all duration-300 ease-in-out
			${backgrounds[toast.type]}
		`}>
			<div className="p-4">
				<div className="flex items-start">
					<div className="flex-shrink-0">
						{icons[toast.type]}
					</div>
					<div className="ml-3 w-0 flex-1">
						<p className="text-sm font-medium text-gray-900">
							{toast.title}
						</p>
						{toast.message && (
							<p className="mt-1 text-sm text-gray-500">
								{toast.message}
							</p>
						)}
					</div>
					<div className="ml-4 flex-shrink-0 flex">
						<button
							className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
							onClick={() => onClose(toast.id)}
						>
							<span className="sr-only">Cerrar</span>
							<X className="h-5 w-5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ToastContainer({ 
	toasts, 
	onRemoveToast 
}: { 
	toasts: ToastProps[];
	onRemoveToast: (id: string) => void;
}) {
	return (
		<div className="fixed top-4 right-4 z-50 space-y-2">
			{toasts.map((toast) => (
				<ToastComponent
					key={toast.id}
					toast={toast}
					onClose={onRemoveToast}
				/>
			))}
		</div>
	);
}

// Toast context for easy usage throughout the app
import { createContext, useContext, ReactNode } from "react";

interface ToastContextType {
	addToast: (toast: Omit<ToastProps, 'id'>) => void;
	removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastProps[]>([]);

	const addToast = (toast: Omit<ToastProps, 'id'>) => {
		const id = Math.random().toString(36).substr(2, 9);
		setToasts(prev => [...prev, { ...toast, id }]);
	};

	const removeToast = (id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id));
	};

	return (
		<ToastContext.Provider value={{ addToast, removeToast }}>
			{children}
			<ToastContainer toasts={toasts} onRemoveToast={removeToast} />
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
}
