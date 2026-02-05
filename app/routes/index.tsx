import { DashboardContent } from "~/components/organisms/dashboard";
import { Navigate } from "react-router";

export default function IndexRoute() {
    const isAuthenticated = Boolean(localStorage.getItem('authToken'));

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <DashboardContent />;
}
