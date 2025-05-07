// "use client"

// import type React from "react"

// import { useEffect, useRef } from "react"
// import { cn } from "@/lib/utils"

// interface AnimatedGradientProps extends React.HTMLAttributes<HTMLDivElement> {
//   colors?: string[]
//   speed?: number
// }

// export function AnimatedGradient({
//   children,
//   className,
//   colors = ["#4f46e5", "#0ea5e9", "#8b5cf6", "#ec4899"],
//   speed = 20,
//   ...props
// }: AnimatedGradientProps) {
//   const canvasRef = useRef<HTMLCanvasElement>(null)

//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return

//     const ctx = canvas.getContext("2d")
//     if (!ctx) return

//     let animationFrameId: number
//     let hue = 0

//     const resizeCanvas = () => {
//       canvas.width = window.innerWidth
//       canvas.height = window.innerHeight
//     }

//     const renderGradient = () => {
//       hue = (hue + 0.1) % 360

//       const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
//       colors.forEach((_, index) => {
//         const offset = index / (colors.length - 1)
//         const hueValue = (hue + index * 60) % 360
//         gradient.addColorStop(offset, `hsla(${hueValue}, 80%, 60%, 0.3)`)
//       })

//       ctx.fillStyle = gradient
//       ctx.fillRect(0, 0, canvas.width, canvas.height)

//       animationFrameId = requestAnimationFrame(renderGradient)
//     }

//     window.addEventListener("resize", resizeCanvas)
//     resizeCanvas()
//     renderGradient()

//     return () => {
//       window.removeEventListener("resize", resizeCanvas)
//       cancelAnimationFrame(animationFrameId)
//     }
//   }, [colors])

//   return (
//     <div className={cn("relative overflow-hidden", className)} {...props}>
//       <canvas ref={canvasRef} className="absolute inset-0 -z-10" />
//       {children}
//     </div>
//   )
// }
