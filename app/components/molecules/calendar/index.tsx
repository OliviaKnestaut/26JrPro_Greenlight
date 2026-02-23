import React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import 'dayjs/locale/en';

import { Calendar, Popover, theme, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayLocaleData from 'dayjs/plugin/localeData';
import { CardCalendarUpcoming } from '../card';

dayjs.extend(dayLocaleData);
dayjs.extend(customParseFormat);

export type StyledCalendarEvent = {
    id: string;
    title: React.ReactNode;
    date?: string | Date;
    time?: string;
    status?: 'approved' | 'in-review' | string;
};

const StyledCalendar: React.FC<{ events?: StyledCalendarEvent[] }> = ({ events = [] }) => {
    const { token } = theme.useToken();
    // Keep the selected date as today by default so the calendar doesn't auto-select the 1st
    const [value, setValue] = React.useState<Dayjs>(dayjs());

    const onPanelChange = (val: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
        // Keep the same day-of-month where possible instead of forcing startOf('month')
        setValue(val);
        console.log(val.format('YYYY-MM-DD'), mode);
    };
    const eventMap = React.useMemo(() => {
        const map = new Map<string, StyledCalendarEvent[]>();
        events.forEach((ev) => {
            if (!ev.date) return;
            let dt;
            if (typeof ev.date === 'string') {
                // try M/D/YYYY first, then ISO/other parses
                const mdy = dayjs(ev.date, 'M/D/YYYY', true);
                dt = mdy.isValid() ? mdy : dayjs(ev.date);
            } else {
                dt = dayjs(ev.date);
            }
            if (!dt.isValid()) return;
            const k = dt.format('YYYY-MM-DD');
            if (!map.has(k)) map.set(k, []);
            map.get(k)!.push(ev);
        });
        return map;
    }, [events]);

    const wrapperRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        console.log('StyledCalendar received events:', events);
        try {
            console.log('StyledCalendar eventMap keys:', Array.from(eventMap.keys()));
        } catch (err) {
            console.log('StyledCalendar eventMap unavailable', err);
        }
    }, [events, eventMap]);

    // Helper: whether the displayed month is the current month
    const isViewingCurrentMonth = (d: Dayjs) => d.isSame(dayjs(), 'month');

    // dateCellRender: show events and popover on hover; do NOT render the date number (use AntD's number)
    const dateCellRender = (date: Dayjs) => {
        const k = date.format('YYYY-MM-DD');
        const dayEvents = eventMap.get(k) || [];
        const hasVisibleEvent = dayEvents.some((ev) => ev.status === 'approved' || ev.status === 'in-review');
        const isToday = date.isSame(dayjs(), 'day');
        // Add lightweight dev preview classes (avoid relying on AntD internal classes)
        // `gc-event-date` lets the CSS target only cells that contain events via :has().
        const wrapperClass = [hasVisibleEvent ? 'gc-event-date' : '', isToday ? 'gc-today' : '']
            .filter(Boolean)
            .join(' ');

        const popoverContent = (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dayEvents.length === 0 ? <div>No events</div> : dayEvents.map((ev) => (
                    <div key={ev.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{ev.title}</div>
                        {ev.time ? <div style={{ color: 'var(--accent-gray)' }}>{ev.time}</div> : null}
                        {ev.status ? <div style={{ marginLeft: 'auto', color: '#888' }}>{ev.status}</div> : null}
                    </div>
                ))}
            </div>
        );

        // We do not render the date number here (AntD provides it). Render only the event indicator.
        return (
            <Popover content={popoverContent} trigger={dayEvents.length ? 'hover' : undefined} placement="top">
                <div className={wrapperClass || undefined} style={{ minHeight: 54, padding: '6px 6px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div style={{ marginLeft: 'auto' }}>
                            {null}
                        </div>
                    </div>
                </div>
            </Popover>
        );
    };

    return (
        <div className={`styled-calendar-wrapper ${isViewingCurrentMonth(value) ? 'viewing-current-month' : ''}`} ref={wrapperRef}>
            <Calendar
                fullscreen={false}
                value={value}
                dateCellRender={dateCellRender}
                headerRender={() => (
                    <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <button onClick={() => setValue(value.subtract(1, 'month').startOf('month'))} aria-label="Previous month" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <LeftOutlined />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Typography.Title level={4} style={{ margin: 0 }}>
                                {value.format('MMMM YYYY')}
                            </Typography.Title>
                        </div>
                        <button onClick={() => setValue(value.add(1, 'month').startOf('month'))} aria-label="Next month" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <RightOutlined />
                        </button>
                    </div>
                )}
                onPanelChange={onPanelChange}
            />
        </div>
    );
};

export default StyledCalendar;