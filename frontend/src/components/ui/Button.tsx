import React from 'react';
import { cn } from '@/src/utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loading?: boolean; // alias
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const busy = isLoading || loading;

    const variants = {
      primary:
        'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-[0.98]',
      secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
      outline:
        'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800',
      danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-xl font-bold',
      md: 'px-5 py-2.5 text-sm rounded-xl font-bold',
      lg: 'px-8 py-3.5 text-base rounded-2xl font-black',
      xl: 'px-10 py-5 text-lg rounded-3xl font-black',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || busy}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {busy ? (
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!busy && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Default export for pages that import `import Button from ...`
export default Button;