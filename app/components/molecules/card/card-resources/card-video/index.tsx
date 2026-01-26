import React from 'react';
import { Card } from 'antd';
import img from '../../../../assets/video-icon.png';
import styles from './index.module.css';

export type trainingResourceProps = React.ComponentProps<typeof Card> & {
    title: string;
    tags?: string[];
};

const TrainingResource: React.FC<trainingResourceProps> = ({ children, title = [], ...rest }) => (
    <Card className={styles.card}{...rest}>
        <img src={img} alt='video-icon' className={styles.image}></img>
        <div className={styles.words}>
            <a href=''>
                {title}
            </a>
            <span className={styles.resourceDescription}>
                {typeof children === "string"
                    ? children.split(" ").slice(0, 3).join(" ") + "…"
                    : children}
            </span>
        </div>

    </Card>
);

export default TrainingResource;