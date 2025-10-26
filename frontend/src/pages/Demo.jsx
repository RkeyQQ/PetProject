import { Link, useLocation } from "react-router-dom";
import { useApiData } from "../hooks/useApiData";

export default function Demo() {
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

  const {
    data: info,
    error,
    loading,
  } = useApiData("demo/table/job_states/rows");

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <section
      style={{
        background: "#f0fff2ff",
        padding: "24px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>The Demo</h2>
      <p style={{ color: "#666", marginTop: 0 }}>
        Backup Jobs → <code>demo/table/job_states/rows</code>
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
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      padding: 8,
                    }}
                  >
                    Last Result
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      padding: 8,
                    }}
                  >
                    Job Name
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      padding: 8,
                    }}
                  >
                    Backup Server
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      padding: 8,
                    }}
                  >
                    Job Type
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      padding: 8,
                    }}
                  >
                    Last Run
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      padding: 8,
                    }}
                  >
                    Next Run
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      padding: 8,
                    }}
                  >
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {(info?.rows ?? []).map((r) => (
                  <tr key={r.job_id}>
                    <td style={{ padding: 8 }}>{r.last_result}</td>
                    <td style={{ padding: 8 }}>{r.name}</td>
                    <td style={{ padding: 8 }}>{r.host}</td>
                    <td style={{ padding: 8 }}>{r.jtype}</td>
                    <td style={{ padding: 8 }}>{r.last_run}</td>
                    <td style={{ padding: 8 }}>{r.next_run}</td>
                    <td style={{ padding: 8 }}>{r.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
