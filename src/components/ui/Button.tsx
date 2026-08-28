import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Navy on gold, never white: the brand gold is light enough that white text
  // on it lands around 1.8:1.
  primary: "bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-sm hover:shadow-md",
  secondary: "bg-navy-900 text-white hover:bg-navy-800 shadow-sm hover:shadow-md",
  outline: "border border-navy-200 bg-white text-navy-900 hover:border-navy-300 hover:bg-navy-50",
  ghost: "text-navy-900 hover:bg-navy-50",
  whatsapp: "bg-whatsapp text-white hover:brightness-95 shadow-sm hover:shadow-md",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-base gap-2",
  lg: "h-13 px-8 text-base sm:text-lg gap-2.5",
};

/*
 * Shared with anything styled to look like a Button (next-intl <Link>, <a>), so
 * link-CTAs and real buttons stay identical. The -translate-y on hover is the
 * site's core "this is interactive" signal; it's transform-only so it stays on
 * the compositor.
 */
export function buttonVariants(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(
    "group inline-flex items-center justify-center rounded-full font-semibold",
    "transition-[transform,box-shadow,background-color,border-color,filter] duration-200 ease-out-soft",
    "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants(variant, size), className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";
