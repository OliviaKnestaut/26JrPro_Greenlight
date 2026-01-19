import React from 'react';
import { Card, Avatar } from 'antd';
import styles from './index.module.css';

export type CardOrgProps = React.ComponentProps<typeof Card> & {
    avatarSrc?: string;
    subtitle?: React.ReactNode;
};

const CardOrg: React.FC<CardOrgProps> = ({ children, title, avatarSrc, subtitle, ...rest }) => (
    <Card className={styles.card} {...rest}>
        <div className={styles.all}>
            <div className={styles.image}>
            {avatarSrc && <Avatar src={avatarSrc} size={96}/>}
            </div>
            <div className={styles.content}>
            {subtitle && <div className={styles.subtitle}> DU Women in Business</div>}
            Drexel Women in Business is a joint student organization. Drexel Women in Business (DWIB) is a network of dynamic, like-minded women achieving their business goals through support, inclusion, inspiration, and mentoring. DWIB maintains a strong network of women in the business community by coordinating networking events, speaker series, workshops, and similar activities. These events are open to the entire Drexel University community in order to foster growth, relationships, and future opportunities. This organization emphasizes LeBow's ties to the alumni network and to the greater Philadelphia business community, and upholds LeBow's commitment to excellence. </div>
        </div>
        </Card>
);

export default CardOrg;
