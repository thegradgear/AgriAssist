
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
  asChild?: boolean;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: propAsChild = false, href: propHref, children, ...rest }, ref) => {
    // Determine if this Button instance should use Slot, based on its own asChild prop.
    const useSlot = propAsChild;

    // Determine the component to render.
    // If a href is present (either passed directly to Button or via rest props from a parent Link), it's an anchor.
    // Otherwise, if not using Slot, it's a button. If using Slot, Comp will be Slot.
    const hasHref = propHref || (rest as any).href;

    let Comp: React.ElementType = 'button'; // Default
    if (useSlot) {
      Comp = Slot;
    } else if (hasHref) {
      Comp = 'a';
    }

    // Prepare props for the Comp
    const effectiveProps: React.AllHTMLAttributes<HTMLElement> & Record<string, any> = { ...rest };
    if (Comp === 'a') {
      effectiveProps.href = propHref || (rest as any).href;
    }

    // CRITICAL: If Comp is a DOM element ('a' or 'button'), ensure 'asChild' from a parent (e.g. Link) is not passed.
    // 'asChild' is not a valid DOM attribute. 'propAsChild' is the Button's own configuration.
    // The 'asChild' potentially in 'rest' would be from a parent like <Link asChild>.
    if ((Comp === 'a' || Comp === 'button') && 'asChild' in effectiveProps) {
      delete (effectiveProps as any).asChild;
    }
    
    // If Comp is 'button' and href is somehow in effectiveProps, remove it as it's not valid for button.
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
