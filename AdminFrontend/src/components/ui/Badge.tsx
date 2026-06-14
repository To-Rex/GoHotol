interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'danger' | 'warning' | 'default'
}

const variantStyles: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  default: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${variantStyles[variant]}`}>
      {children}
    </span>
  )
}
