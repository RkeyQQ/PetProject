import { Link, useLocation } from "react-router-dom";
import "./Demo.css";
import TableGrid from "../components/TableGrid";
import MapCard from "../components/MapCard";

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
      type: "map",
      title: "Monitored Backup Locations",
      subtitle: "Global Coverage",
    },
    { type: "placeholder", title: "Widget placeholder A" },
    { type: "placeholder", title: "Widget placeholder B" },
  ];
  const widgetsRow2 = [
    { type: "placeholder", title: "Widget placeholder C" },
    { type: "placeholder", title: "Widget placeholder D" },
    { type: "placeholder", title: "Widget placeholder E" },
  ];

  return (
    <div className="demo">
      <section className="title-section">
        <h1 className="dashboard-title"> Demo Dashboard</h1>
      </section>

      <section className="data-section">
        <div className="widgets-row">
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

            return (
              <div key={idx} className="table-card widget-card">
                <p className="table-title">{widget.title}</p>
              </div>
            );
          })}
        </div>
        <div className="widgets-row">
          {widgetsRow2.map((widget, idx) => (
            <div key={idx} className="table-card widget-card">
              <p className="table-title">{widget.title}</p>
            </div>
          ))}
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
