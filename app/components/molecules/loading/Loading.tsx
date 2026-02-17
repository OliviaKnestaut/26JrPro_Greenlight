import React from 'react';
import { Spin } from 'antd';

export const Loading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
    const style: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        background: 'var(--bg, white)'
    };
    return (
        <div style={style}>
            <Spin size="large" tip={text} />
        </div>
    );
};

export default Loading;
