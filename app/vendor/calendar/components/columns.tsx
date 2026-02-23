
import React from 'react';
import { add, format, isWeekend, isSameDay } from 'date-fns';
import type { ColumnProps } from 'antd/es/table';

import type {
    GenericEvent,
    EventsObject,
} from './types';
import { EventBlock } from './Event';

export const SCROLL_TO_ROW = 6;



/**
 * Generates columns for each day of the week to be used in an Ant Design (antd) Table component based on the provided date range and whether
 * weekends should be included. The events displayed in the
 * columns are provided by the `getDayHoursEvents` function and will appear if `dataIndex`, and `key` would be set correctly.
 *
 * @template T - The type of the event objects, extending the GenericEvent interface.
 * @param {WeekDateRange} weekDates - The start and end dates for the week.
 * @param {boolean} includeWeekends - Whether to include weekends in the view.
 * @param {(e: T) => any | undefined} [onEventClick] - Optional callback for handling event clicks.
 * @returns {ColumnProps<EventsObject<T>>[]} An array of column properties for the Ant Design Table.
 *
 * @remarks
 * The format of the columns is crucial for the Ant Design Table to render correctly and match data
 * to the appropriate columns. This function works with `getDayHoursEvents` to ensure events are properly
 * aligned with the generated columns.
 *
 * @see getDayHoursEvents
 */
export function createDayColumns<T extends GenericEvent>(
    weekDates: { startDate: Date; endDate: Date },
    includeWeekends: boolean,
    onEventClick?: (e: T) => any | undefined,
): ColumnProps<EventsObject<T>>[] {
    const dayIndices = includeWeekends ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return dayIndices.map(dayIndex => {
        const columnDate = add(weekDates.startDate, { days: dayIndex });
        const isToday = isSameDay(columnDate, new Date());
        const formattedDay = `${format(columnDate, 'EEE')} (${format(columnDate, 'M/d')})`;

        return {
            title: (
                <div style={{ whiteSpace: 'nowrap' }}>
                    {formattedDay}
                </div>
            ),
            dataIndex: dayNames[dayIndex],
            key: dayNames[dayIndex],
            // fixed column width so all day columns render equal width
            width: 150,

            // Header cell styles
            onHeaderCell: () => ({
                style: {
                    backgroundColor: isToday ? 'rgba(25, 169, 179, 0.32)' : 'var(--sea-green-1)', // today highlight
                    fontWeight: 600,
                    height: '1.5rem',
                    padding: '0',
                },
            }),

            // Cell styles
            onCell: () => {
                const weekend = isWeekend(columnDate);
                return {
                    style: {
                        backgroundColor: isToday ? 'rgba(25,169,179,0.06)' : (weekend ? 'var(--gray-2)' : 'white'),
                        padding: '0',
                        height: '6rem',
                    },
                };
            },

            render: (events: T[], row: EventsObject<T>) => {
                if (events && events.length > 0) {
                    return events.map((event, index) => (
                        <EventBlock
                            key={event.eventId}
                            event={event}
                            index={index}
                            hour={row.hourObject}
                            events={events.length}
                            onEventClick={onEventClick}
                        />
                    ));
                }
                return undefined;
            },
        } as ColumnProps<EventsObject<T>>;
    });
}
