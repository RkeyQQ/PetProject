import { useEffect, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useApiData } from "../hooks/useApiData";
import "./TableGrid.css";

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
  const [hasUserSizing, setHasUserSizing] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!window.localStorage.getItem(storageKey);
  });
  const cardRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(columnSizing));
  }, [columnSizing, storageKey]);

  useEffect(() => {
    if (hasUserSizing) return;

    const applyAutoSizing = () => {
      const width = cardRef.current?.clientWidth ?? window.innerWidth ?? 900;
      const base = Math.max(
        60,
        Math.floor((width - 48) / Math.max(columns.length, 1))
      );

      const sizing = columns.reduce((acc, col, idx) => {
        const key =
          col.accessorKey ??
          col.id ??
          (typeof col.header === "string" ? col.header : `col-${idx}`);
        acc[key] = base;
        return acc;
      }, {});

      setColumnSizing((prev) => {
        const sameKeys =
          Object.keys(prev).length === Object.keys(sizing).length &&
          Object.keys(sizing).every((key) => prev[key] === sizing[key]);
        return sameKeys ? prev : sizing;
      });
    };

    applyAutoSizing();
    window.addEventListener("resize", applyAutoSizing);
    return () => window.removeEventListener("resize", applyAutoSizing);
  }, [columns, hasUserSizing]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility, columnSizing },
    defaultColumn: { minSize: 6, size: 48, maxSize: 400 },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: (updater) => {
      setHasUserSizing(true);
      setColumnSizing(updater);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });

  if (loading) {
    return (
      <div className="table-card">
        <p className="hero-subtitle">Thinking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-card">
        <div className="hero-subtitle" style={{ color: "red" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="table-card" ref={cardRef}>
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

      <div className="table-scroll">
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
                {row.getVisibleCells().map((cell) => {
                  const value = cell.getValue();
                  const isNumber = typeof value === "number";
                  const isEllipsable =
                    typeof value === "string" || typeof value === "number";

                  const rendered = flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  );

                  return (
                    <td
                      key={cell.id}
                      className={`td${isNumber ? " td-num" : ""}`}
                      style={{ width: cell.column.getSize() }}
                    >
                      {isEllipsable ? (
                        <span className="cell-ellipsis" title={String(value)}>
                          {rendered}
                        </span>
                      ) : (
                        rendered
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
