import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost'

export function pixelButtonClass(variant: Variant = 'ghost', className?: string) {
  return cn(
    'inline-flex min-h-11 items-center justify-center gap-2 border-2 px-5 py-3 font-pixel text-xs uppercase leading-none tracking-wide transition-[transform,box-shadow,color,background-color,border-color] duration-100',
    'shadow-[4px_4px_0_0_var(--border)] hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0_0_var(--border)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0',
    variant === 'primary'
      ? 'border-primary bg-primary text-primary-foreground hover:bg-foreground hover:border-foreground'
      : 'border-border bg-card text-foreground hover:border-primary hover:text-primary',
    className,
  )
}

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export function PixelButton({
  variant = 'ghost',
  className,
  type = 'button',
  ...props
}: PixelButtonProps) {
  return (
    <button type={type} className={pixelButtonClass(variant, className)} {...props} />
  )
}
