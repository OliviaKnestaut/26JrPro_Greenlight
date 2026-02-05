import React, { useState } from "react";
import { Card, Button, Typography, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { NavLink, Outlet, useLocation } from "react-router";
/*app\components\organisms\event-submissions\index.tsx to pull the search in*/ 

export default function Brainstorm() {
    const location = useLocation();
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
        <div className="container m-8 w-auto">
            <h1 className="text-2xl font-bold">{title}</h1>

            <div className="brainstorm-nav">
                <nav className="mt-4 space-x-4 toggle-nav">
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
