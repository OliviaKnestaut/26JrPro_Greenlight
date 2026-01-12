import React from 'react';
import { Card, Tag } from 'antd';
import styles from './index.module.css';

export type CardResourceProps = React.ComponentProps<typeof Card> & {
    tags?: string[];
};

const CardResource: React.FC<CardResourceProps> = ({ children, title, tags = [], ...rest }) => (
    <Card className={styles.card} title={title} {...rest}>
        <div className={styles.tags}>
        {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
        ))}
        </div>
        <div className={styles.content}>{children}</div>
    </Card>
);

export default CardResource;
