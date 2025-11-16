import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useApiData } from "../hooks/useApiData";
import "../pages/Demo.css";

export default function TableGrid({ title, endpoint, columns, storageKey }) {
  const { data: info, error, loading } = useApiData(endpoint);
  const rows = info?.rows ?? [];

  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState(() => {
    if (typeof window === "undefined") return {};
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(columnSizing));
  }, [columnSizing, storageKey]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility, columnSizing },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });

  if (loading) {
    return (
      <div className="card wide">
        <p className="hero-subtitle">Thinking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card wide">
        <div className="hero-subtitle" style={{ color: "red" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="card wide">
      <div className="table-header">
        <p className="table-title">
          {title} - <code>{endpoint}</code>
        </p>

        <div className="col-controls">
          <details className="col-dropdown">
            <summary className="col-dropdown-trigger">Columns</summary>
            <div className="col-dropdown-menu">
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
          </details>
        </div>
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
                      {{ asc: "↑", desc: "↓" }[header.column.getIsSorted()] ??
                        ""}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
