import React from "react";
import { ArrowPathIcon, CheckIcon } from "@heroicons/react/24/outline";

interface SaveButtonProps {
  isSaving?: boolean;
  label?: string;
  savingLabel?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export function SaveButton({
  isSaving = false,
  label = "Save Configuration",
  savingLabel = "Saving...",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: SaveButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isSaving || disabled}
      className={`flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer ${className}`}
    >
      {isSaving ? (
        <ArrowPathIcon className="h-4 w-4 animate-spin" />
      ) : (
        <CheckIcon className="h-4 w-4 stroke-[3]" />
      )}
      <span>{isSaving ? savingLabel : label}</span>
    </button>
  );
}