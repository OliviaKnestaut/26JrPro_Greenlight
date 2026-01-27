import React from 'react';
import { Card } from 'antd';
import img from '../../../assets/drexel-wib-logo.png';
import styles from './index.module.css';

export type CardOrgProps = React.ComponentProps<typeof Card> & {
    avatarSrc?: string;
    subtitle?: React.ReactNode;
};

const CardOrg: React.FC<CardOrgProps> = ({ children, title, subtitle, ...rest }) => (
    <Card className={styles.card} {...rest}>
        <div className={styles.all}>
            <img src={img} className={styles.image} alt="Women in Business Logo" />

            <div className={styles.content}>
                {title && <div className={styles.title}>{title}</div>}
                {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

                {children}
            </div>
        </div>
    </Card>
);

export default CardOrg;
