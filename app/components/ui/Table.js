import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

export function Table({ columns = [], rows = [], rowKey = "id", caption, loading = false, loadingRows = 4, emptyState, className = "" }) {
  const getKey = (row, index) => typeof rowKey === "function" ? rowKey(row, index) : row?.[rowKey] ?? index;
  return (
    <div className={["ui-table-wrap", className].filter(Boolean).join(" ")}>
      <table className="ui-table">
        {caption ? <caption>{caption}</caption> : null}
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col" className={column.align ? `ui-align-${column.align}` : ""}>{column.header}</th>)}</tr></thead>
        <tbody>
          {loading ? Array.from({ length: Math.max(1, loadingRows) }, (_, rowIndex) => (
            <tr key={`loading-${rowIndex}`}><td colSpan={columns.length}>{<Skeleton width={`${72 - (rowIndex % 3) * 12}%`} height="1rem" />}</td></tr>
          )) : rows.length ? rows.map((row, rowIndex) => (
            <tr key={getKey(row, rowIndex)}>{columns.map((column) => (
              <td key={column.key} className={column.align ? `ui-align-${column.align}` : ""}>
                {column.render ? column.render(row, rowIndex) : row?.[column.key]}
              </td>
            ))}</tr>
          )) : <tr><td colSpan={Math.max(columns.length, 1)}>{emptyState || <EmptyState title="No records found" description="There are no records to display." />}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
