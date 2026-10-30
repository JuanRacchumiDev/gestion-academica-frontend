import React from "react";
import { FormLabel } from "../ui/form";
import { cn } from "../../lib/utils";

interface RequiredLabelProps {
  children: React.ReactNode;
  className?: string;
  isRequired?: boolean;
}

export const RequiredLabel: React.FC<RequiredLabelProps> = ({
  children,
  className,
  isRequired = false,
}) => (
  <FormLabel className={cn("text-xs font-semibold text-gray-700", className)}>
    {children} {isRequired && <span className="text-red-500">*</span>}
  </FormLabel>
);
