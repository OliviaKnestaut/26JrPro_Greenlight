import {
  add,
  isSameHour,
  isSameDay,
  addHours,
  eachDayOfInterval,
  startOfDay,
  getDay,
  isSameWeek,
  startOfWeek,
  format,
  differenceInMinutes,
} from 'date-fns';

import type {
  WeekObject,
  EventsObject,
  WeekDateRange,
  GenericEvent,
  DayName,
} from './types';


/**
 * Converts an array of events into a structured object representing the events of a specific week.
 *
 * This function processes a list of events and organizes them into a week object, where each day of the week (Sunday to Saturday)
 * contains an array of events that occur on that day. The function handles events that span multiple days by splitting them
 * into separate events for each day they cover.
 *
 * @template T - The type of the event objects in the events array. This should extend the GenericEvent interface.
 * @param {T[]} events - The array of event objects to be processed. Each event object must have a `startTime` and `endTime`.
 * @param {Date} startWeek - The start date of the week for which the events should be organized.
 * @returns {WeekObject<T>} An object representing the week, where each key is a day of the week ('sunday', 'monday', etc.),
 * and the value is an array of events that occur on that day.
 * // weekObject will contain events organized by day for the specified week
 */
export const daysToWeekObject = <T extends GenericEvent>(
  events: T[],
  startWeek: Date
) => {

  const dayNames: DayName[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  const weekObject: WeekObject<T> = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };

  if (events == null) {
    return weekObject;
  }
  for (const eventListIndex in events) {
    const eventStartTimeDay = events[eventListIndex].startTime;
    const eventEndTimeDay = events[eventListIndex].endTime;

    if (!isSameWeek(eventStartTimeDay, startWeek)) {
      continue;
    }
    if (!isSameDay(eventStartTimeDay, eventEndTimeDay)) {
      const result = eachDayOfInterval({
        start: eventStartTimeDay,
        end: eventEndTimeDay,
      });
      for (const dayInterval in result) {
        const splitedEvent = { ...events[eventListIndex] };
        splitedEvent.startTime = result[dayInterval];
        splitedEvent.endTime = result[dayInterval];
        const weekObjectKey: DayName =
          dayNames[getDay(new Date(result[dayInterval]))];
        isSameWeek(startWeek, splitedEvent.startTime) &&
          weekObject[weekObjectKey].push(splitedEvent);
      }
    } else {
      const weekObjectKey: DayName = dayNames[getDay(eventStartTimeDay)];
      weekObject[weekObjectKey].push(events[eventListIndex]);
    }
  }
  return weekObject;
};

/**
 *
 * This function processes a week's worth of events, grouping them by hour for each day of the week.
 * It creates an array of objects representing each hour slot. Each object contains a list of events that occur within that hour on each day.
 * The first row represents all-day events, followed by 24 hourly rows.
 *
 * @template T - The type of the event objects. This should extend the GenericEvent interface.
 * @param {WeekDateRange} weekRange - The start and end dates for the week being processed.
 * @param {WeekObject<T>} [weekObject] - An object containing arrays of events for each day of the week.
 * @returns {EventsObject<T>[]} An array of event objects, grouped by hour, to be used in a calendar table.
 *
 * @remarks
 * - The function generates 26 rows: 1 for all-day events, 24 for each hour of the day, and 1 header row.
 * - Each day of the week is processed, and events are filtered to determine whether they occur within the
 *   corresponding hour slot. The `isSameHour` function ensures that events are accurately placed.
 * - The generated array can be used to populate an Ant Design Table component, aligning events with their
 *   corresponding hour and day.
 *
 * @see createDayColumns
 */
