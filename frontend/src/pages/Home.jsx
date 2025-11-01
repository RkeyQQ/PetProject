import { Link, useLocation } from "react-router-dom";

export default function Home() {
  const { pathname } = useLocation();
  const cards = [
    {
      title: "Evaluate Cloud Monitoring",
      text: "Cloud-based infrastructure monitoring and management. Endless possibilities, zero overhead.",
      link: "/demo",
      linkText: "Try Demo",
    },
    {
      title: "On-Premises Solution",
      text: "Monitor your infrastructure with our on-premises solution for maximum control and security.",
      link: "https://github.com/RkeyQQ/PetProject",
      linkText: "Download Now",
      external: true,
    },
    {
      title: "Subscribe to Premium",
      text: "Unlimited access to all features, priority support, and exclusive updates with our Premium plan.",
      link: "/",
      linkText: "Subscribe",
      disabled: true,
    },
  ];

  return (
    <section className="main-section">
      <h1 className="hero-title">Monitoring Hub</h1>
      <p className="hero-subtitle">
        All your infrastructure insights in one place
      </p>
      <div className="cards">
        {cards.map((c, i) => (
          <div key={i} className="card">
            <h3>{c.title}</h3>
            <p>{c.text}</p>
            {c.disabled ? (
              <span className="link disabled">{c.linkText}</span>
            ) : c.external ? (
              <a
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                {c.linkText}
              </a>
            ) : (
              <Link
                to={c.link}
                className={`link${pathname === c.link ? " active" : ""}`}
              >
                {c.linkText}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
