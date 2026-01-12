import React from 'react';
import { Card, Badge } from 'antd';
import styles from './index.module.css';

export type CardEventProps = React.ComponentProps<typeof Card> & {
    date?: string;
    location?: string;
};

const CardEvent: React.FC<CardEventProps> = ({ children, title, date, location, ...rest }) => (
    <Card className={styles.card} title={title} {...rest}>
        <div className={styles.meta}>
        {date && <div className={styles.date}>{date}</div>}
        {location && <div className={styles.location}>{location}</div>}
        </div>
        <div className={styles.content}>{children}</div>
    </Card>
);

export default CardEvent;
