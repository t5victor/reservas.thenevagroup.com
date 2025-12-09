import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import type { DayPickerSingleProps } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

type CalendarProps = DayPickerSingleProps & {
  className?: string;
};

const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(' ');

const Calendar = ({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 text-sm text-zinc-100', className)}
      classNames={{
        months: 'flex flex-col gap-4 sm:flex-row sm:space-x-6',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center text-zinc-100',
        caption_label: 'text-sm font-semibold uppercase text-zinc-200',
        nav: 'space-x-1 flex items-center text-zinc-200',
        nav_button:
          'h-7 w-7 rounded-md border border-zinc-700 bg-transparent p-0 hover:bg-zinc-800 transition',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1 text-zinc-200',
        head_row: 'flex',
        head_cell: 'text-zinc-400 rounded-md w-9 font-medium text-[0.75rem]',
        row: 'flex w-full mt-2',
        cell: 'relative p-0 text-center text-sm',
        day: cn(
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-lg flex items-center justify-center',
          'text-zinc-100 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500'
        ),
        day_selected: 'bg-zinc-50 text-zinc-900 hover:bg-zinc-50 hover:text-zinc-900 font-semibold',
        day_today: 'border border-zinc-600 text-white font-semibold',
        day_outside: 'text-zinc-500 opacity-60',
        day_disabled: 'text-zinc-700 cursor-not-allowed opacity-40',
        day_range_middle: 'aria-selected:bg-zinc-200 aria-selected:text-zinc-900',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        ),
        IconRight: () => (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        ),
      }}
      {...props}
    />
  );
};

Calendar.displayName = 'Calendar';

export { Calendar };
