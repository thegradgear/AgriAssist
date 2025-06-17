
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
  asChild?: boolean // This prop dictates if THIS Button instance uses Slot
  href?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: useSlotParam = false, href, children, ...restProps }, ref) => {
    // Determine the component to render:
    // 1. If this Button instance is explicitly told to use Slot (`useSlotParam` is true), then use Slot.
    // 2. Else, if an `href` is provided (often by <Link asChild>), it should render as an anchor tag `<a>`.
    // 3. Otherwise, it renders as a standard `<button>`.
    const Comp = useSlotParam ? Slot : (restProps as any).href || href ? "a" : "button";

    // `restProps` already excludes `asChild` because it was destructured into `useSlotParam`.
    // So, if `Comp` is 'a' or 'button', `asChild` will not be in `restProps` that get spread.
    // This correctly prevents `asChild` from appearing as a DOM attribute.

    const effectiveProps: React.AllHTMLAttributes<HTMLElement> & Record<string, any> = { ...restProps };
    
    // If Comp is 'a', ensure href is present in the props.
    // The `href` could come from the Button's own `href` prop or from `restProps.href` (passed by Link).
    if (Comp === 'a') {
      effectiveProps.href = href || (restProps as any).href;
    }
    
    // If Comp is 'button' and href is somehow in restProps, remove it as it's not valid for button.
    if (Comp === 'button' && effectiveProps.href) {
        delete effectiveProps.href;
    }


    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...effectiveProps}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
