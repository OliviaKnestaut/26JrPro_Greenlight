import React from 'react';
import { Card } from 'antd';
import { useNavigate } from 'react-router';
import styles from './index.module.css';
import { formatTime } from '~/lib/formatters';

type CardCalendarMiniCardProps = React.ComponentProps<typeof Card> & {
    id?: string;
    title?: React.ReactNode;
    date?: string | Date;
    startTime?: string | Date;
    endTime?: string | Date;
    status?: 'approved' | 'in-review' | string;
};

const CardCalendarMiniCard: React.FC<CardCalendarMiniCardProps> = ({ id, title, date, startTime, endTime, status, ...rest }) => {
    const navigate = useNavigate();

    let monthAbbrev = '';
    let day = '';
    if (date) {
        const s = String(date);
        const m = s.split('/');
        if (m.length >= 2) {
            const monthNum = parseInt(m[0], 10);
            const d = m[1];
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            monthAbbrev = months[(monthNum || 1) - 1] || '';
            day = d || '';
        } else {
            const dt = new Date(s);
            if (!isNaN(dt.getTime())) {
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                monthAbbrev = months[dt.getMonth()];
                day = String(dt.getDate());
            }
        }
    }

    // Prefer startTime/endTime if provided, otherwise fall back to `time`.
    const formatCandidate = (v?: string | Date) => (v instanceof Date ? v.toString() : typeof v === 'string' ? v : v ? String(v) : undefined);
    const formattedStart = formatCandidate(startTime) ? formatTime(formatCandidate(startTime)) : undefined;
    const formattedEnd = formatCandidate(endTime) ? formatTime(formatCandidate(endTime)) : undefined;
    const displayTime = formattedStart && formattedEnd ? `${formattedStart} - ${formattedEnd}` : (formattedStart || undefined);
    const cardClass = [styles.card, status === 'approved' ? styles.approved : '', status === 'in-review' ? styles.inReview : ''].filter(Boolean).join(' ');

    return (
        <Card
            className={cardClass}
            size="small"
            {...rest}
            onClick={() => id && navigate(`/event-overview?id=${encodeURIComponent(id)}`)}
            onKeyDown={(ev) => { if ((ev as any).key === 'Enter' && id) navigate(`/event-overview?id=${encodeURIComponent(id)}`); }}
            role={id ? 'button' : undefined}
            tabIndex={id ? 0 : undefined}
        >
            <div className={styles.item}>
                {date && (
                    <div className={styles.eventDate}>
                        <div className={styles.eventMonth}>{monthAbbrev}</div>
                        <div className={styles.eventDay}>{day}</div>
                    </div>
                )}
                <div className={styles.eventTitle}>
                    <span className={styles.titleText}>{String(title ?? '')}</span>
                    {displayTime ? <p>{displayTime}</p> : null}
                </div>
            </div>
        </Card>
    );
};

export default CardCalendarMiniCard;
