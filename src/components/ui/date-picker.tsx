'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/cn';
import { CalendarIcon } from 'lucide-react';
import { formatDate } from '@/lib/formatter';
import { useState } from 'react';

type DatePickerProps = {
  id?: string;
  /** `YYYY-MM-DD` */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

function parseDateValue(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toDateValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * shadcn date picker: Calendar inside a Popover.
 */
export function DatePicker({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = 'Pick a date',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDateValue(value);
  const selectedLabel = selected ? formatDate(selected) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="size-4" />
          {selected ? selectedLabel : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date ? toDateValue(date) : '');
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
