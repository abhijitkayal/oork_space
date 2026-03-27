"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Column, Row, useTableStore } from "@/app/store/TableStore";
import { evaluateFormula } from "@/lib/formula/EvaluteFormula";

type TableCellProps = {
  row: Row;
  col: Column;
  isViewOnly?: boolean;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default function TableCell({ row, col, isViewOnly = false }: TableCellProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const rawValue = row.cells?.[col._id];
  const { updateCell, columns, setFormulaColumn } = useTableStore();

  const [localValue, setLocalValue] = useState<string>(String(rawValue ?? ""));

  useEffect(() => {
    setLocalValue(String(rawValue ?? ""));
  }, [rawValue]);

  const inputClass = `w-full bg-transparent outline-none text-sm ${
    isDark ? "text-gray-200 placeholder-gray-600" : "text-gray-900 placeholder-gray-400"
  } ${isViewOnly ? "cursor-not-allowed opacity-80" : ""}`;

  const saveTextValue = async () => {
    if (isViewOnly) return;
    await updateCell(row._id, col._id, localValue);
  };

  const formulaValue = useMemo(() => {
    if (col.type !== "formula") return "";
    return col.formula ? evaluateFormula(col.formula, row, columns) : "";
  }, [col, row, columns]);

  if (col.type === "formula") {
    const isError = String(formulaValue).startsWith("Error");
    return (
      <button
        type="button"
        onClick={() => {
          if (!isViewOnly) setFormulaColumn(col);
        }}
        className={`w-full text-left px-3 py-2 text-sm ${
          isError
            ? "text-red-500"
            : isDark
              ? "text-gray-300 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-50"
        } ${isViewOnly ? "cursor-default" : "cursor-pointer"}`}
      >
        {formulaValue === "" ? "-" : String(formulaValue)}
      </button>
    );
  }

  if (col.type === "checkbox") {
    return (
      <div className="px-3 py-2">
        <input
          type="checkbox"
          checked={Boolean(rawValue)}
          onChange={(e) => {
            if (isViewOnly) return;
            void updateCell(row._id, col._id, e.target.checked);
          }}
          disabled={isViewOnly}
          className={isDark ? "accent-blue-500" : "accent-blue-600"}
          aria-label={col.name}
        />
      </div>
    );
  }

  if (col.type === "date") {
    return (
      <div className="px-3 py-2">
        <input
          type="date"
          value={localValue ? localValue.slice(0, 10) : ""}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => {
            void saveTextValue();
          }}
          disabled={isViewOnly}
          className={`${inputClass} ${isDark ? "color-scheme-dark" : ""}`}
          aria-label={col.name}
        />
      </div>
    );
  }

  if (col.type === "number") {
    return (
      <div className="px-3 py-2">
        <input
          type="number"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => {
            if (isViewOnly) return;
            const parsed = localValue === "" ? null : Number(localValue);
            void updateCell(row._id, col._id, Number.isNaN(parsed) ? null : parsed);
          }}
          disabled={isViewOnly}
          className={inputClass}
          aria-label={col.name}
        />
      </div>
    );
  }

  if (col.type === "select") {
    return (
      <div className="px-3 py-2">
        <select
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            if (isViewOnly) return;
            void updateCell(row._id, col._id, e.target.value);
          }}
          disabled={isViewOnly}
          className={`w-full outline-none text-sm border rounded px-2 py-1 ${
            isDark ? "text-gray-200 bg-[#18191d] border-gray-700" : "text-gray-900 bg-white border-gray-300"
          }`}
          aria-label={col.name}
        >
          <option value="">Select...</option>
          {col.options?.map((opt) => (
            <option key={`${col._id}-${opt.label}`} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (col.type === "multi_select") {
    const selected = asStringArray(rawValue);

    return (
      <div className="px-3 py-2 space-y-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((item) => (
            <span
              key={`${col._id}-${item}`}
              className={`px-2 py-0.5 text-xs rounded ${
                isDark ? "bg-blue-900 text-blue-100" : "bg-blue-100 text-blue-700"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        {!isViewOnly && (
          <select
            onChange={(e) => {
              const nextOption = e.target.value;
              if (!nextOption) return;

              const next = selected.includes(nextOption)
                ? selected.filter((item) => item !== nextOption)
                : [...selected, nextOption];

              void updateCell(row._id, col._id, next);
              e.target.value = "";
            }}
            className={`w-full outline-none text-sm border rounded px-2 py-1 ${
              isDark ? "text-gray-200 bg-[#18191d] border-gray-700" : "text-gray-900 bg-white border-gray-300"
            }`}
            aria-label={col.name}
          >
            <option value="">Toggle option...</option>
            {col.options?.map((opt) => (
              <option key={`${col._id}-ms-${opt.label}`} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  if (col.type === "url") {
    return (
      <div className="px-3 py-2 space-y-1">
        <input
          type="url"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => {
            void saveTextValue();
          }}
          disabled={isViewOnly}
          placeholder="https://"
          className={inputClass}
          aria-label={col.name}
        />
        {localValue && (
          <a
            href={localValue}
            target="_blank"
            rel="noreferrer"
            className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}
          >
            Open
          </a>
        )}
      </div>
    );
  }

  if (col.type === "email") {
    return (
      <div className="px-3 py-2">
        <input
          type="email"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => {
            void saveTextValue();
          }}
          placeholder="name@example.com"
          disabled={isViewOnly}
          className={inputClass}
          aria-label={col.name}
        />
      </div>
    );
  }

  if (col.type === "phone") {
    return (
      <div className="px-3 py-2">
        <input
          type="tel"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => {
            void saveTextValue();
          }}
          placeholder="+1 555 123 4567"
          disabled={isViewOnly}
          className={inputClass}
          aria-label={col.name}
        />
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => {
          void saveTextValue();
        }}
        disabled={isViewOnly}
        className={inputClass}
        placeholder={col.type === "person" ? "Person name" : "Enter value"}
        aria-label={col.name}
      />
    </div>
  );
}
