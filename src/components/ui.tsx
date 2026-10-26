"use client";

import { X } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useEffect } from "react";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger" | "soil";
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-leaf-600 text-white hover:bg-leaf-700 shadow-sm shadow-leaf-600/20 disabled:bg-leaf-300",
    soil: "bg-soil-500 text-white hover:bg-soil-600 disabled:opacity-60",
    outline: "border border-leaf-300 text-leaf-700 hover:bg-leaf-50 bg-white",
    ghost: "text-leaf-700 hover:bg-leaf-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-leaf-800">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-leaf-600/70">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-leaf-200 bg-white px-3.5 py-2.5 text-sm text-leaf-900 outline-none transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 placeholder:text-leaf-400";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-leaf-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="animate-fade-up max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-leaf-900">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-leaf-600">{description}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-leaf-500 transition hover:bg-leaf-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-leaf-200 bg-leaf-50/40 px-6 py-12 text-center">
      <div className="mb-3 rounded-2xl bg-white p-3 text-leaf-500 shadow-sm">{icon}</div>
      <h4 className="font-semibold text-leaf-900">{title}</h4>
      <p className="mt-1 max-w-sm text-sm text-leaf-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Spinner({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-leaf-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-leaf-200 border-t-leaf-600" />
      {label}
    </div>
  );
}
