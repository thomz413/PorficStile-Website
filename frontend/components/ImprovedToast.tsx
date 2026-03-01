"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export interface Toast {
	id: string;
	type: "success" | "error" | "info" | "warning";
	title: string;
	message: string;
	duration?: number;
}

interface ToastProps {
	toast: Toast;
	onRemove: (id: string) => void;
}

function SingleToast({ toast, onRemove }: ToastProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);

	useEffect(() => {
		// Enter animation
		setIsVisible(true);

		// Auto remove after duration
		const timer = setTimeout(() => {
			setIsLeaving(true);
			setTimeout(() => onRemove(toast.id), 300);
		}, toast.duration || 5000);

		return () => clearTimeout(timer);
	}, [toast.id, toast.duration, onRemove]);

	const getIcon = () => {
		switch (toast.type) {
			case "success":
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case "error":
				return <AlertCircle className="h-5 w-5 text-red-500" />;
			case "warning":
				return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
			case "info":
			default:
				return <Info className="h-5 w-5 text-blue-500" />;
		}
	};

	const getBackgroundClass = () => {
		switch (toast.type) {
			case "success":
				return "bg-green-50 border-green-200";
			case "error":
				return "bg-red-50 border-red-200";
			case "warning":
				return "bg-yellow-50 border-yellow-200";
			case "info":
			default:
				return "bg-blue-50 border-blue-200";
		}
	};

	const getTitleClass = () => {
		switch (toast.type) {
			case "success":
				return "text-green-800";
			case "error":
				return "text-red-800";
			case "warning":
				return "text-yellow-800";
			case "info":
			default:
				return "text-blue-800";
		}
	};

	const getMessageClass = () => {
		switch (toast.type) {
			case "success":
				return "text-green-700";
			case "error":
				return "text-red-700";
			case "warning":
				return "text-yellow-700";
			case "info":
			default:
				return "text-blue-700";
		}
	};

	return (
		<div
			className={`
        relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        min-w-[320px] max-w-[400px]
        transform transition-all duration-300 ease-out
        ${getBackgroundClass()}
        ${isVisible && !isLeaving ? "translate-y-0 opacity-100 scale-100" : "translate-y-full opacity-0 scale-95"}
      `}
		>
			{/* Icon */}
			<div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<h4 className={`font-semibold text-sm ${getTitleClass()}`}>
					{toast.title}
				</h4>
				<p className={`text-sm mt-1 ${getMessageClass()} break-words`}>
					{toast.message}
				</p>
			</div>

			{/* Close button */}
			<button
				onClick={() => {
					setIsLeaving(true);
					setTimeout(() => onRemove(toast.id), 300);
				}}
				className={`
          flex-shrink-0 p-1 rounded-md transition-colors
          hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1
          ${getTitleClass()}
        `}
			>
				<X className="h-4 w-4" />
			</button>

			{/* Progress bar */}
			<div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg animate-pulse" />
		</div>
	);
}

interface ToastContainerProps {
	toasts: Toast[];
	onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
	if (toasts.length === 0) return null;

	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
			<div className="flex flex-col gap-2 pointer-events-auto">
				{toasts.map((toast) => (
					<SingleToast key={toast.id} toast={toast} onRemove={onRemove} />
				))}
			</div>
		</div>
	);
}

// Toast Context
interface ToastContextType {
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
	undefined,
);

export function useToast() {
	const context = React.useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within ToastProvider");
	}
	return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = (toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast: Toast = { ...toast, id };
		setToasts((prev) => [...prev, newToast]);
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	};

	return (
		<ToastContext.Provider value={{ addToast, removeToast }}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
}
