import React, { useCallback, useEffect } from 'react';
import { Button, Space } from 'antd';

function getAntTokens() {
    if (typeof window === 'undefined' || !window.getComputedStyle) return {} as Record<string, string>;
    const styles = getComputedStyle(document.documentElement);
    const tokens: Record<string, string> = {};
    for (let i = 0; i < styles.length; i++) {
        const name = styles[i];
        if (name.startsWith('--ant-') || name.startsWith('--antd-')) {
            tokens[name] = styles.getPropertyValue(name).trim();
        }
    }
    return tokens;
}

export default function AntdExample() {
    const logTokens = useCallback(() => {
        try {
            const tokens = getAntTokens();
            if (Object.keys(tokens).length === 0) {
                console.info('No Ant Design tokens found on :root. Ensure `antd/dist/reset.css` is loaded.');
                return;
            }
            console.table(tokens);
            // also provide a JSON blob for easy copying
            console.log('Ant tokens JSON:', JSON.stringify(tokens, null, 2));
        } catch (e) {
            console.error('Failed to read Ant tokens', e);
        }
    }, []);

    useEffect(() => {
        if (import.meta.env.DEV) {
            // Auto-log tokens in dev mode for convenience
            logTokens();
        }
    }, [logTokens]);

    return (
        <div style={{ padding: 16 }}>
            <h2>Ant Design Example</h2>
            <Space style={{ marginBottom: 12 }}>
                <Button type="primary">Primary</Button>
                <Button>Default</Button>
                <Button onClick={logTokens}>Log Ant tokens</Button>
            </Space>
        </div>
    );
}
