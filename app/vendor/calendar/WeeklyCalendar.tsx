// ─── Third-party ──────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';

// ─── Vendor sub-components ────────────────────────────────────────────────────
import Calendar from './components/CalendarBody';
import { CalendarHeader } from './components/CalendarHeader';
import { daysToWeekObject } from './components/utils';
import type { GenericEvent, CalendarContainerProps } from './components/types';

// =============================================================================
// WeeklyCalendar
// Vendored weekly calendar view. Accepts a list of generic events and renders
// them in a 7-column (or 5-column when weekends=false) grid for the active
// week.  Supports controlled navigation via currentDate / value and fires
// onSelectDate whenever the displayed week changes.
// =============================================================================

export function WeeklyCalendar<T extends GenericEvent>({
  events,
  onEventClick,
  onSelectDate,
  weekends = false,
  currentDate,
  value,
}: CalendarContainerProps<T>) {
  // Accept either controlled prop name; prefer currentDate
  const dateToUse = currentDate || value;

  // Tracks the Monday (weekStartsOn: 0 → Sunday) of the currently displayed week
  const [startWeek, setStartWeek] = useState(
    startOfWeek(dateToUse || new Date(), { weekStartsOn: 0 })
  );

  // Derived date range for the currently displayed week
  const weekPeriod = {
    startDate: startWeek,
    endDate: endOfWeek(startWeek),
  };

  // If the controlled date prop jumps to a different week, sync the view
  useEffect(() => {
    if (dateToUse && startOfWeek(dateToUse).getTime() !== startWeek.getTime()) {
      setStartWeek(dateToUse);
    }
  }, [dateToUse]);

  // Notify the parent whenever the displayed week changes
  useEffect(() => {
    onSelectDate && onSelectDate(startWeek);
  }, [startWeek]);

  // Pre-group events by day of week for efficient lookup inside CalendarBody
  const weekObject = daysToWeekObject(events, startWeek);

  return (
    <div>
      <CalendarHeader startWeek={startWeek} setStartWeek={setStartWeek} />
      <Calendar
        weekDatesRange={weekPeriod}
        getDayEvents={weekObject}
        onEventClick={onEventClick as (e: GenericEvent) => any}
        weekends={weekends}
      />
    </div>
  );
}
