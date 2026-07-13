import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, iconLeft, iconRight, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn('block text-sm font-medium text-text-muted mb-1.5', label && 'mb-1.5')}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-dark">
              {iconLeft}
            </div>
          )}
           <input
             ref={ref}
             id={inputId}
             className={cn(
               'w-full bg-bg-surface border border-border-main rounded-lg px-4 py-2.5 text-text-main placeholder-text-dark transition-all duration-200',
               'focus:outline-none focus:ring-2 focus:ring-amber-main focus:border-amber-main',
               'disabled:opacity-50 disabled:cursor-not-allowed',
               error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
               iconLeft && 'pl-10',
               iconRight && 'pr-10',
               className
             )}
             aria-invalid={error ? 'true' : 'false'}
             aria-describedby={error ? `${inputId}-error` : undefined}
             {...props}
           />
          {iconRight && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-dark">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'