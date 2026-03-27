
"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useTableStore } from "@/app/store/TableStore";
import TableCell from "@/components/TableCell";
import TableColumnHeader from "../../components/TablecolumnHeader";
import FormulaModal from "@/components/formula/FormulaModal";
import type { DbView } from "@/components/DatabaseViewtabs";

export default function TableView({
  databaseId,
  isViewOnly = false,
}: {
  databaseId: string;
  isViewOnly?: boolean;
  activeViewId?: string;
  activeView?: DbView;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { columns, rows, fetchColumns, fetchRows, addColumn, addRow } =
    useTableStore();

  useEffect(() => {
    fetchColumns(databaseId);
    fetchRows(databaseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [databaseId]);

  return (
    <div className={`w-full border rounded-2xl overflow-hidden ${isDark ? "bg-[#18191d] border-gray-800" : "bg-white border-gray-200"}`}>
      {/* header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <div className={`font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
          Table
        </div>

        {!isViewOnly && (
          <div className="flex gap-2">
            <button
              onClick={() => addColumn(databaseId)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              + Column
            </button>

            <button
              onClick={() => addRow(databaseId)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              + Row
            </button>
          </div>
        )}
      </div>

      {/* grid */}
      <div className="overflow-auto">
        <div className="w-full">
          {/* columns */}
          <div className={`flex border-b ${isDark ? "bg-[#1e1f23] border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <div className={`w-[60px] shrink-0 px-3 py-2 text-xs border-r ${isDark ? "text-gray-500 border-gray-800" : "text-gray-500 border-gray-200"}`}>
              #
            </div>

            {columns.map((col) => (
              <TableColumnHeader
                key={col._id}
                col={col}
                databaseId={databaseId}
                refreshColumns={() => fetchColumns(databaseId)}
                isViewOnly={isViewOnly}
              />
            ))}
          </div>

          {/* rows */}
          {rows.map((row, index) => (
            <div key={row._id} className={`flex border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
              <div className={`w-[60px] shrink-0 px-3 py-2 text-xs border-r ${isDark ? "text-gray-500 border-gray-800" : "text-gray-500 border-gray-200"}`}>
                {index + 1}
              </div>

              {columns.map((col) => (
                <div key={col._id} className={`flex-1 min-w-[220px] border-r ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                  <TableCell row={row} col={col} isViewOnly={isViewOnly} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* footer add row */}
      {!isViewOnly && (
        <button
          onClick={() => addRow(databaseId)}
          className={`w-full text-left px-4 py-3 text-sm ${isDark ? "text-gray-500 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-50"}`}
        >
          + New
        </button>
      )}

      {/* Formula Modal */}
      <FormulaModal columns={columns} />
    </div>
  );
}