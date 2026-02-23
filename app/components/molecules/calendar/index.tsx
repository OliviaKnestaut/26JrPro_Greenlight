import React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import 'dayjs/locale/en';

import { Calendar, Popover, theme, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayLocaleData from 'dayjs/plugin/localeData';
import CardCalendarMiniCard from '../card/card-calendar-upcoming/mini-card';

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
        // Select today only when viewing the month that contains today; otherwise
        // set the calendar's value to the start of the month (we'll hide non-today
        // selection via CSS so no active day appears).
        const today = dayjs();
        const newValue = val.isSame(today, 'month') ? today : val.startOf('month');
        setValue(newValue);
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
        // If there are no events for this date, render nothing (no popover)
        if (!dayEvents.length) return null;
        const hasVisibleEvent = dayEvents.some((ev) => ev.status === 'approved' || ev.status === 'in-review');
        const hasApprovedEvent = dayEvents.some((ev) => ev.status === 'approved');
        const hasInReviewEvent = dayEvents.some((ev) => ev.status === 'in-review');
        const isToday = date.isSame(dayjs(), 'day');
        // `gc-event-date` lets the CSS target only cells that contain events via :has().
        const wrapperClass = [
            hasVisibleEvent ? 'gc-event-date' : '',
            hasApprovedEvent ? 'gc-event-approved' : '',
            hasInReviewEvent ? 'gc-event-in-review' : '',
            isToday ? 'gc-today' : '',
        ].filter(Boolean).join(' ');

        const popoverContent = (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dayEvents.map((e) => (
                    <CardCalendarMiniCard
                        key={e.id}
                        {...e}
                        style={{ flex: '1 1 100%', maxWidth: '100%', boxSizing: 'border-box', cursor: e.id ? 'pointer' : 'default' }}
                    />
                ))}
            </div>
        );

        return (
            <div className={wrapperClass || undefined} style={{ position: 'absolute', top: '-1.5rem', width: '2.5rem', height: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Popover
                    content={popoverContent}
                    trigger={dayEvents.length ? 'hover' : undefined}
                    placement="top"
                    getPopupContainer={(triggerNode) => (triggerNode && (triggerNode.parentElement as HTMLElement)) || document.body}
                    >
                    <div style={{ cursor: dayEvents.length ? 'pointer' : 'default', width: '100%', height: '100%', display: 'block', background: 'transparent' }} />
                </Popover>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginLeft: 'auto' }}>{null}</div>
                </div>
            </div>
        );
    };

    return (
        <div className={`styled-calendar-wrapper ${isViewingCurrentMonth(value) ? 'viewing-current-month' : ''}`} ref={wrapperRef}>
            <Calendar
                fullscreen={false}
                value={value}
                cellRender={dateCellRender}
                headerRender={() => (
                    <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <button onClick={() => {
                            const current = value || dayjs();
                            const next = current.subtract(1, 'month');
                            setValue(next.isSame(dayjs(), 'month') ? dayjs() : next.startOf('month'));
                        }} aria-label="Previous month" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <LeftOutlined />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Typography.Title level={4} style={{ margin: 0, textAlign: 'center', }}>
                                {value.format('MMMM YYYY')}
                            </Typography.Title>
                        </div>
                        <button onClick={() => {
                            const current = value || dayjs();
                            const next = current.add(1, 'month');
                            setValue(next.isSame(dayjs(), 'month') ? dayjs() : next.startOf('month'));
                        }} aria-label="Next month" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
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