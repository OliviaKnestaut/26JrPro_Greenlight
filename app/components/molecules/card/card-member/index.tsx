import React from 'react';
import { Card, Avatar } from 'antd';
import styles from './index.module.css';

export type CardMemberProps = React.ComponentProps<typeof Card> & {
    avatarSrc?: string;
    role?: string;
};

const CardMember: React.FC<CardMemberProps> = ({ children, title, avatarSrc, role, ...rest }) => (
    <Card className={styles.card} title={title} {...rest}>
        <div className={styles.meta}>
        {avatarSrc && <Avatar src={avatarSrc} />}
        {role && <div className={styles.role}>{role}</div>}
        </div>
        <div className={styles.content}>{children}</div>
    </Card>
);

export default CardMember;
