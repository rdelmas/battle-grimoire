import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import type { Rarity } from '../../types/common'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  rarity?: Rarity
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, rarity, hover = false, children, ...props }, ref) => {
    const rarityColors: Record<Rarity, string> = {
      common: 'border-rarity-common',
      uncommon: 'border-rarity-uncommon',
      rare: 'border-rarity-rare',
      'very-rare': 'border-rarity-very-rare',
      legendary: 'border-rarity-legendary',
      artifact: 'border-rarity-artifact',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-card border border-border-main rounded-xl overflow-hidden transition-all duration-300',
          hover && 'hover:border-border-hover hover:shadow-lg',
          rarity && rarityColors[rarity],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-border-main', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardHeader.displayName = 'CardHeader'

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardContent.displayName = 'CardContent'

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-border-main bg-bg-surface/50', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardFooter.displayName = 'CardFooter'