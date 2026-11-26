'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastInput {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastInput, 'message' | 'type'>> {
  id: string;
  title?: string;
}

interface ToastContextValue {
  showToast: (input: ToastInput | string, type?: ToastType) => void;
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

const NOOP_TOAST: ToastContextValue = {
  showToast: () => {},
  toast: {
    success: () => {},
    error: () => {},
    info: () => {},
    warning: () => {},
  },
};

export function useToast(): ToastContextValue {
  return useContext(ToastContext) ?? NOOP_TOAST;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (input: ToastInput | string, typeOverride?: ToastType) => {
      const normalized: ToastInput =
        typeof input === 'string' ? { message: input, type: typeOverride ?? 'success' } : input;
      const type = normalized.type ?? typeOverride ?? 'success';
      const duration = normalized.duration ?? (type === 'error' ? 5500 : 4000);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((prev) => [...prev.slice(-4), { id, type, title: normalized.title, message: normalized.message }]);

      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  const toast = React.useMemo(
    () => ({
      success: (message: string, title?: string) => showToast({ type: 'success', message, title }),
      error: (message: string, title?: string) => showToast({ type: 'error', message, title }),
      info: (message: string, title?: string) => showToast({ type: 'info', message, title }),
      warning: (message: string, title?: string) => showToast({ type: 'warning', message, title }),
    }),
    [showToast]
  );

  const getStyle = (type: ToastType) => {
    switch (type) {
      case 'error':
        return {
          container: 'border-rose-200 border-l-4 border-l-[#8B1515]',
          iconWrap: 'bg-rose-50 text-[#8B1515]',
          Icon: AlertCircle,
          defaultTitle: 'Action Failed',
        };
      case 'warning':
        return {
          container: 'border-amber-200 border-l-4 border-l-amber-500',
          iconWrap: 'bg-amber-50 text-amber-600',
          Icon: AlertTriangle,
          defaultTitle: 'Notice',
        };
      case 'info':
        return {
          container: 'border-slate-200 border-l-4 border-l-slate-700',
          iconWrap: 'bg-slate-100 text-slate-700',
          Icon: Info,
          defaultTitle: 'Update',
        };
      default:
        return {
          container: 'border-emerald-200 border-l-4 border-l-emerald-600',
          iconWrap: 'bg-emerald-50 text-emerald-700',
          Icon: CheckCircle2,
          defaultTitle: 'Saved',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}

      {/* Global Toast Stack */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((item) => {
          const style = getStyle(item.type);
          const Icon = style.Icon;
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto bg-white rounded-xl shadow-xl border px-3.5 py-3 flex items-start gap-3 animate-fadeIn ${style.container}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${style.iconWrap}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {item.title || style.defaultTitle}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-snug break-words">
                  {item.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
