import { Link, Outlet, useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  const linkStyle = (active) => ({
    padding: "8px 12px",
    textDecoration: "none",
    color: active ? "#111" : "#222",
  });

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "5px auto",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "16px 32px",
        }}
      >
        <Link to="/selfcheck" style={linkStyle(pathname === "/")}>
          Self Check
        </Link>
      </header>
      <Outlet />
    </div>
  );
}
