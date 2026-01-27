import React from 'react';
import { Card, Avatar } from 'antd';
import styles from './index.module.css';

export type CardMemberProps = React.ComponentProps<typeof Card> & {
    avatarSrc?: string;
    first: string;
    last: string;
    username: string;
    role?: string;
};

const CardMember: React.FC<CardMemberProps> = ({ children, avatarSrc, role, first, last, username, ...rest }) => (
    <Card className={styles.card}>
        <div className={styles.meta}>
            {avatarSrc && <Avatar src={avatarSrc} size={64} />}
        </div>
        <div className={styles.name}>{first} {last}</div>
        {role && <div className={styles.role}>{role}</div>}
        <div className={styles.content}>{username}@drexel.edu</div>
    </Card>
);

export default CardMember;
