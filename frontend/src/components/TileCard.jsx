import "./TileCard.css";

const ARROWS = {
  up: "▲",
  down: "▼",
};

export default function TileCard({
  title,
  subtitle,
  value,
  total,
  trend = "up",
  metaText,
  linkText,
  linkHref = "#",
}) {
  const direction = trend === "down" ? "down" : "up";

  return (
    <div className="table-card tile-card">
      <header className="tile-card__header">
        <div className="table-header">
          <p className="table-title">
            {title}
            {subtitle ? (
              <>
                {" - "}
                <code className="tile-card__subtitle">{subtitle}</code>
              </>
            ) : null}
          </p>
        </div>
      </header>

      <div className="tile-divider" />

      <div className="tile-card__body">
        <div className="tile-body-row">
          <div className="tile-metric">
            <span className="tile-metric__value">{value}</span>
            <span className="tile-metric__total">of {total}</span>
            <span
              className={`tile-arrow tile-arrow--${direction}`}
              aria-label={direction === "up" ? "Increasing" : "Decreasing"}
            >
              {ARROWS[direction]}
            </span>
          </div>

          {metaText ? <div className="tile-meta">{metaText}</div> : null}
        </div>
      </div>

      <div className="tile-divider" />

      <footer className="tile-card__footer">
        {linkText ? (
          <a
            className="tile-link"
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
