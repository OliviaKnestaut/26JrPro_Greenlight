import React from 'react';
import { Card } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import styles from './index.module.css';

export type documentResourceProps = React.ComponentProps<typeof Card> & {
    title: string;
    tags?: string[];
};

const documentResource: React.FC<documentResourceProps> = ({ children, title = [], ...rest }) => (
    <Card className={styles.card}{...rest}>
        <FileOutlined style={{
            fontSize: "2.5rem",
            alignSelf: "flex-start"
        }} ></FileOutlined>
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

export default documentResource;