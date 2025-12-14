import { Link, useLocation } from "react-router-dom";
import "./Demo.css";
import TableGrid from "../components/TableGrid";
import MapCard from "../components/MapCard";
import TileCard from "../components/TileCard";
import BarChart from "../components/BarChart";
import StackedBarChart from "../components/StackedBarChart";

const jobColumns = [
  { header: "Last Result", accessorKey: "last_result" },
  { header: "Job Name", accessorKey: "name" },
  { header: "Backup Server", accessorKey: "host" },
  { header: "Job Type", accessorKey: "jtype" },
  { header: "Last Run", accessorKey: "last_run" },
  { header: "Next Run", accessorKey: "next_run" },
  { header: "Created At", accessorKey: "created_at" },
];
const repoColumns = [
  { header: "Backup Server", accessorKey: "host" },
  { header: "Repository Name", accessorKey: "name" },
  { header: "Repository Type", accessorKey: "rtype" },
  { header: "Path", accessorKey: "path" },
  { header: "Capacity (GB)", accessorKey: "capacity_gb" },
  { header: "Free Space (GB)", accessorKey: "free_gb" },
  { header: "Used Space (GB)", accessorKey: "used_gb" },
  { header: "Online Status", accessorKey: "is_online" },
  { header: "Update Status", accessorKey: "is_out_of_date" },
  { header: "Created At", accessorKey: "created_at" },
];

export default function Demo() {
  const { pathname } = useLocation();

  const widgets = [
    {
      type: "tile",
      title: "Backup Servers",
      subtitle: "State",
      value: 2,
      total: 1,
      trend: "down",
      metaText: "1 with error",
      linkText: "View report...",
      linkHref: "",
    },
    {
      type: "tile",
      title: "Backup Jobs",
      subtitle: "State",
      value: 10,
      total: 8,
      trend: "up",
      metaText: "2 with error",
      linkText: "View report...",
      linkHref: "",
    },
    {
      type: "map",
      title: "Monitored Backup Locations",
      subtitle: "Global Coverage",
    },
    {
      type: "bar",
      title: "Backup SLA",
      subtitle: "Last 7 Days",
      data: [100, 95, 100, 92, 88, 100, 100],
      threshold: 90,
      linkText: "View report...",
      linkHref: "",
    },
    {
      type: "stacked-bar",
      title: "Backup Job State",
      subtitle: "Last 7 Days",
      data: [
        [10, 0, 0],
        [10, 4, 1],
        [13, 0, 1],
        [10, 3, 0],
        [15, 3, 2],
        [8, 2, 0],
        [8, 0, 2],
      ],
      linkText: "View report...",
      linkHref: "",
    },
  ];

  return (
    <div className="demo">
      <section className="title-section">
        <h1 className="dashboard-title"> Demo Dashboard</h1>
      </section>

      <section className="data-section">
        <div className="widgets-grid">
          {widgets.map((widget, idx) => {
            if (widget.type === "map") {
              return (
                <MapCard
                  key={idx}
                  title={widget.title}
                  subtitle={widget.subtitle}
                />
              );
            }

            if (widget.type === "tile") {
              return (
                <TileCard
                  key={idx}
                  title={widget.title}
                  value={widget.value}
                  total={widget.total}
                  subtitle={widget.subtitle}
                  trend={widget.trend}
                  metaText={widget.metaText}
                  linkText={widget.linkText}
                  linkHref={widget.linkHref}
                />
              );
            }

            if (widget.type === "bar") {
              return (
                <BarChart
                  key={idx}
                  title={widget.title}
                  subtitle={widget.subtitle}
                  data={widget.data}
                  threshold={widget.threshold}
                  linkText={widget.linkText}
                  linkHref={widget.linkHref}
                />
              );
            }

            if (widget.type === "stacked-bar") {
              return (
                <StackedBarChart
                  key={idx}
                  title={widget.title}
                  subtitle={widget.subtitle}
                  data={widget.data}
                  linkText={widget.linkText}
                  linkHref={widget.linkHref}
                />
              );
            }

            return (
              <div key={idx} className="table-card widget-card">
                <p className="table-title">{widget.title}</p>
              </div>
            );
          })}
        </div>

        <TableGrid
          title="Backup Jobs"
          endpoint="demo/table/job_states/rows"
          columns={jobColumns}
          storageKey="jobTableSizing"
        />

        <TableGrid
          title="Repository States"
          endpoint="demo/table/repo_states/rows"
          columns={repoColumns}
          storageKey="repoTableSizing"
        />

        <div className="align-right">
          <Link to="/" className={`link${pathname === "/" ? " active" : ""}`}>
            Back
          </Link>
        </div>
      </section>
    </div>
  );
}
