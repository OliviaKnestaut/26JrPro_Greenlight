import React from 'react';
import { Card, Avatar } from 'antd';
import styles from './index.module.css';

export type CardOrgProps = React.ComponentProps<typeof Card> & {
    avatarSrc?: string;
    subtitle?: React.ReactNode;
};

const CardOrg: React.FC<CardOrgProps> = ({ children, title, avatarSrc, subtitle, ...rest }) => (
    <Card className={styles.card} title={title} {...rest}>
        <div className={styles.header}>
        {avatarSrc && <Avatar src={avatarSrc} />}
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
        <div className={styles.content}>{children}</div>
    </Card>
);

export default CardOrg;
