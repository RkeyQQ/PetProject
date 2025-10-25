import { Link, Outlet, useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  const linkStyle = (active) => ({
    display: "inline-block",
    minWidth: 90,
    textAlign: "center",
    padding: "8px 12px",
    textDecoration: "none",
    color: active ? "#111" : "#222",
    background: active ? "#e7f1ff" : "#e7f1ff",
    borderRadius: 10,
    border: active ? "1px solid #c9defc" : "1px solid #c9defc",
  });

  return (
    <div
      style={{
        width: "100%",
        // maxWidth: "min(1200px, 100%)",
        margin: "0px auto",
        padding: "16 16px",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          minHeight: 32,
          padding: "16px 32px",
          background: "#a8bcffff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link to="/selfcheck" style={linkStyle(pathname === "/")}>
            Self Check
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <Outlet />

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "left",

          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          minHeight: 64,

          background: "#a8bcffff",
          borderTop: "1px solid #eee",
          color: "#666",
          fontSize: 14,
        }}
      >
        Made by&nbsp;{" "}
        <a
          href="https://www.linkedin.com/in/roman-kuksov/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4a6cff", textDecoration: "none" }}
        >
          Roman Key
        </a>
      </footer>
    </div>
  );
}
