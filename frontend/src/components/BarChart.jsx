import "./BarChart.css";

const GRID_LINES = [25, 50, 75, 100];

function getDayLabels() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - idx));
    return date.toLocaleDateString(undefined, { weekday: "short" });
  });
}

function normalizeData(data) {
  const safe = Array.isArray(data) ? data.slice(0, 7) : [];
  const normalized = safe.map((value) => {
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value));
  });

  while (normalized.length < 7) normalized.push(0);
  return normalized;
}

export default function BarChart({
  title,
  subtitle,
  data = [],
  threshold = 0,
  linkText,
  linkHref = "#",
}) {
  const values = normalizeData(data);
  const dayLabels = getDayLabels();
  const safeThreshold = Math.min(100, Math.max(0, threshold ?? 0));

  return (
    <div className="table-card bar-card">
      <header className="bar-card__header">
        <div className="table-header">
          <p className="table-title">
            {title}
            {subtitle ? (
              <>
                {" - "}
                <code className="bar-card__subtitle">{subtitle}</code>
              </>
            ) : null}
          </p>
        </div>
      </header>

      <div className="tile-divider" />

      <div className="bar-card__body">
        <div className="bar-chart">
          <div className="bar-chart__plot">
            <div className="bar-chart__y-scale" aria-hidden="true">
              {[0, 25, 50, 75, 100].map((mark) => (
                <span key={mark} className="bar-chart__y-label">
                  {mark}%
                </span>
              ))}
            </div>

            <div className="bar-chart__canvas" role="img" aria-label="Backup success over the last 7 days">
              {GRID_LINES.map((mark) => (
                <div
                  key={mark}
                  className="bar-chart__grid-line"
                  style={{ bottom: `${mark}%` }}
                />
              ))}

              <div className="bar-chart__bars">
                <div
                  className="bar-chart__threshold"
                  style={{ bottom: `${safeThreshold}%` }}
                />
                {values.map((value, idx) => {
                  const isHealthy = value >= safeThreshold;
                  return (
                    <div className="bar" key={`${value}-${idx}`}>
                      <div className="bar__track">
                        <div
                          className="bar__fill"
                          style={{
                            height: `${value}%`,
                            backgroundColor: isHealthy ? "#59ba57" : "#e05b5b",
                          }}
                          role="presentation"
                        >
                          <span className="bar__value">{value}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bar-chart__x-axis" aria-hidden="true">
            {dayLabels.map((label, idx) => (
              <div className="bar-chart__tick" key={`${label}-${idx}`}>
                <span className="bar-chart__dot" />
                <span className="bar-chart__tick-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tile-divider" />

      <footer className="bar-card__footer">
        {linkText ? (
          <a
            className="bar-chart__link"
            href={linkHref || "#"}
            aria-label={linkText}
          >
            {linkText}
          </a>
        ) : null}
      </footer>
    </div>
  );
}
