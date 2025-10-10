import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-smooth disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "gradient-primary text-primary-foreground shadow-soft hover:shadow-medium hover:scale-[1.02] focus-visible:ring-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:shadow-medium hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-border bg-background shadow-soft hover:shadow-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:shadow-medium hover:bg-secondary/80 focus-visible:ring-secondary/20",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-soft focus-visible:ring-accent/20",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-6 text-base has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
