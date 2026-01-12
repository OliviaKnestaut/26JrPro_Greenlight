import React from 'react';
import { ConfigProvider, Progress } from 'antd';
import styles from './index.module.css';

export type ProgressCircleProps = {
    total?: number;
    spent?: number;

    percent?: number;
    amount?: number;

    status?: 'normal' | 'active' | 'success' | 'exception';
    size?: number;
    strokeWidth?: number;
};

const ProgressCircle: React.FC<ProgressCircleProps> = ({
    total,
    spent,
    percent,
    amount,
    size = 170,
    status = 'normal',
    strokeWidth = 10,
}) => {
    let percentToShow = 0;
    let displayAmount = 0;

    if (typeof total === 'number' && typeof spent === 'number') {
        const remaining = Math.max(0, total - spent);
        const percentRemaining = total > 0 ? (remaining / total) * 100 : 0;
        const percentSpent = total > 0 ? Math.round((spent / total) * 100) : 0;
        percentToShow = percentSpent;
        displayAmount = remaining;

    } else {
        percentToShow = typeof percent === 'number' ? Math.round(percent) : 0;
        displayAmount = typeof amount === 'number' ? amount : percentToShow;
    }

    const formatInner = () => (
        <div className={styles.inner}>
            <div className={styles.amount}>${displayAmount.toLocaleString()}</div>
            <div className={styles.remaining}>remaining</div>
        </div>
    );

    return (
        <ConfigProvider
            theme={{
                "components": {
                    "Progress": {
                    "defaultColor": "#39BBBF",
                    "remainingColor": "#f0f0f0"
                    }
                }
            }}
        >
            <Progress
                type="circle"
                percent={percentToShow}
                status={status as any}
                strokeWidth={strokeWidth}
                size={size}
                format={formatInner}
            />
        </ConfigProvider>
    );
};

export default ProgressCircle;
