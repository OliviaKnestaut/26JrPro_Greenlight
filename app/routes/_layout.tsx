import React from 'react';
import { Outlet } from 'react-router';
import { AppLayout } from '../components/organisms/app-layout';
import { ConfigProvider } from 'antd';

export default function RootLayout() {
    return (
        <ConfigProvider
            theme={
                {
                "token": {
                    "wireframe": false,
                    "borderRadius": 11,
                    "colorPrimary": "#045966",
                    "colorInfo": "#045966"
                }
                }
            }
        >
            <AppLayout isAuthenticated={true}>
                <Outlet />
            </AppLayout>
        </ConfigProvider>
    );
}
