import { Link, useLocation } from "react-router-dom";
import "./Demo.css";
import TableGrid from "../components/TableGrid";

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

  return (
    <section className="main-section">
      <h1 className="hero-title"> Demo Dashboard</h1>

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
  );
}
