import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import type { DayPickerSingleProps } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

type CalendarProps = DayPickerSingleProps & {
  className?: string;
};

const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(' ');

const Calendar = ({
  className,
  classNames,
  styles,
  showOutsideDays = true,
  mode = 'single',
  ...props
}: CalendarProps) => {
  return (
    <DayPicker
      mode={mode}
      showOutsideDays={showOutsideDays}
      className={cn('rdp-root flex h-full w-full flex-col text-sm text-zinc-100', className)}
      classNames={{
        months: cn('rdp-months', 'flex-1 w-full justify-center'),
        month: cn('rdp-month', 'w-full flex flex-col gap-6 px-4 sm:px-6 pb-6'),
        month_caption: cn('rdp-month_caption', 'flex items-center justify-between text-zinc-100'),
        caption_label: cn('rdp-caption_label', 'text-lg font-semibold text-white tracking-tight'),
        dropdowns: cn('rdp-dropdowns', 'flex items-center gap-3 text-base'),
        dropdown_root: cn(
          'rdp-dropdown_root',
          'relative inline-flex items-center gap-1 rounded-xl border border-zinc-800/70 bg-zinc-900/70 px-5 py-2 text-base text-zinc-100'
        ),
        dropdown: cn('rdp-dropdown', 'absolute inset-0 w-full cursor-pointer opacity-0'),
        months_dropdown: cn('rdp-months_dropdown', 'pointer-events-none capitalize'),
        years_dropdown: cn('rdp-years_dropdown', 'pointer-events-none uppercase tracking-wide'),
        nav: cn('rdp-nav', 'flex items-center gap-2 text-zinc-100'),
        button_previous: cn(
          'rdp-button_previous',
          'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-700/70 bg-zinc-900/60 p-0 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800 transition'
        ),
        button_next: cn(
          'rdp-button_next',
          'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-700/70 bg-zinc-900/60 p-0 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800 transition'
        ),
        chevron: cn('rdp-chevron', 'h-4 w-4 text-zinc-100'),
        month_grid: cn('rdp-month_grid', 'w-full table-fixed border-collapse text-zinc-200 text-lg'),
        weeks: cn('rdp-weeks', ''),
        week: cn('rdp-week', ''),
        weekdays: cn('rdp-weekdays', 'text-center text-xs uppercase tracking-[0.08em] text-zinc-500'),
        weekday: cn('rdp-weekday', 'pb-2 font-medium'),
        week_number: cn('rdp-week_number', ''),
        week_number_header: cn('rdp-week_number_header', ''),
        day: cn('rdp-day', 'p-1 text-center align-middle text-lg'),
        day_button: cn(
          'rdp-day_button',
          'mx-auto flex h-9 w-9 items-center justify-center rounded-md text-base font-semibold transition-colors text-white cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100 hover:bg-zinc-900'
        ),
        selected: cn(
          'rdp-selected',
          'bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200 ring-offset-[-2px] rounded-md hover:bg-white hover:text-zinc-900 font-semibold'
        ),
        today: cn(
          'rdp-today',
          'text-white font-semibold rounded-md ring-1 ring-zinc-600/60 ring-offset-[-2px]'
        ),
        outside: cn('rdp-outside', 'text-zinc-600 opacity-60'),
        disabled: cn('rdp-disabled', 'text-zinc-700 cursor-not-allowed opacity-40'),
        range_middle: cn('rdp-range_middle', 'aria-selected:bg-zinc-200 aria-selected:text-zinc-900'),
        range_start: cn('rdp-range_start', ''),
        range_end: cn('rdp-range_end', ''),
        hidden: cn('rdp-hidden', 'invisible'),
        ...classNames,
      }}
      styles={{
        root: {
          '--rdp-accent-color': '#e4e4e7',
          '--rdp-accent-background-color': '#e4e4e7',
        },
        months: { width: '100%', maxWidth: 'none' },
        month: { width: '100%' },
        month_grid: { width: '100%', tableLayout: 'fixed' },
        day_button: { width: '100%', height: '100%', border: '1px solid transparent' },
        ...styles,
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
