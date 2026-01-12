import React from 'react';
import { Card } from 'antd';
import styles from './index.module.css';

export type CardWelcomeProps = React.ComponentProps<typeof Card> & {
    subtitle?: React.ReactNode;
};

const CardWelcome: React.FC<CardWelcomeProps> = ({ children, title, subtitle, ...rest }) => (
    <Card className={styles.card} title={title} {...rest}>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        <div className={styles.content}>{children}</div>
    </Card>
);

export default CardWelcome;
