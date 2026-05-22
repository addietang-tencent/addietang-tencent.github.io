import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-[#E5E5E5] bg-white transition-colors outline-none",
        "hover:border-[#1447E6]",
        "data-[state=checked]:bg-[#355EF1] data-[state=checked]:border-[#1447E6] data-[state=checked]:text-white",
        "data-[state=indeterminate]:bg-[#355EF1] data-[state=indeterminate]:border-[#1447E6] data-[state=indeterminate]:text-white",
        "focus-visible:border-[#1447E6] focus-visible:ring-2 focus-visible:ring-[#355EF1]/20",
        "disabled:cursor-not-allowed disabled:bg-[#f3f3f4] disabled:border-[#E5E5E5] disabled:data-[state=checked]:bg-[#d3d6db] disabled:data-[state=checked]:border-[#E5E5E5]",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
