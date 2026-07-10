import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import type { Rarity } from '../../types/common'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'rarity' | 'difficulty' | 'status'
  size?: 'sm' | 'md'
  rarity?: Rarity
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'rarity', size = 'md', rarity, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium uppercase tracking-wider rounded-full'
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    }

    const variants = {
      rarity: rarity ? `bg-${rarity}-500/10 text-${rarity}-400` : 'bg-gray-500/10 text-gray-400',
      difficulty: 'bg-amber-main/10 text-amber-main',
      status: 'bg-blue-500/10 text-blue-400',
    }

    return (
      <span
        ref={ref}
        className={cn(baseStyles, sizes[size], variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'