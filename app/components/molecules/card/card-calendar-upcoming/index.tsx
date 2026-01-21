import React from 'react';
import { Card, List } from 'antd';
import styles from './index.module.css';

export type CardCalendarUpcomingProps = React.ComponentProps<typeof Card> & {
    events?: Array<{ id: string; title: React.ReactNode; date?: string; time?:string}>;
};

const CardCalendarUpcoming: React.FC<CardCalendarUpcomingProps> = ({ events = [], title, children, ...rest }) => (
    <Card className={styles.card} {...rest}>
        {events.length > 0 ? (
        <List
            dataSource={events}
            renderItem={(e) => (
            <List.Item key={e.id} className={styles.item}>
                {e.date && <div className={styles.eventDate}>{e.date}</div>}
                <div className={styles.eventTitle}>{e.title}
                    <p>2:00PM - 3:30PM</p>
                </div>
                
            </List.Item>
            )}
        />
        ) : (
        <div className={styles.content}>{children}</div>
        )}
    </Card>
);

export default CardCalendarUpcoming;
