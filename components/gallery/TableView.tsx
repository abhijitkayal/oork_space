"use client";

import { useEffect, useRef, useState } from "react";
import type { DbView } from "@/components/DatabaseViewtabs";

import AddPropertyModal from "./AddPropertyModal";
import TableHeaderCell from "./TableHeadercell";
import TableCell from "./TableCell";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { Plus, Trash2 } from "lucide-react";

type Property = {
  _id: string;
  name: string;
  type: string;
  options?: string[];
};

type Item = {
  _id: string;
  title?: string;
  values?: Record<string, unknown>;
};

export default function TableView({
  databaseId,
  activeView,
}: {
  databaseId: string;
  activeView?: DbView;
}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rows, setRows] = useState<Item[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const prevPropertyCount = useRef(0);

  const fetchProperties = async () => {
    const res = await fetch(`/api/properties?databaseId=${databaseId}`);
    const data = await res.json();
    setProperties(Array.isArray(data) ? data : []);
  };

  const fetchRows = async () => {
    const mode = activeView?.type === "my-tasks" ? "&mode=assigned" : "";
    const res = await fetch(`/api/items?databaseId=${databaseId}${mode}`);
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      const mode = activeView?.type === "my-tasks" ? "&mode=assigned" : "";
      const [propRes, rowRes] = await Promise.all([
        fetch(`/api/properties?databaseId=${databaseId}`),
        fetch(`/api/items?databaseId=${databaseId}${mode}`),
      ]);

      const [propData, rowData] = await Promise.all([propRes.json(), rowRes.json()]);

      if (!active) return;

      setProperties(Array.isArray(propData) ? propData : []);
      setRows(Array.isArray(rowData) ? rowData : []);
    };

    void load();

    return () => {
      active = false;
    };
  }, [databaseId, activeView?.type]);

  const addRow = async () => {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        databaseId,
        values: {
          title: "Untitled",
        },
      }),
    });

    const created = await res.json();
    setRows((prev) => [...prev, created]);
  };

  const deleteRow = async (rowId: string) => {
    await fetch(`/api/items/${rowId}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r._id !== rowId));
  };

  const viewLabel = activeView?.type === "my-tasks" ? "My Tasks" : "All Items";
  useEffect(() => {
    const prev = prevPropertyCount.current;
    if (prev > 0 && properties.length > prev && scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
    prevPropertyCount.current = properties.length;
  }, [properties.length]);

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Table</CardTitle>
          <Badge variant="outline" className="text-xs">{viewLabel}</Badge>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpenModal(true)}
          >
            + Property
          </Button>

          <Button size="sm" variant="outline" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Row
          </Button>
        </div>
      </CardHeader>

      <Separator />



    
  
      
      {/* <div className="min-w-[1200px]"></div> */}
      {/* Table Grid */}
      <CardContent className="p-0 overflow-x-auto">
        <div ref={scrollRef} className="w-full overflow-x-auto overflow-y-auto  [scrollbar-gutter:stable_both-edges]">
          <div className="min-w-full w-max">
            {/* Columns */}
            <div className="sticky top-0 z-10 flex border-b bg-muted/60 backdrop-blur">
              <div className="w-[60px] shrink-0 px-3 py-2 text-xs text-muted-foreground border-r">
                #
              </div>

              {properties.map((p) => (
                <TableHeaderCell
                  key={p._id}
                  property={p}
                  refresh={fetchProperties}
                />
              ))}

              <div className="w-14 shrink-0 border-r px-3 py-2 text-xs text-muted-foreground text-center">
                Del
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, index) => (
              <div key={row._id} className="group flex border-b hover:bg-muted/30">
                <div className="w-[60px] shrink-0 px-3 py-2 text-xs text-muted-foreground border-r">
                  {index + 1}
                </div>

                {properties.map((p) => (
                  <TableCell
                    key={p._id}
                    row={row}
                    property={p}
                    properties={properties}
                    refreshRows={fetchRows}
                  />
                ))}

                <div className="w-14 shrink-0 border-r px-2 py-2 flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 opacity-60 group-hover:opacity-100"
                    onClick={() => deleteRow(row._id)}
                    title="Delete row"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            {rows.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No rows yet. Click Row to create your first item.
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Footer Add Row */}
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none px-4 py-6 text-muted-foreground"
          onClick={addRow}
        >
          + New
        </Button>
      </CardContent>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        databaseId={databaseId}
        onSaved={fetchProperties}
      />
    </Card>
  );
}
