import React from 'react';
import { Card, Tag } from 'antd';
import img from '../../../assets/video-icon.png';
import styles from './index.module.css';

export type CardResourceProps = React.ComponentProps<typeof Card> & {
    tags?: string[];
};

const CardResource: React.FC<CardResourceProps> = ({ children, title, tags = [], ...rest }) => (
    <Card className={styles.card}{...rest}>
        <div className={styles.content}>
            <h4>Training Videos</h4>
            <div className={styles.resource}>
                <img src={img} alt='video-icon' className={styles.image}></img>
                <div className={styles.words}>
                <a href=''>
                    Officer Training
                </a>
                <p>Provides a quick ove...</p>
                </div>
            </div>
        </div>
    </Card>
);

export default CardResource;
