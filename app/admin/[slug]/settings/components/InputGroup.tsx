import React from "react";

interface Option {
  value: string | number;
  label: string;
}

interface InputGroupProps {
  id?: string;
  label?: string;
  labelRight?: React.ReactNode;
  helperText?: string;
  error?: string;
  icon?: React.ElementType;
  as?: "input" | "textarea" | "select";
  options?: Option[];
  type?: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function InputGroup({
  label,
  labelRight,
  helperText,
  error,
  icon: Icon,
  as = "input",
  options = [],
  type = "text",
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  required = false,
  className = "",
}: InputGroupProps) {
  const baseInputStyles =
    "w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || labelRight) && (
        <div className="flex items-center justify-between ml-1">
          {label && (
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              {label}
              {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {labelRight && <div>{labelRight}</div>}
        </div>
      )}

      <div className="relative">
        {Icon && as !== "textarea" && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        {as === "textarea" ? (
          <textarea
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} p-4 leading-relaxed`}
          />
        ) : as === "select" ? (
          <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} py-3 ${Icon ? "pl-11" : "px-4"} pr-8 cursor-pointer font-sans`}
          >
            {options.map((opt) => (
              <option
                key={String(opt.value)}
                value={opt.value}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} py-3 ${Icon ? "pl-11" : "px-4"} pr-4`}
          />
        )}
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-rose-500 ml-1">{error}</p>
      ) : (
        helperText && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}