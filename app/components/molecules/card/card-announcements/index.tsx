import React from 'react';
import { Card, List } from 'antd';
import styles from './index.module.css';

export type CardAnnouncementsProps = React.ComponentProps<typeof Card> & {
    items?: Array<{ id: string; title: React.ReactNode; description?: React.ReactNode }>;
};

const CardAnnouncements: React.FC<CardAnnouncementsProps> = ({ items = [], children, title, ...rest }) => (
    <Card className={styles.card} title ={title} {...rest}>
        {items.length > 0 ? (
        <List
            dataSource={items}
            renderItem={(it) => (
            <List.Item key={it.id} className={styles.item}>
                <List.Item.Meta title={it.title} description={it.description} />
            </List.Item>
            )}
        />
        ) : (
        <div className={styles.content}>{children}</div>
        )}
    </Card>
);

export default CardAnnouncements;
