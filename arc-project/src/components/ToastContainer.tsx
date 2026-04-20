'use client';

import { Toast } from '@/types';
import { Check, X, Info } from 'lucide-react';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const borderColor =
          toast.type === 'success' ? '#4CAF50' : toast.type === 'error' ? '#F44336' : '#66FCF1';
        const Icon = toast.type === 'success' ? Check : toast.type === 'error' ? X : Info;
        return (
          <div
            key={toast.id}
            role="alert"
            aria-live="polite"
            className="flex items-start gap-3 min-w-[280px] max-w-[400px] px-4 py-3 font-mono text-sm"
            style={{
              background: '#1F2833',
              borderLeft: `3px solid ${borderColor}`,
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Icon size={16} style={{ color: borderColor, flexShrink: 0, marginTop: 2 }} />
            <span className="text-arc-text flex-1">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-arc-text-secondary hover:text-arc-text transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
