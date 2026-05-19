import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-[3px] focus-visible:ring-[#355EF1]/20 focus-visible:outline-none aria-invalid:border-[#d42a1e] transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#355EF1] text-white [a&]:hover:bg-[#355EF1]/90",
        secondary:
          "border-transparent bg-[#f3f3f4] text-[#020617] [a&]:hover:bg-[#f3f3f4]/80",
        destructive:
          "border-transparent bg-[#d42a1e] text-white [a&]:hover:bg-[#d42a1e]/90 focus-visible:ring-[#d42a1e]/20",
        outline:
          "text-[#020617] border-[#d3d6db] [a&]:hover:bg-[#f5f5f5]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
