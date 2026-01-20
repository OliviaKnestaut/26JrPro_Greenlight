import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route("", "routes/_layout.tsx", [
        index("routes/index.tsx"),
        route("database-dump", "routes/database-dump.tsx"),
        route("antd-example", "routes/antd-example.tsx"),
        route("event-submissions", "routes/event-submissions.tsx"),
        route("purchase-requests", "routes/purchase-requests.tsx"),
        route("budget", "routes/budget.tsx"),
        route("resources", "routes/resources.tsx"),
        route("calendar", "routes/calendar.tsx"),
        route("org-members", "routes/org-members.tsx"),
        route("test-form", "routes/test-form.tsx"),
    ]),
] satisfies RouteConfig;