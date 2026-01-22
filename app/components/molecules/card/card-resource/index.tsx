import React from 'react';
import { Card, Tag } from 'antd';
import img from '../../../assets/video-icon.png';
import styles from './index.module.css';

export type CardResourceProps = React.ComponentProps<typeof Card> & {
    tags?: string[];
};

const CardResource: React.FC<CardResourceProps> = ({ children, title, tags = [], ...rest }) => (
    <Card className={styles.card}{...rest}>
                <img src={img} alt='video-icon' className={styles.image}></img>
                <div className={styles.words}>
                    <a href=''>
                        Officer Training
                    </a>
                    <span className={styles.resourceDescription}>{"Provides a quick overview".slice(0, 20) + "…"}</span>
                </div>
    </Card>
);

export default CardResource;
