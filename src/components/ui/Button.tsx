import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-lavender-400/40 select-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] tracking-tight';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2 font-medium',
    lg: 'text-sm px-5 py-2.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-lavender-400 hover:bg-[#BCA7FB] text-[#111318] font-semibold border border-lavender-300/40 shadow-sm shadow-lavender-400/10',
    secondary: 'bg-[#232732] hover:bg-[#2B303D] text-gray-200 hover:text-white border border-white/[0.08] shadow-sm',
    outline: 'border border-white/10 hover:border-white/20 text-gray-300 hover:text-white bg-transparent',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/[0.05] border border-transparent',
    danger: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
