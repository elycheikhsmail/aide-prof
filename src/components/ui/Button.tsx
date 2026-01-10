import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  'data-testid'?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  'data-testid': testId,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-4 focus:ring-blue-300',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      data-testid={testId}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
