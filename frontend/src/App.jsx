import React, { Suspense, lazy } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const ChatWidget = lazy(() => import("./components/ChatWidget"));

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app">
      {/* HEADER */}

      <header className="app-bar header">
        <Link to="/" className="brand" style={{ textDecoration: "none" }}>
          <img
            src="/logo.png"
            alt="Monitoring Hub logo"
            className="brand-logo"
          />
          <div className="brand-name">
            <span className="brand-accent">MONITORING &nbsp;HUB</span>
          </div>
        </Link>

        <div className="align-right">
          <Link
            to="/selfcheck"
            className={`link${pathname === "/selfcheck" ? " active" : ""}`}
          >
            Self Check
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="app-bar footer">
        Made by&nbsp;
        <a
          href="https://www.linkedin.com/in/roman-kuksov/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          Roman Key
        </a>
      </footer>

      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </div>
  );
}
