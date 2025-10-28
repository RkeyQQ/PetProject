import { Link, Outlet, useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app">
      {/* HEADER */}

      <header className="app-bar header">
        <div className="header-right">
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
    </div>
  );
}
