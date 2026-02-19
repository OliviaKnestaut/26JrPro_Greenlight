import React from 'react';
import { Card } from 'antd';
import styles from './index.module.css';
import { formatTime } from '~/lib/formatters';

export type CardCalendarUpcomingProps = React.ComponentProps<typeof Card> & {
    events?: Array<{ id: string; title: React.ReactNode; date?: string; time?:string}>;
};

const CardCalendarUpcoming: React.FC<CardCalendarUpcomingProps> = ({ events = [], title, children, ...rest }) => {
    if (events && events.length > 0) {
        return (
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
                    return (
                    <Card key={e.id} className={styles.card} size="small" {...rest}>
                        <div className={styles.item}>
                            {e.date && (
                                <div className={styles.eventDate}>
                                    <div className={styles.eventMonth}>{monthAbbrev}</div>
                                    <div className={styles.eventDay}>{day}</div>
                                </div>
                            )}
                            <div className={styles.eventTitle}>
                                <span className={styles.titleText}>{String(e.title).slice(0, 30)}</span>
                                {displayTime ? <p>{displayTime}</p> : null}
                            </div>
                        </div>
                    </Card>
                );
                })}
            </div>
        );
    }

    return (
        <Card className={styles.card} {...rest}>
            <div className={styles.content}>{children}</div>
        </Card>
    );
};

export default CardCalendarUpcoming;
