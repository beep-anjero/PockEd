'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-[var(--primary)] text-white hover:opacity-90 active:scale-[0.98] focus:ring-[var(--primary)] shadow-sm shadow-indigo-500/20',
      gradient:
        'bg-pocked-gradient text-white hover:opacity-95 active:scale-[0.98] focus:ring-[var(--primary)] shadow-md shadow-indigo-500/30',
      secondary:
        'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80 focus:ring-[var(--muted-foreground)]',
      outline:
        'border-2 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] focus:ring-[var(--muted-foreground)]',
      ghost:
        'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus:ring-[var(--muted-foreground)]',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-5 py-2.5 text-base rounded-xl',
      xl: 'px-7 py-3.5 text-lg rounded-2xl',
      icon: 'p-2 rounded-xl',
    };

    const Component = asChild ? 'span' : 'button';

    return (
      <Component
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Button.displayName = 'Button';
