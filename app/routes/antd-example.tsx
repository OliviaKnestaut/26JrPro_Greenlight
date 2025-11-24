import React from "react";
import { AppLayout } from "../components/organisms/app-layout";
import AntdExample from "../components/AntdExample";

export default function AntdExamplePage() {
    return (
        <AppLayout isAuthenticated={true}>
            <AntdExample />
        </AppLayout>
    );
}
