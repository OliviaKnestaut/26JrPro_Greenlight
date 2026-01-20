import React from 'react';
import { Card, Avatar } from 'antd';
import styles from './index.module.css';

export type CardMemberProps = React.ComponentProps<typeof Card> & {
    avatarSrc?: string;
    role?: string;
};

const CardMember: React.FC<CardMemberProps> = ({ children, avatarSrc, role, ...rest }) => (
    <Card className={styles.card}>
        <div className={styles.meta}>
        {avatarSrc && <Avatar src={avatarSrc} size={64}/>}
        </div>
        <div className={styles.name}>Hannah Desmond</div>
        {role && <div className={styles.role}>President</div>}
        <div className={styles.content}>hd434@drexel.edu</div>
    </Card>
);

export default CardMember;
