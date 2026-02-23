import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Card, Typography } from 'antd';
import styles from './index.module.css';
import StyledCalendar from '../../calendar';
import CardCalendarMiniCard from './mini-card';
const { Title } = Typography;


export type CardCalendarUpcomingProps = React.ComponentProps<typeof Card> & {
    events?: Array<{ id: string; title: React.ReactNode; date?: string; startTime?:string; endTime?: string; status?: string}>;
};

const CardCalendarUpcoming: React.FC<CardCalendarUpcomingProps> = ({ events = [], title, children, ...rest }) => {
    // Parse a date string (ISO yyyy-mm-dd or M/D/YYYY) into a Date (local, at midnight)
    const parseDateOnly = (date?: string): Date | null => {
        if (!date) return null;
        const s = String(date).trim();
        // If includes T, take date part
        const isoPart = s.includes('T') ? s.split('T')[0] : s;
        const isoMatch = isoPart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoMatch) {
            const y = parseInt(isoMatch[1], 10);
            const m = parseInt(isoMatch[2], 10) - 1;
            const d = parseInt(isoMatch[3], 10);
            return new Date(y, m, d);
        }
        if (isoPart.includes('/')) {
            const parts = isoPart.split('/').map((p) => p.trim());
            if (parts.length >= 3) {
                const month = parseInt(parts[0], 10) - 1;
                const day = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                if (!Number.isNaN(month) && !Number.isNaN(day) && !Number.isNaN(year)) {
                    return new Date(year, month, day);
                }
            }
        }
        const dt = new Date(isoPart);
        if (!isNaN(dt.getTime())) return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        return null;
    };

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Include events that are in the future OR whose date is today (ignore time)
    const filteredEvents = events.filter((ev) => {
        if (!ev) return false;
        if (!ev.date) return true;
        const evDateOnly = parseDateOnly(ev.date);
        if (!evDateOnly) return true; // can't parse -> keep
        // include if ev date is today or after today
        return evDateOnly.getTime() >= todayOnly.getTime();
    });

    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isDashboard = pathname.includes('dashboard') || pathname === '/';

    // Calendar should receive ALL events that are in-review or approved.
    const calendarEvents = events.filter((ev) => ev && (ev.status === 'approved' || ev.status === 'in-review'));

    if (filteredEvents && filteredEvents.length > 0) {
        return (
            <>
                <StyledCalendar events={calendarEvents} />
                <Title level={5} style={{ marginTop: '16px', color: "var(--color-brand-primary-active)" }}>Upcoming Events</Title>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {filteredEvents.slice(0, isDashboard ? 2 : 4).map((e) => (
                        <CardCalendarMiniCard
                            key={e.id}
                            {...e}
                            style={{ flex: '0 0 calc(100% - 0.5rem)', maxWidth: 'calc(100% - 0.5rem)', boxSizing: 'border-box', cursor: e.id ? 'pointer' : 'default' }}
                        />
                    ))}
                </div>
                <div style={{ marginTop: 8 }}>
                    <a href="/~ojk25/jrProjGreenlight/event-submissions?status=in-review%2Capproved">See more...</a>
                </div>
            </>
        );
    }

    return (
        <Card className={styles.card} {...rest}>
            <div className={styles.content}>{children}</div>
        </Card>
    );
};

export default CardCalendarUpcoming;
