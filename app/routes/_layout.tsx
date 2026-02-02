import React, { useEffect } from 'react';
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
                        headerBg: "var(--sage-3)",
                        headerSplitColor: "rgba(0, 0, 0, 0.06)",
                        borderColor: "rgba(0, 0, 0, 0.06)",
                        rowHoverBg: "rgba(0, 0, 0, 0.06)",
                        headerBorderRadius: 0,
                        borderRadius: 0,
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

    
    // Set document title and favicon
    
    const mapTitles: Record<string, string> = {
        "/": "Home | GreenLight",
        "/login": "Login | GreenLight",
        "/database-dump": "Database Dump | GreenLight",
        "/antd-example": "Ant Design Example | GreenLight",
        "/event-submissions": "Event Submissions | GreenLight",
        "/purchase-requests": "Purchase Requests | GreenLight",
        "/budget": "Budget | GreenLight",
        "/resources": "Resources | GreenLight",
        "/calendar": "Calendar | GreenLight",
        "/org-members": "Organization Members | GreenLight",
        "/event-form": "Event Form | GreenLight",
    };

    useEffect(() => {
        document.title = mapTitles[location.pathname] ?? "GreenLight";

        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.type = "image/svg+xml";
        link.href = "app/components/assets/GreenlightLogo.svg";
    }, [location.pathname]);


    return (
        <AppLayout isAuthenticated={true} user={user} onLogout={handleLogout}>
            <Outlet />
        </AppLayout>
    );
}
