'use client';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : toast.type === 'error'
              ? 'bg-white dark:bg-gray-800 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              : 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />}
          {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />}
          <div className="flex-1 leading-snug">{toast.message}</div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
