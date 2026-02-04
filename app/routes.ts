import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route("", "routes/_layout.tsx", [
        index("routes/index.tsx"),
        route("login", "routes/login.tsx"),
        route("database-dump", "routes/database-dump.tsx"),
        route("antd-example", "routes/antd-example.tsx"),
        route("event-submissions", "routes/event-submissions.tsx"),
        route("budget", "routes/budget.tsx"),
        route("resources", "routes/resources.tsx"),
        route("calendar", "routes/calendar.tsx"),
        route("org-members", "routes/org-members.tsx"),
        route("event-form", "routes/event-form.tsx"),
        route("event-overview", "routes/event-overview.tsx"),
        route("brainstorm", "routes/brainstorm.tsx", [
            route("docs", "routes/brainstorm/docs.tsx"),
            route("sheets", "routes/brainstorm/sheets.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
