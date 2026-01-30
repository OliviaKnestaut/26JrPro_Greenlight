import React from "react";
import { Link, Outlet } from "react-router";

export default function Brainstorm() {
    
let title = "Brainstorm";
  if (location.pathname.includes("/docs")) title = "Docs Overview";
  if (location.pathname.includes("/sheets")) title = "Sheets Overview";

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold">{title}</h1>

            <nav className="mt-4 space-x-4 toggle-nav">
                <Link to="/brainstorm/docs" className="text-blue-600 underline">Docs</Link>
                <Link to="/brainstorm/sheets" className="text-blue-600 underline">Sheets</Link>
            </nav>

            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
}
