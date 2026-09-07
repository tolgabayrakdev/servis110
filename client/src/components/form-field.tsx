import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactNode,
} from "react";
import { Label } from "./ui/label";

export function FormField({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  const controls = Children.map(children, (child) => {
    if (!isValidElement<{ id?: string; "aria-labelledby"?: string }>(child))
      return child;
    if (child.type === "datalist" || child.type === "div") return child;
    return cloneElement(child, {
      id: child.props.id ?? id,
      "aria-labelledby": child.props["aria-labelledby"] ?? `${id}-label`,
    });
  });
  return (
    <div className="grid min-w-0 gap-2">
      <Label
        id={`${id}-label`}
        htmlFor={id}
        className="text-sm font-medium text-secondary-foreground"
      >
        {label}
        {required && (
          <span className="text-muted-foreground" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {controls}
    </div>
  );
}
