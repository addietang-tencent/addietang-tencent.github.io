import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  titleAccessory?: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
};

export function AdminPageHeader({
  title,
  description,
  titleAccessory,
  actions,
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: AdminPageHeaderProps) {
  return (
    <div
      data-slot="admin-page-header"
      className={cn(
        "flex items-start justify-between gap-4 flex-wrap mb-6",
        className
      )}
    >
      <div className={cn("min-w-0", actions && "flex-1", contentClassName)}>
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            className={cn(
              "font-sans text-[28px] font-medium leading-[36px] text-[#020617]",
              titleClassName
            )}
          >
            {title}
          </h1>
          {titleAccessory}
        </div>
        {description ? (
          <p
            className={cn(
              "font-sans text-xs font-normal leading-[14px] text-[#596980] mt-2",
              descriptionClassName
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div
          className={cn(
            "flex items-center gap-2 flex-wrap shrink-0",
            actionsClassName
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
