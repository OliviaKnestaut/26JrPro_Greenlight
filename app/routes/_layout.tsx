import React, { useEffect, Suspense } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router';
import { AppLayout } from '../components/organisms/app-layout';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from '../auth/AuthProvider';
import Loading from '../components/molecules/loading/Loading';


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
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    // Set document title and favicon
    useEffect(() => {
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

        document.title = mapTitles[location.pathname] ?? "GreenLight";

        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.type = "image/svg+xml";
        link.href = `${(import.meta as any).env?.BASE_URL ?? '/'}GreenlightLogo.svg`;
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isLoginRoute = location.pathname === '/login';

    // Avoid render-time redirects (which can cause update loops) by navigating in effects.
    useEffect(() => {
        if (isLoginRoute && user) {
            // user just became authenticated while on /login -> navigate to home
            navigate('/', { replace: true });
        }
    }, [isLoginRoute, user, navigate]);

    useEffect(() => {
        if (!isLoginRoute && !user) {
            // unauthenticated user attempting to access a protected route -> send to login
            navigate('/login', { replace: true, state: { from: location } });
        }
    }, [isLoginRoute, user, navigate, location]);

    if (loading) return <Loading text="Checking authentication..." />;

    if (isLoginRoute) {
        return <Outlet />;
    }

    if (!user) {
        // navigation effect is handling redirect; render a lightweight placeholder
        return <Loading text="Redirecting to login..." />;
    }

    return (
        <AppLayout isAuthenticated={true} user={user} onLogout={handleLogout}>
            <Suspense fallback={<Loading />}>
                <Outlet />
            </Suspense>
        </AppLayout>
    );
}
