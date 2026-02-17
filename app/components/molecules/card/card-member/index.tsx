import React from 'react';
import { Card } from 'antd';
import OptimizedImage from '../../../atoms/OptimizedImage';
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
            {avatarSrc && <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden' }}><OptimizedImage src={avatarSrc} alt={`${first} ${last}`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} /></div>}
        </div>
        <div className={styles.name}>{first} {last}</div>
        {role && <div className={styles.role}>{role}</div>}
        <div className={styles.content}>{username}@drexel.edu</div>
    </Card>
);

export default CardMember;
