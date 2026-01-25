import React from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router';
import { AppLayout } from '../components/organisms/app-layout';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from '../auth/AuthProvider';

export default function RootLayout() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    wireframe: false,
                    borderRadius: 11,
                    colorPrimary: "#045966",
                    colorInfo: "#045966",
                },
                components: {
                    Table: {
                        headerBg: "var(--primary-bright)",
                    },
                    Checkbox: {
                        borderRadiusSM: 0,
                    },
                    Popover: {
                        borderRadiusLG: 0,
                        borderRadiusXS: 0,
                    }
                }
            }}
        >
            <AuthProvider>
                <AuthGate />
            </AuthProvider>
        </ConfigProvider>
    );
}

function AuthGate() {
    const location = useLocation();
    const isLoginRoute = location.pathname === '/login';
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (isLoginRoute) return <Outlet />;

    if (!user) return <Navigate to="/login" replace />;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppLayout isAuthenticated={true} user={user} onLogout={handleLogout}>
            <Outlet />
        </AppLayout>
    );
}
