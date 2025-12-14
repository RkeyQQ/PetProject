import "./StackedBarChart.css";

const COLORS = {
  success: "#59ba57",
  warning: "#d6b04a",
  error: "#e05b5b",
};

function getDayLabels() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - idx));
    return date.toLocaleDateString(undefined, { weekday: "short" });
  });
}

function normalizeSeries(data) {
  const safe = Array.isArray(data) ? data.slice(0, 7) : [];

  const normalized = safe.map((entry) => {
    const values = Array.isArray(entry) ? entry.slice(0, 3) : [];
    const padded = [0, 0, 0];

    for (let i = 0; i < padded.length; i += 1) {
      const value = values[i];
      padded[i] = Number.isFinite(value) && value > 0 ? value : 0;
    }

    return padded;
  });

  while (normalized.length < 7) normalized.push([0, 0, 0]);
  return normalized;
}

function getScale(values) {
  const totals = values.map((parts) =>
    parts.reduce((sum, value) => sum + value, 0)
  );
  const maxTotal = Math.max(1, Math.max(...totals, 0));
  const roughStep = Math.ceil(maxTotal / 4);
  const pow10 = 10 ** Math.max(0, Math.floor(Math.log10(roughStep)));
  const niceStep = Math.ceil(roughStep / pow10) * pow10;

  return {
    totals,
    maxScale: niceStep * 4 || 1,
    step: niceStep || 1,
  };
}

export default function StackedBarChart({
  title,
  subtitle,
  data = [],
  linkText,
  linkHref = "#",
}) {
  const values = normalizeSeries(data);
  const { totals, maxScale, step } = getScale(values);
  const dayLabels = getDayLabels();

  const scaleMarks = Array.from({ length: 5 }, (_, idx) => idx * step);

  return (
    <div className="table-card bar-card stacked-bar-card">
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
        <div className="stacked-bar-chart">
          <div className="stacked-bar-chart__plot">
            <div className="stacked-bar-chart__y-scale" aria-hidden="true">
              {scaleMarks
                .slice()
                .reverse()
                .map((mark) => (
                  <span key={mark} className="stacked-bar-chart__y-label">
                    {mark}
                  </span>
                ))}
            </div>

            <div
              className="stacked-bar-chart__canvas"
              role="img"
              aria-label="Backup job state over the last 7 days"
            >
              {scaleMarks.slice(1).map((mark) => (
                <div
                  key={mark}
                  className="stacked-bar-chart__grid-line"
                  style={{ bottom: `${(mark / maxScale) * 100}%` }}
                />
              ))}

              <div className="stacked-bar-chart__bars">
                {values.map(([success, warning, error], idx) => {
                  const total = totals[idx];
                  const segments = [
                    { key: "error", value: error, color: COLORS.error },
                    { key: "warning", value: warning, color: COLORS.warning },
                    { key: "success", value: success, color: COLORS.success },
                  ];

                  let topIndex = -1;
                  for (let i = segments.length - 1; i >= 0; i -= 1) {
                    if (segments[i].value > 0) {
                      topIndex = i;
                      break;
                    }
                  }

                  let bottomIndex = -1;
                  for (let i = 0; i < segments.length; i += 1) {
                    if (segments[i].value > 0) {
                      bottomIndex = i;
                      break;
                    }
                  }

                  const stackHeight = total > 0 ? (total / maxScale) * 100 : 0;

                  return (
                    <div
                      className="stacked-bar"
                      key={`${success}-${warning}-${error}-${idx}`}
                    >
                      <div className="stacked-bar__track" aria-hidden="true">
                        <div
                          className="stacked-bar__stack"
                          style={{ height: `${stackHeight}%` }}
                        >
                          {segments.map((segment, segmentIdx) => {
                            const height =
                              total > 0 ? (segment.value / total) * 100 : 0;
                            return (
                              <div
                                key={segment.key}
                                className={[
                                  "stacked-bar__segment",
                                  `stacked-bar__segment--${segment.key}`,
                                  segmentIdx === topIndex && segment.value > 0
                                    ? "stacked-bar__segment--top"
                                    : "",
                                  segmentIdx === bottomIndex && segment.value > 0
                                    ? "stacked-bar__segment--bottom"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                style={{
                                  height: `${height}%`,
                                  backgroundColor: segment.color,
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <span className="stacked-bar__value">{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="stacked-bar-chart__x-axis" aria-hidden="true">
            {dayLabels.map((label, idx) => (
              <div className="stacked-bar-chart__tick" key={`${label}-${idx}`}>
                <span className="stacked-bar-chart__dot" />
                <span className="stacked-bar-chart__tick-label">{label}</span>
              </div>
            ))}
          </div>

          <div className="stacked-bar-chart__legend" aria-hidden="true">
            <span className="legend-pill legend-pill--success">Success</span>
            <span className="legend-pill legend-pill--warning">Warning</span>
            <span className="legend-pill legend-pill--error">Error</span>
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
