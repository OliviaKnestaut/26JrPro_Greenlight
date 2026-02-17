import React from 'react';
import { Card } from 'antd';
import styles from './index.module.css';
import OptimizedImage from '../../../atoms/OptimizedImage';

export type CardOrgProps = React.ComponentProps<typeof Card> & {
    orgName?: React.ReactNode;
    description?: React.ReactNode;
    imageSrc?: string;
};

const CardOrg: React.FC<CardOrgProps> = ({ orgName, description, imageSrc, ...rest }) => {

    return (
        <Card className={styles.card} {...rest}>
            <div className={styles.all}>
                <OptimizedImage src={imageSrc} className={styles.image} alt={`${orgName ?? 'organization'} logo`} />
                <div className={styles.content}>
                    {orgName && <div className={styles.subtitle}>{orgName}</div>}
                    {description}
                </div>
            </div>
        </Card>
    );
};

export default CardOrg;
