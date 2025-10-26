import { Link, useLocation } from "react-router-dom";
import { useApiData } from "../hooks/useApiData";

export default function SelfCheck() {
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
  const { data: info, error, loading } = useApiData("db/ping");

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <section
      style={{
        background: "#f0fff2ff",
        padding: "24px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Self Check</h2>
      <p style={{ color: "#666" }}>
        Backend API check → <code>/api/db/ping</code>
      </p>
      {loading && <p>Loading…</p>}
      {error && (
        <div
          style={{
            background: "#fee",
            border: "1px solid #fcc",
            padding: 12,
            borderRadius: 8,
          }}
        >
          Error: {error}
        </div>
      )}
      {info && (
        <div
          style={{
            background: "#f7f7f7",
            border: "1px solid #eee",
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <strong>SQLite:</strong> {info.sqlite_version ?? "—"}
          </div>
          <div style={{ marginTop: 8 }}>
            <strong>Tables:</strong>
            <ul>
              {(info.tables ?? []).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link to="/" style={linkStyle(pathname === "/")}>
          Back
        </Link>
      </div>
    </section>
  );
}
