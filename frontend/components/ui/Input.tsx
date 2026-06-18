"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-surface-container-low border-2 rounded-lg py-3 px-4
              font-body-md text-body-md text-on-surface
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? "pl-10" : ""}
              ${error ? "border-error" : "border-outline-variant"}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-error font-body-sm">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;