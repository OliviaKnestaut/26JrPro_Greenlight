import React from 'react';
import { Card, Typography } from 'antd';
import styles from './index.module.css';
import { formatTime } from '~/lib/formatters';
import StyledCalendar from '../../calendar';
const { Title } = Typography;


export type CardCalendarUpcomingProps = React.ComponentProps<typeof Card> & {
    events?: Array<{ id: string; title: React.ReactNode; date?: string; time?:string; status?: string}>;
};

const CardCalendarUpcoming: React.FC<CardCalendarUpcomingProps> = ({ events = [], title, children, ...rest }) => {
    if (events && events.length > 0) {
        return (
            <>
            
            <StyledCalendar/>
            <Title level={5} style={{ marginTop: '16px', color: "var(--color-brand-primary-active)" }}>Upcoming Events</Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {events.map((e) => {
                        // e.date expected in M/D/YYYY (from formatDateMDY) or ISO-like string
                        let monthAbbrev = '';
                        let day = '';
                        if (e.date) {
                            const m = String(e.date).split('/');
                            if (m.length >= 2) {
                                const monthNum = parseInt(m[0], 10);
                                const d = m[1];
                                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                                monthAbbrev = months[(monthNum || 1) - 1] || '';
                                day = d || '';
                            } else {
                                const dt = new Date(e.date);
                                if (!isNaN(dt.getTime())) {
                                    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                                    monthAbbrev = months[dt.getMonth()];
                                    day = String(dt.getDate());
                                }
                            }
                        }
                        const displayTime = e.time ? formatTime(e.time) : undefined;
                        const cardClass = [styles.card, e.status === 'approved' ? styles.approved : '', e.status === 'in-review' ? styles.inReview : ''].filter(Boolean).join(' ');
                        return (
                        <Card key={e.id} className={cardClass} size="small" {...rest} style={{ flex: '0 0 calc((100% - 0.5rem) / 2)', maxWidth: 'calc((100% - 0.5rem) / 2)', boxSizing: 'border-box' }}>
                            <div className={styles.item}>
                                {e.date && (
                                    <div className={styles.eventDate}>
                                        <div className={styles.eventMonth}>{monthAbbrev}</div>
                                        <div className={styles.eventDay}>{day}</div>
                                    </div>
                                )}
                                <div className={styles.eventTitle}>
                                    <span className={styles.titleText}>{String(e.title)}</span>
                                    {displayTime ? <p>{displayTime}</p> : null}
                                </div>
                            </div>
                        </Card>
                    );
                    })}
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
