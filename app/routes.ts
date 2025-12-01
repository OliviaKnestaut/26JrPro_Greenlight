import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("database-dump", "routes/database-dump.tsx"),
    route("app-layout-example", "routes/app-layout-example.tsx"),
] satisfies RouteConfig;
