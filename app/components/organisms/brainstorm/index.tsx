import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, Typography, Input } from "antd";
import { SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { NavLink, Outlet, useLocation } from "react-router";
const { Title, Paragraph, Link } = Typography;

export function BrainstormContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    let title = "Brainstorm";
    let buttonText = "New";
    if (location.pathname.includes("/docs")) {
        title = "Docs Overview";
        buttonText = "New Doc";
    }
    if (location.pathname.includes("/sheets")) {
        title = "Sheets Overview";
        buttonText = "New Sheet";
    }

    return (
        <div >
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem", width: "100%" }}>
                <Title level={2} style={{ margin: 0 }}>{title}</Title>
            </div>

            <div className="brainstorm-nav">
                <nav className="mt-4 space-x-4 toggle-nav w-full">
                    <NavLink to="/brainstorm/docs">Docs</NavLink>
                    <NavLink to="/brainstorm/sheets">Sheets</NavLink>
                </nav>

                <Button type='default' className="btn">{buttonText}</Button>
            </div>
                {/* Search */}
            <div style={{ display: "flex", marginTop: 16 }}>
                <Input
                placeholder="Search for your event..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onPressEnter={e =>
                    setQuery((e.target as HTMLInputElement).value)
                }
                allowClear
                onClear={() => setQuery("")}
                style={{ borderRadius: 0 }}
                />

                <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setQuery(query)}
                style={{
                    borderRadius: 0,
                    border: 0,
                    width: "46px",
                    boxShadow: "none",
                    height: 43,
                }}
                />
            </div>
            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
}

export default BrainstormContent;