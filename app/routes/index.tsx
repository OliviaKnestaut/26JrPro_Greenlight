import { DashboardContent } from "~/components/organisms/dashboard";
import { Navigate, useLocation } from "react-router";

export default function IndexRoute() {
    const isAuthenticated = Boolean(localStorage.getItem('authToken'));
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <DashboardContent />;
}
