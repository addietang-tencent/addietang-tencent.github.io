/**
 * DatePicker - Custom date picker using Popover + Calendar
 * Brand color: #1447E6 (consistent with Input component)
 */
import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  /** Value in YYYY-MM-DD format */
  value?: string;
  /** Callback with YYYY-MM-DD string */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Min date in YYYY-MM-DD format */
  min?: string;
  /** Max date in YYYY-MM-DD format */
  max?: string;
  /** Additional className for the trigger button */
  className?: string;
}

/** Parse YYYY-MM-DD string to Date (local timezone) */
function parseDateString(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  // Validate the date is real
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return undefined;
  }
  return date;
}

/** Format Date to YYYY-MM-DD string */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function DatePicker({
  value,
  onChange,
  placeholder = "选择日期",
  disabled = false,
  min,
  max,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = parseDateString(value);
  const minDate = parseDateString(min);
  const maxDate = parseDateString(max);

  const handleSelect = (day: Date | undefined) => {
    if (day && onChange) {
      onChange(formatDate(day));
    }
    setOpen(false);
  };

  // Build disabled matcher for react-day-picker
  const disabledMatcher = React.useMemo(() => {
    const matchers: Array<{ before: Date } | { after: Date }> = [];
    if (minDate) {
      matchers.push({ before: minDate });
    }
    if (maxDate) {
      matchers.push({ after: maxDate });
    }
    return matchers.length > 0 ? matchers : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex items-center justify-between gap-2 h-9 px-3 text-sm rounded-[4px] border border-[#E5E5E5] bg-white transition-colors cursor-pointer select-none whitespace-nowrap",
            "hover:border-[#1447E6]",
            "focus:outline-none focus:border-[#1447E6]",
            "focus-visible:outline-none focus-visible:border-[#1447E6]",
            open && "border-[#1447E6]",
            disabled &&
              "bg-[#FAFAFA] border-[#E5E5E5] text-[#b0b6c3] cursor-not-allowed hover:border-[#E5E5E5]",
            className
          )}
        >
          <span
            className={cn(
              "truncate",
              value ? "text-[#020617]" : "text-[#b0b6c3]"
            )}
          >
            {value || placeholder}
          </span>
          <CalendarIcon className="w-4 h-4 shrink-0 text-[#b0b6c3]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate}
          disabled={disabledMatcher}
          classNames={{
            today:
              "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[#1447E6]",
          }}
          className="[&_[data-selected-single=true]]:bg-[#1447E6] [&_[data-selected-single=true]]:text-white [&_[data-selected-single=true]]:hover:bg-[#1447E6] [&_[data-selected-single=true]]:hover:text-white [&_button:not([data-selected-single=true]):hover]:bg-[#eff4ff]"
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
