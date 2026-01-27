import React from "react";
import { Link, Outlet } from "react-router";

export default function Brainstorm() {
    

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold">Brainstorm</h1>

            <nav className="mt-4 space-x-4">
                <Link to="/brainstorm/docs" className="text-blue-600 underline">Docs</Link>
                <Link to="/brainstorm/sheets" className="text-blue-600 underline">Sheets</Link>
            </nav>

            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
}
