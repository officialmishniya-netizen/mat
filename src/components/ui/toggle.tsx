import * as React from "react"
import { Button } from "./button"

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, onPressedChange, ...props }, ref) => (
    <Button
      ref={ref}
      variant={pressed ? "secondary" : "ghost"}
      onClick={(e) => {
        onPressedChange?.(!pressed);
        props.onClick?.(e);
      }}
      className={className}
      data-state={pressed ? "on" : "off"}
      {...props}
    />
  )
)
Toggle.displayName = "Toggle"

export { Toggle }
