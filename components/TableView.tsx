"use client";

import DbTableView from "@/components/view/TableView";

type TableViewProps = {
  databaseId?: string;
  isViewOnly?: boolean;
};

export default function TableView({ databaseId, isViewOnly = false }: TableViewProps) {
  if (!databaseId) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
        Select a database table to view records.
      </div>
    );
  }

  return <DbTableView databaseId={databaseId} isViewOnly={isViewOnly} />;
}