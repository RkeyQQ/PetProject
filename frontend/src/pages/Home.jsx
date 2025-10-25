import { Link, useLocation } from "react-router-dom";

export default function Home() {
  const { pathname } = useLocation();
  const cardStyle = {
    flex: "1",
    minWidth: 260,
    maxWidth: 200,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    padding: "20px",
    margin: "12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };
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
  const cards = [
    {
      title: "Evaluate Cloud Monitoring",
      text: "Cloud-based infrastructure monitoring and management. Endless possibilities, zero overhead.",
      link: "/demo",
      linkText: "Try Demo",
    },
    {
      title: "Download On-Premises Solution",
      text: "Monitor your infrastructure with our on-premises solution for maximum control and security.",
      link: "/",
      linkText: "Download Now",
    },
    {
      title: "Subscribe to Premium",
      text: "Unlimited access to all features, priority support, and exclusive updates with our Premium plan.",
      link: "/",
      linkText: "Subscribe",
    },
  ];

  const heroTitle = {
    fontSize: "clamp(24px, 5vw, 48px)",
    lineHeight: 1.1,
    fontWeight: 700,
    textAlign: "center",
    margin: "0 0 12px 0",
    letterSpacing: "-0.02em",
  };

  const heroSubtitle = {
    fontSize: "clamp(14px, 2.2vw, 18px)",
    color: "#555",
    textAlign: "center",
    margin: "0 0 28px 0",
  };

  return (
    <section
      style={{
        background: "#d0f5d5ff",
        padding: "24px",
      }}
    >
      <h1 style={heroTitle}>Monitoring Hub</h1>
      <p style={heroSubtitle}>All your infrastructure insights in one place.</p>
      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        {cards.map((c, i) => (
          <div key={i} style={cardStyle}>
            <h3 style={{ margin: 0 }}>{c.title}</h3>
            <p style={{ color: "#555" }}>{c.text}</p>
            <Link to={c.link} style={linkStyle(pathname === c.link)}>
              {c.linkText}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
