"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const ToastContext = React.createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...toast }]);

    // 自动移除 toast
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    toast: context.addToast,
    dismiss: context.removeToast,
    toasts: context.toasts,
  };
}

function ToastContainer() {
  const { toasts, removeToast } = React.useContext(ToastContext);

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "p-4 rounded-md shadow-lg flex flex-col gap-1 w-72 animate-slide-up border",
            toast.variant === "destructive"
              ? "bg-destructive text-destructive-foreground border-destructive"
              : "bg-background border-border"
          )}
        >
          <div className="flex items-center justify-between">
            {toast.title && <h4 className="font-medium">{toast.title}</h4>}
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto rounded-full p-1 hover:bg-muted/50"
            >
              <X size={14} />
            </button>
          </div>
          {toast.description && <p className="text-sm">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
}