export const getDayHoursEvents = <T extends GenericEvent>(
  weekRange: WeekDateRange,
  weekObject: WeekObject<T> | undefined
) => {
  const START_HOUR = 8;   // 8 AM
  const END_HOUR = 24;  // 12 AM (midnight)
  const ROW_AMOUNT = END_HOUR - START_HOUR + 1;

  const events: EventsObject<T>[] = [];

  // Start from the beginning of the week, but at 8 AM
  const baseDate = startOfDay(startOfWeek(weekRange.startDate));

  for (let i = 0; i < ROW_AMOUNT; i++) {
    const hour = addHours(baseDate, START_HOUR + i);

    events.push({
      id: i,
      hourObject: hour,
      hour: format(hour, 'HH:mm'),

      Sunday:
        weekObject?.sunday?.filter(e =>
          isSameHour(e.startTime, add(hour, { days: 0 }))
        ),
      Monday:
        weekObject?.monday?.filter(e =>
          isSameHour(e.startTime, add(hour, { days: 1 }))
        ),
      Tuesday:
        weekObject?.tuesday?.filter(e =>
          isSameHour(e.startTime, add(hour, { days: 2 }))
        ),
      Wednesday:
        weekObject?.wednesday?.filter(e =>
          isSameHour(e.startTime, add(hour, { days: 3 }))
        ),
      Thursday:
        weekObject?.thursday?.filter(e =>
          isSameHour(e.startTime, add(hour, { days: 4 }))
        ),
      Friday:
        weekObject?.friday?.filter(e =>
          isSameHour(e.startTime, add(hour, { days: 5 }))
        ),
      Saturday:
        weekObject?.saturday?.filter(e =>
          isSameHour(e.startTime, add(hour, { days: 6 }))
        ),
    });
  }

  return events;
};


const HOUR_TO_DECIMAL = 1.666666667;
export const MIN_BOX_SIZE = 40;

// make sure that the hour and the daya are the same
export const sizeEventBox = <T extends GenericEvent>(event: T, hour: Date) => {
  const eventStartTime = new Date(event.startTime);
  const eventEndTime = new Date(event.endTime);

  const boxSize =
    Math.floor(
      differenceInMinutes(eventEndTime, eventStartTime) * HOUR_TO_DECIMAL
    ) < MIN_BOX_SIZE
      ? MIN_BOX_SIZE
      : Math.floor(
          differenceInMinutes(eventEndTime, eventStartTime) * HOUR_TO_DECIMAL
        );
  const boxPosition =
    differenceInMinutes(hour, eventStartTime) * HOUR_TO_DECIMAL > 100
      ? 0
      : differenceInMinutes(eventStartTime, hour) * HOUR_TO_DECIMAL;
  return { boxPosition: boxPosition, boxSize: boxSize };
};

/**
 * calculateScrollOffset - A  to calculate the scroll offset needed to bring a specific row into view.
 * 
 * @param {HTMLDivElement} container - The container element that is scrollable.
 * @param {HTMLDivElement} row - The row element that needs to be scrolled into view.
 * @returns {number} - The calculated scroll offset value.
 * 
 * This function calculates how much the container needs to be scrolled to bring the target row into view.
 * It determines the difference between the container's top position and the row's top position, and adjusts
 * the scroll position accordingly, with an extra offset to position the row appropriately in the view.
 */
export function calculateScrollOffset(container: HTMLDivElement, row: HTMLDivElement): number {
  const containerTop = container.getBoundingClientRect().top;
  const rowTop = row.getBoundingClientRect().top;
  return rowTop - containerTop  // Adjust to scroll just enough to show the row
}

// This function calculates the event level based on the provided data, which includes various criteria such as travel type, elements involved, number of attendees, and budget details. The function returns an integer (0-3) representing the event level, which can be used to determine the required notice period for the event.
export const calculateEventLevel = (data: any) => {
  // Level 3 Criteria (Most Restrictive) - Requires 8 Weeks notice
  if (
    data.form_data?.travel?.type === "international" || 
    data.form_data?.travel?.type === "out_of_region" ||
    data.form_data?.elements?.minors === true ||
    data.form_data?.elements?.alcohol === true ||
    (data.attendees && data.attendees >= 150) ||
    (data.form_data?.budget?.total_purchase > 4999.99)
  ) {
    return 3;
  }

  // Level 2 Criteria - Requires 5 Weeks notice
  if (
    data.form_data?.travel?.type === "regional_overnight" ||
    data.form_data?.budget?.source === "SAFAC" || 
    data.form_data?.budget?.source === "TGIF" ||
    (data.attendees && data.attendees >= 150)
  ) {
    return 2;
  }

  // Level 1 Criteria - Requires 3 Weeks notice
  if (
    data.form_data?.elements?.movies === true ||
    data.form_data?.elements?.fire === true ||
    data.location_type === "Off-Campus"
  ) {
    return 1;
  }

  // Default to Level 0 - Requires 12 Business Days
  return 0;
};