import { Link, useLocation } from "react-router-dom";
import { useApiData } from "../hooks/useApiData";

export default function SelfCheck() {
  const { pathname } = useLocation();
  const { data: info, error, loading } = useApiData("db/ping");

  return (
    <section className="main-section">
      <h1 className="hero-title">Self Check</h1>
      <p className="hero-subtitle">
        Backend API check → <code>/api/db/ping</code>
      </p>
      {loading && <p className="hero-subtitle">Loading…</p>}
      {error && <div className="hero-subtitle">Error: {error}</div>}
      {info && (
        <div className="card wide">
          <p>
            <strong>SQLite:</strong> {info.sqlite_version ?? "—"}
          </p>
          <p>
            <strong>Tables:</strong>
          </p>
          <ul>
            {(info.tables ?? []).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="align-right">
        <Link to="/" className={`link${pathname === "/" ? " active" : ""}`}>
          Back
        </Link>
      </div>
    </section>
  );
}
