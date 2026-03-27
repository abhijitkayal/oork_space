import { create } from "zustand";

export type ColumnType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "status"
  | "date"
  | "person"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "formula";

export type Column = {
  _id: string;
  databaseId: string;
  name: string;
  type: ColumnType;
  options: { label: string; color: string }[];
  order: number;
  formula?: string;
};

export type Row = {
  _id: string;
  databaseId: string;
  cells: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type CellValue = string | number | boolean | string[] | null;

type ApiError = {
  message?: string;
};

type Store = {
  columns: Column[];
  rows: Row[];
  formulaColumn: Column | null;
  isLoading: boolean;
  error: string | null;

  fetchColumns: (databaseId: string) => Promise<void>;
  fetchRows: (databaseId: string) => Promise<void>;

  addColumn: (databaseId: string) => Promise<void>;
  addRow: (databaseId: string) => Promise<void>;

  updateCell: (rowId: string, columnId: string, value: CellValue) => Promise<void>;
  setFormulaColumn: (column: Column | null) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => Promise<void>;
};

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function resolveErrorMessage(fallback: string, payload: ApiError | null): string {
  if (payload?.message && payload.message.trim()) {
    return payload.message;
  }
  return fallback;
}

export const useTableStore = create<Store>((set, get) => ({
  columns: [],
  rows: [],
  formulaColumn: null,
  isLoading: false,
  error: null,

  fetchColumns: async (databaseId) => {
    if (!databaseId) {
      set({ columns: [] });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`/api/columns?databaseId=${databaseId}`, {
        cache: "no-store",
      });
      const data = await parseJsonSafe<Column[] | ApiError>(res);

      if (!res.ok) {
        throw new Error(resolveErrorMessage("Failed to fetch columns", (data as ApiError) ?? null));
      }

      const list = Array.isArray(data) ? (data as Column[]) : [];
      const sorted = [...list].sort((a, b) => a.order - b.order);
      set({ columns: sorted, isLoading: false, error: null });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message, columns: [] });
    }
  },

  fetchRows: async (databaseId) => {
    if (!databaseId) {
      set({ rows: [] });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`/api/rows?databaseId=${databaseId}`, {
        cache: "no-store",
      });
      const data = await parseJsonSafe<Row[] | ApiError>(res);

      if (!res.ok) {
        throw new Error(resolveErrorMessage("Failed to fetch rows", (data as ApiError) ?? null));
      }

      set({ rows: Array.isArray(data) ? (data as Row[]) : [], isLoading: false, error: null });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message, rows: [] });
    }
  },

  addColumn: async (databaseId) => {
    const nextOrder = get().columns.length;
    const res = await fetch(`/api/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        databaseId,
        name: "Column",
        type: "text",
        order: nextOrder,
      }),
    });
    const payload = await parseJsonSafe<Column & ApiError>(res);

    if (!res.ok || !payload || !("_id" in payload)) {
      throw new Error(resolveErrorMessage("Failed to create column", payload));
    }

    set({
      columns: [...get().columns, payload].sort((a, b) => a.order - b.order),
      error: null,
    });
  },

  addRow: async (databaseId) => {
    const res = await fetch(`/api/rows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ databaseId }),
    });
    const payload = await parseJsonSafe<Row & ApiError>(res);

    if (!res.ok || !payload || !("_id" in payload)) {
      throw new Error(resolveErrorMessage("Failed to create row", payload));
    }

    set({ rows: [...get().rows, payload], error: null });
  },

  updateCell: async (rowId, columnId, value) => {
    const previousRows = get().rows;
    const targetRow = previousRows.find((r) => r._id === rowId);

    if (!targetRow) return;

    set({
      rows: previousRows.map((row) =>
        row._id === rowId
          ? { ...row, cells: { ...row.cells, [columnId]: value } }
          : row
      ),
      error: null,
    });

    try {
      const res = await fetch(`/api/cell`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowId,
          columnId,
          value,
          databaseId: targetRow.databaseId,
        }),
      });

      const payload = await parseJsonSafe<ApiError>(res);
      if (!res.ok) {
        throw new Error(resolveErrorMessage("Failed to save cell value", payload));
      }
    } catch (error) {
      set({ rows: previousRows, error: (error as Error).message });
      throw error;
    }
  },

  setFormulaColumn: (column) => {
    set({ formulaColumn: column });
  },

  updateColumn: async (columnId, updates) => {
    const previousColumns = get().columns;
    const nextColumns = previousColumns.map((col) =>
      col._id === columnId ? { ...col, ...updates } : col
    );

    set({ columns: nextColumns, error: null });

    try {
      const res = await fetch(`/api/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const payload = await parseJsonSafe<ApiError>(res);
      if (!res.ok) {
        throw new Error(resolveErrorMessage("Failed to update column", payload));
      }
    } catch (error) {
      set({ columns: previousColumns, error: (error as Error).message });
      throw error;
    }
  },
}));
