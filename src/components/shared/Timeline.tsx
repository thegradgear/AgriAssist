
import * as React from "react";
import { cn } from "@/lib/utils";

const TimelineContext = React.createContext<{ isLastItem?: boolean }>({});

interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ children, className, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    return (
      <ol ref={ref} className={cn("flex flex-col", className)} {...props}>
        {childArray.map((child, i) => (
          <TimelineContext.Provider
            key={i}
            value={{ isLastItem: i === childArray.length - 1 }}
          >
            {child}
          </TimelineContext.Provider>
        ))}
      </ol>
    );
  }
);
Timeline.displayName = "Timeline";

interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("flex flex-row items-start", className)}
        {...props}
      >
        {children}
      </li>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

interface TimelineConnectorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  TimelineConnectorProps
>(({ className, ...props }, ref) => {
  const { isLastItem } = React.useContext(TimelineContext);
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center mr-4",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "w-0.5 h-full min-h-[1.5rem]", 
          isLastItem ? "bg-transparent" : "bg-border" 
        )}
      />
    </div>
  );
});
TimelineConnector.displayName = "TimelineConnector";


interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-start pb-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineHeader.displayName = "TimelineHeader";

interface TimelineIconProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineIcon = React.forwardRef<HTMLDivElement, TimelineIconProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute -left-[calc(1rem+2px)] -translate-x-1/2 mt-0.5", 
          "flex items-center justify-center w-7 h-7 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md",
          className
        )}
        style={{ marginLeft: '-1.5px' }} 
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineIcon.displayName = "TimelineIcon";


interface TimelineTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  TimelineTitleProps
>(({ className, children, ...props }, ref) => {
  return (
    <h3 // This is an H3 equivalent
      ref={ref}
      className={cn("text-xl font-medium leading-snug text-foreground ml-8 font-headline", className)} // H3: text-xl, font-medium, leading-snug
      {...props}
    >
      {children}
    </h3>
  );
});
TimelineTitle.displayName = "TimelineTitle";


interface TimelineDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  TimelineDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground ml-8 leading-normal", className)} // Small text, leading-normal
      {...props}
    >
      {children}
    </p>
  );
});
TimelineDescription.displayName = "TimelineDescription";

interface TimelineBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineBody = React.forwardRef<HTMLDivElement, TimelineBodyProps>(
  ({ className, children, ...props }, ref) => {
    const { isLastItem } = React.useContext(TimelineContext);
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 py-1",
          isLastItem ? "pb-0" : "pb-6", 
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineBody.displayName = "TimelineBody";


export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineTitle,
  TimelineDescription,
  TimelineBody,
};
