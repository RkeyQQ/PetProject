import { Link, useLocation } from "react-router-dom";
import { useApiData } from "../hooks/useApiData";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import "./Demo.css";

export default function Demo() {
  const { pathname } = useLocation();

  const {
    data: info,
    error,
    loading,
  } = useApiData("demo/table/job_states/rows");

  const columns = [
    { header: "Last Result", accessorKey: "last_result" },
    { header: "Job Name", accessorKey: "name" },
    { header: "Backup Server", accessorKey: "host" },
    { header: "Job Type", accessorKey: "jtype" },
    { header: "Last Run", accessorKey: "last_run" },
    { header: "Next Run", accessorKey: "next_run" },
    { header: "Created At", accessorKey: "created_at" },
  ];

  const data = info?.rows ?? [];

  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState(() => {
    const saved = localStorage.getItem("demoColumnSizing");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("demoColumnSizing", JSON.stringify(columnSizing));
  }, [columnSizing]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, columnSizing },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });

  return (
    <section className="main-section">
      <h1 className="hero-title">THE Demo</h1>
      <p className="hero-subtitle">Main Dashboard</p>

      {loading && <p className="hero-subtitle">Loading…</p>}
      {error && (
        <div className="hero-subtitle" style={{ color: "red" }}>
          Error: {error}
        </div>
      )}

      {info && (
        <div className="card wide">
          <p className="table-title">
            Backup Jobs → <code>demo/table/job_states/rows</code>
          </p>

          <div className="col-controls">
            {table
              .getAllLeafColumns()
              .filter((col) => col.getCanHide?.() ?? true)
              .map((col) => (
                <label key={col.id} className="col-toggle">
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                  />
                  {String(col.columnDef.header ?? col.id)}
                </label>
              ))}
          </div>

          <div>
            <table className="data-table">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={(e) => {
                          if (
                            e.target instanceof HTMLElement &&
                            e.target.closest(".resizer")
                          )
                            return;
                          header.column.getToggleSortingHandler()(e);
                        }}
                        className="th th-sortable"
                        style={{ width: header.getSize() }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="sort-ind">
                          {{ asc: "▲", desc: "▼" }[
                            header.column.getIsSorted()
                          ] ?? ""}
                        </span>

                        <div
                          className={`resizer ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`}
                          draggable={false}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            header.getResizeHandler()(e);
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            header.getResizeHandler()(e);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            header.getResizeHandler()(e);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onDragStart={(e) => e.preventDefault()}
                        />
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="td"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="align-right">
        <Link to="/" className={`link${pathname === "/" ? " active" : ""}`}>
          Back
        </Link>
      </div>
    </section>
  );
}
