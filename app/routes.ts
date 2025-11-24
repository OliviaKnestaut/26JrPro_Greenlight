import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("database-dump", "routes/database-dump.tsx"),
    route("antd-example", "routes/antd-example.tsx"),
] satisfies RouteConfig;
