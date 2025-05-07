import type React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: string
  opacity?: string
  border?: boolean
  glow?: boolean
}

export function GlassCard({
  children,
  className,
  blur = "backdrop-blur-md",
  opacity = "bg-white/30 dark:bg-black/30",
  border = true,
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        blur,
        opacity,
        border && "border border-white/20",
        glow && "shadow-[0_0_15px_rgba(255,255,255,0.2)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
