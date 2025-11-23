import React from "react";

export default function ClinicListHeader({ columns, filters, onFilter }) {
  return (
    <div className="clinic-header-container">
      <div className="clinic-header-row">
        {columns.map((col) => (
          <div
            key={col.field}
            className="clinic-header-cell"
            style={{ width: col.width }}
          >
            {col.title}
          </div>
        ))}
      </div>

      <div className="clinic-filter-row">
        {columns.map((col) => (
          <div
            key={col.field}
            className="clinic-filter-cell"
            style={{ width: col.width }}
          >
            {col.filterType === "text" && (
              <input
                type="text"
                className="clinic-filter-input"
                placeholder={col.title}
                value={filters[col.field] || ""}
                onChange={(e) => onFilter(col.field, e.target.value)}
              />
            )}

            {col.filterType === "select" && (
              <select
                className="clinic-filter-input"
                value={filters[col.field] || ""}
                onChange={(e) => onFilter(col.field, e.target.value)}
              >
                <option value="">All</option>
                {col.options?.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
