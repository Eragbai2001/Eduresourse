import * as React from "react";

// Using type instead of interface to avoid TypeScript's empty interface warning
type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
        className || ""
      }`}
      ref={ref}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
