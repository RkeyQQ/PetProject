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
        maxWidth: 1200,
        margin: "0px auto",
        padding: "0 16px",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      <header
        style={{
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
      <Outlet />
    </div>
  );
}
