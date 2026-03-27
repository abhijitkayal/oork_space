"use client";

import { useEffect, useState } from "react";
import ColumnTypePicker from "@/components/ColumnTypepicker";
import { Column, ColumnType, useTableStore } from "@/app/store/TableStore";

export default function TableColumnHeader({
	col,
	databaseId,
	refreshColumns,
	isViewOnly = false,
}: {
	col: Column;
	databaseId: string;
	refreshColumns: () => void;
	isViewOnly?: boolean;
}) {
	const { updateColumn } = useTableStore();
	const [name, setName] = useState(col.name);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setName(col.name);
	}, [col.name]);

	const saveName = async () => {
		if (isViewOnly) return;

		const trimmed = name.trim();
		const nextName = trimmed || "Column";

		if (nextName === col.name) return;

		setIsSaving(true);
		try {
			await updateColumn(col._id, { name: nextName });
			refreshColumns();
			setName(nextName);
		} finally {
			setIsSaving(false);
		}
	};

	const changeType = async (t: ColumnType) => {
		if (isViewOnly) return;
		await updateColumn(col._id, { type: t });
		refreshColumns();
	};

	return (
		<div className="flex-1 min-w-[220px] border-r px-3 py-2">
			<div className="flex items-center justify-between gap-2">
				<input
					value={name}
					onChange={(e) => !isViewOnly && setName(e.target.value)}
					onBlur={saveName}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							(e.target as HTMLInputElement).blur();
						}
					}}
					disabled={isViewOnly}
					aria-label="Column name"
					title="Column name"
					className={`font-semibold text-sm w-full bg-transparent outline-none ${isViewOnly ? "cursor-default" : ""} ${isSaving ? "opacity-70" : ""}`}
				/>

				{!isViewOnly && <ColumnTypePicker value={col.type} onChange={changeType} />}
			</div>
		</div>
	);
}
