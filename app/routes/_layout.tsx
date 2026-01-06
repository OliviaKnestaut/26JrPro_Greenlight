import React from 'react';
import { Outlet } from 'react-router';
import { AppLayout } from '../components/organisms/app-layout';

export default function RootLayout() {
    return (
        <AppLayout isAuthenticated={true}>
            <Outlet />
        </AppLayout>
    );
}
