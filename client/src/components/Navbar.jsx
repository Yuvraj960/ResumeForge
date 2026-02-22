import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const navLinks = [
    { label: "🏠 Home", path: "/" },
    { label: "👤 Profile", path: "/profile" },
    { label: "✨ Builder", path: "/builder" },
];

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div
                className="navbar-logo"
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
            >
                ResumeForge
            </div>
            <div className="navbar-links">
                {navLinks.map((l) => (
                    <button
                        key={l.path}
                        className={`nav-link ${location.pathname === l.path ? "active" : ""}`}
                        onClick={() => navigate(l.path)}
                    >
                        {l.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
