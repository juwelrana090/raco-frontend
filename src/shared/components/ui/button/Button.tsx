import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loader?: React.ReactNode;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-4 py-3 text-sm',
  md: 'px-5 py-3.5 text-sm',
  lg: 'px-6 py-4 text-base',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed',
  outline:
    'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loader,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2';
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && loader}
      {isLoading ? 'Loading...' : children}
    </button>
  );
}