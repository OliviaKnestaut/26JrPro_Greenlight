import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route("", "routes/_layout.tsx", [
        index("routes/index.tsx"),
        route("database-dump", "routes/database-dump.tsx"),
        route("app-layout-example", "routes/app-layout-example.tsx"),
        route("test-form", "routes/test-form.tsx"),
    ]),
] satisfies RouteConfig;
