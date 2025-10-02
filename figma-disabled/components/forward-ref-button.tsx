import { forwardRef } from "react";
import { Button } from "./ui/button";
import type { ButtonProps } from "./ui/button";

interface ForwardRefButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ForwardRefButton = forwardRef<HTMLButtonElement, ForwardRefButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <Button ref={ref} {...props}>
        {children}
      </Button>
    );
  }
);

ForwardRefButton.displayName = "ForwardRefButton";