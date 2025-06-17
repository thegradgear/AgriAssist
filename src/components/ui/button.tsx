
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  href?: string // Added to explicitly type href
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: ownAsChild = false, ...remainingProps }, ref) => {
    const hasHref = typeof remainingProps.href === 'string';
    const Comp = ownAsChild ? Slot : hasHref ? "a" : "button";

    // Prepare final props, removing asChild if Comp is a DOM element and asChild was passed from parent
    const finalProps: { [key: string]: any } = { ...remainingProps };
    if (Comp !== Slot && finalProps.asChild !== undefined) {
      delete finalProps.asChild;
    }
    
    // If Comp is 'a' but ownAsChild is false, ensure href is passed.
    // If Comp is 'button', ensure href is not passed if it exists (though browsers might tolerate it).
    // The main goal is to ensure 'asChild' is not passed to DOM elements.

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...finalProps}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
