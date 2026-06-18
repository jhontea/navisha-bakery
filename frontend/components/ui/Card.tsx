import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, glass = false, className = "", children, ...props }, ref) => {
    const baseStyles = "rounded-xl border border-outline-variant/30 bg-surface-card shadow-sm";
    const hoverStyles = hover ? "transition-all duration-300 hover:shadow-md hover:-translate-y-1" : "";
    const glassStyles = glass ? "bg-white/85 backdrop-blur-md" : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${hoverStyles} ${glassStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;