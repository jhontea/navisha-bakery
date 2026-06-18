import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full font-bold uppercase tracking-wider";
    
    const variants = {
      default: "bg-surface-container-high text-on-surface-variant",
      success: "bg-green-100 text-green-700",
      warning: "bg-gold-500/10 text-gold-500",
      error: "bg-error-container text-on-error-container",
      info: "bg-primary-container text-on-primary-container",
    };

    const sizes = {
      sm: "px-2 py-1 text-[10px]",
      md: "px-3 py-1 text-xs",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;