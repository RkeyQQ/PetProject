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
      text: "Monitor your infrastructure with on-premises solution for maximum control and security.",
      link: "https://github.com/RkeyQQ/PetProject",
      linkText: "Download (GitHub)",
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
    <div className="home">
      <section className="hero-section">
        <h1 className="hero-title">Simplify your Infrastructure Monitoring</h1>
        <p className="hero-subtitle">
          Reliable, scalable, and cloud-ready monitoring <br />
          for modern IT environments. <br />
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
      <section className="info-section">
        <p className="hero-subtitle">Exceeding Expectations</p>
        <div className="card mid wide">
          <p>
            This SaaS-style pet project is built as a modern full-stack solution
            leveraging <strong>Python</strong> with <strong>FastAPI</strong> on
            the backend, paired with a high-performance{" "}
            <strong>React + Vite</strong> frontend powered by{" "}
            <strong>JavaScript</strong>.
          </p>
          <p>
            <span className="brand-accent">
              <strong>ATTENTION:</strong>
            </span>{" "}
            both the application and the API are deployed on{" "}
            <strong>Google Cloud</strong> using <strong>Cloud Run</strong> and{" "}
            <strong>Firebase Hosting</strong>. As they run on the free public
            cloud tier, the very first API call may experience a slight
            cold-start delay — a natural trade-off for serverless efficiency.
          </p>
          <p>
            The entire solution is containerized with <strong>Docker</strong>,
            ensuring consistent, reproducible builds and smooth deployment.
            CI/CD integration is handled through{" "}
            <strong>GitHub workflows</strong>, enabling automated builds and
            deployments directly from the repository.
          </p>
          <p>
            <span className="brand-accent">Technologies: </span>
            AI, Fullstack, Python, FastAPI, React, Vite, JavaScript, Google
            Cloud, CloudRun, FirebaseHosting, Docker, CI/CD, GitHubActions,
            SaaS, IndieDev.
          </p>
        </div>
      </section>
    </div>
  );
}
