// "use client";

// import { useWorkspaceStore } from "@/app/store/WorkspaceStore";
// import DatabaseViewRenderer from "./DatabaseViewrenderer";
// import { useTheme } from "next-themes";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { useState } from "react";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
//   DragStartEvent,
//   DragOverlay,
//   defaultDropAnimationSideEffects,
//   DropAnimation,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
// import { GripVertical } from "lucide-react";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface Database {
//   _id: string;
//   name: string;
//   icon: string;
//   [key: string]: unknown;
// }

// interface SortableDatabaseCardProps {
//   db: Database;
//   isDark: boolean;
//   isViewOnly: boolean;
//   isLast: boolean;
//   isDragging: boolean;
// }

// // ─── Drop animation config ─────────────────────────────────────────────────

// const dropAnimation: DropAnimation = {
//   sideEffects: defaultDropAnimationSideEffects({
//     styles: {
//       active: { opacity: "0.4" },
//     },
//   }),
// };

// // ─── Sortable card ─────────────────────────────────────────────────────────

// function SortableDatabaseCard({
//   db,
//   isDark,
//   isViewOnly,
//   isLast,
//   isDragging,
// }: SortableDatabaseCardProps) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging: isSelfDragging,
//   } = useSortable({ id: db._id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isSelfDragging ? 0.35 : 1,
//     zIndex: isSelfDragging ? 10 : undefined,
//   };

//   return (
//     <div ref={setNodeRef} style={style}>
//       <Card
//         className={`
//           shadow-md transition-all duration-200
//           ${isDragging ? "" : "hover:shadow-lg"}
//           ${isSelfDragging ? "ring-2 ring-blue-400/50 shadow-xl" : ""}
//           ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}
//         `}
//       >
//         <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
//           <div className="flex items-center gap-2 sm:gap-3">
//             {/* Drag handle */}
//             {!isViewOnly && (
//               <button
//                 {...attributes}
//                 {...listeners}
//                 className={`
//                   shrink-0 p-1 rounded cursor-grab active:cursor-grabbing
//                   transition-colors duration-150 touch-none select-none
//                   ${
//                     isDark
//                       ? "text-gray-600 hover:text-gray-400 hover:bg-gray-800"
//                       : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
//                   }
//                 `}
//                 aria-label="Drag to reorder"
//                 title="Drag to reorder"
//               >
//                 <GripVertical size={16} />
//               </button>
//             )}

//             <span className="text-xl sm:text-2xl shrink-0">{db.icon}</span>
//             <h3
//               className={`text-base sm:text-lg md:text-xl font-semibold truncate ${
//                 isDark ? "text-white" : "text-gray-900"
//               }`}
//             >
//               {db.name}
//             </h3>
//           </div>
//         </CardHeader>

//         <CardContent className="pt-2 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
//           <DatabaseViewRenderer db={db} isViewOnly={isViewOnly} />
//         </CardContent>
//       </Card>

//       {!isLast && (
//         <Separator
//           className={`my-4 sm:my-6 md:my-8 ${
//             isDark ? "bg-gray-700" : "bg-gray-200"
//           }`}
//         />
//       )}
//     </div>
//   );
// }

// // ─── Drag overlay card (ghost while dragging) ──────────────────────────────

// function DragOverlayCard({
//   db,
//   isDark,
// }: {
//   db: Database;
//   isDark: boolean;
// }) {
//   return (
//     <Card
//       className={`
//         shadow-2xl ring-2 ring-blue-400/60 rotate-1 scale-[1.02]
//         transition-transform duration-100
//         ${isDark ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"}
//       `}
//     >
//       <CardHeader className="pb-3 px-4 md:px-6 pt-4 md:pt-6">
//         <div className="flex items-center gap-3">
//           <div
//             className={`shrink-0 p-1 rounded ${
//               isDark ? "text-gray-400" : "text-gray-500"
//             }`}
//           >
//             <GripVertical size={16} />
//           </div>
//           <span className="text-2xl shrink-0">{db.icon}</span>
//           <h3
//             className={`text-lg font-semibold truncate ${
//               isDark ? "text-white" : "text-gray-900"
//             }`}
//           >
//             {db.name}
//           </h3>
//         </div>
//       </CardHeader>
//       <CardContent className="pt-2 px-4 md:px-6 pb-4 md:pb-6">
//         <div
//           className={`h-16 rounded-lg ${
//             isDark ? "bg-gray-700/50" : "bg-gray-100"
//           } animate-pulse`}
//         />
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Main component ────────────────────────────────────────────────────────

// export default function DatabaseTabs({
//   projectId,
//   isViewOnly = false,
// }: {
//   projectId: string;
//   isViewOnly?: boolean;
// }) {
//   const { resolvedTheme } = useTheme();
//   const isDark = resolvedTheme === "dark";

//   const { databasesByProject } = useWorkspaceStore();
//   const dbs: Database[] = databasesByProject[projectId] || [];

//   // Local order state — initialises from store; persists for the session.
//   // Wire `onReorder` up to your store/API to make it durable.
//   const [orderedIds, setOrderedIds] = useState<string[]>(() =>
//     dbs.map((d) => d._id)
//   );
//   const [activeId, setActiveId] = useState<string | null>(null);

//   // Keep orderedIds in sync when the store adds/removes databases
//   const mergedIds = [
//     ...orderedIds.filter((id) => dbs.some((d) => d._id === id)),
//     ...dbs.filter((d) => !orderedIds.includes(d._id)).map((d) => d._id),
//   ];

//   const orderedDbs = mergedIds
//     .map((id) => dbs.find((d) => d._id === id))
//     .filter(Boolean) as Database[];

//   const activeDb = activeId ? dbs.find((d) => d._id === activeId) : null;

//   // DnD sensors — pointer with small activation distance to avoid misclicks
//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: { distance: 6 },
//     })
//   );

//   const handleDragStart = (event: DragStartEvent) => {
//     setActiveId(event.active.id as string);
//   };

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     setActiveId(null);
//     if (!over || active.id === over.id) return;

//     setOrderedIds((prev) => {
//       const oldIndex = prev.indexOf(active.id as string);
//       const newIndex = prev.indexOf(over.id as string);
//       const next = arrayMove(prev, oldIndex, newIndex);

//       // 🔌 Optional: persist reorder to your store/API here
//       // e.g. reorderDatabases(projectId, next);

//       return next;
//     });
//   };

//   const handleDragCancel = () => setActiveId(null);

//   // ── Empty state ────────────────────────────────────────────────────────

//   if (dbs.length === 0) {
//     return (
//       <Card
//         className={`shadow-sm ${
//           isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
//         }`}
//       >
//         <CardContent className="p-6 sm:p-8 md:p-10 text-center">
//           <div className="text-4xl sm:text-5xl mb-3 opacity-40">📊</div>
//           <p
//             className={`text-xs sm:text-sm ${
//               isDark ? "text-gray-400" : "text-gray-500"
//             }`}
//           >
//             {isViewOnly
//               ? "This project has no databases yet."
//               : "No databases yet. Click New Database to get started."}
//           </p>
//         </CardContent>
//       </Card>
//     );
//   }

//   // ── Render ─────────────────────────────────────────────────────────────

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCenter}
//       modifiers={[restrictToVerticalAxis]}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//       onDragCancel={handleDragCancel}
//     >
//       <SortableContext
//         items={mergedIds}
//         strategy={verticalListSortingStrategy}
//       >
//         <div className="space-y-4 sm:space-y-6 md:space-y-8">
//           {orderedDbs.map((db, index) => (
//             <SortableDatabaseCard
//               key={db._id}
//               db={db}
//               isDark={isDark}
//               isViewOnly={isViewOnly}
//               isLast={index === orderedDbs.length - 1}
//               isDragging={!!activeId}
//             />
//           ))}
//         </div>
//       </SortableContext>

//       {/* Floating ghost card while dragging */}
//       <DragOverlay dropAnimation={dropAnimation}>
//         {activeDb ? (
//           <DragOverlayCard db={activeDb} isDark={isDark} />
//         ) : null}
//       </DragOverlay>
//     </DndContext>
//   );
// }
// "use client";

// import * as Tabs from "@radix-ui/react-tabs";
// import { useWorkspaceStore } from "@/app/store/WorkspaceStore";
// import DatabaseViewRenderer from "./DatabaseViewrenderer";

// export default function DatabaseTabs({ projectId }: { projectId: string }) {
//   const { databasesByProject } = useWorkspaceStore();
//   const dbs = databasesByProject[projectId] || [];

//   if (dbs.length === 0) {
//     return (
//       <div className="p-10 border rounded-2xl text-gray-500">
//         No databases yet. Click “New Database”.
//       </div>
//     );
//   }

//   return (
//     <Tabs.Root defaultValue={dbs[0]._id}>
//       <Tabs.List className="flex gap-2 border-b pb-2">
//         {dbs.map((db) => (
//           <Tabs.Trigger
//             key={db._id}
//             value={db._id}
//             className="px-3 py-2 text-sm rounded-xl data-[state=active]:bg-gray-100"
//           >
//             <span className="mr-2">{db.icon}</span>
//             {db.name}
//           </Tabs.Trigger>
//         ))}
//       </Tabs.List>

//       {dbs.map((db) => (
//         <Tabs.Content key={db._id} value={db._id} className="pt-6 w-full">
//           <DatabaseViewRenderer db={db} />
//         </Tabs.Content>
//       ))}
//     </Tabs.Root>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, GripVertical } from "lucide-react";
import { useWorkspaceStore } from "@/app/store/WorkspaceStore";
import DatabaseViewRenderer from "./DatabaseViewrenderer";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import ViewPickerCard from "./ViewpickerCard";
import type { Database } from "@/app/store/WorkspaceStore";

type DraggableDatabaseSectionProps = {
  db: Database;
  isDark: boolean;
  isViewOnly: boolean;
  isActive: boolean;
  onAddBelow: (dbId: string) => void;
  onDragStart: (dbId: string) => void;
  onDropOn: (targetDbId: string) => void;
  isDragging: boolean;
};

function DraggableDatabaseSection({
  db,
  isDark,
  isViewOnly,
  isActive,
  onAddBelow,
  onDragStart,
  onDropOn,
  isDragging,
}: DraggableDatabaseSectionProps) {

  return (
    <section
      draggable
      onDragStart={() => onDragStart(db._id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDropOn(db._id)}
      id={`db-section-${db._id}`}
      className={`space-y-2 rounded-xl transition-all ${
        isDragging
          ? "opacity-60 ring-2 ring-teal-500/60"
          : isActive
            ? isDark
              ? "opacity-100 ring-2 ring-blue-500/60"
              : "opacity-100 ring-2 ring-blue-500/50"
            : "opacity-100"
      }`}
    >
      <div className={`group flex items-center justify-between text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className={`cursor-grab p-1 rounded ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
            aria-label="Drag component"
            title="Drag component"
          >
            <GripVertical size={14} />
          </button>
          <span>{db.icon}</span>
          <span className="font-medium truncate">{db.name}</span>
          {!isViewOnly && (
          <button
            type="button"
            onClick={() => onAddBelow(db._id)}
            className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Add dataset"
            title="Add dataset"
          >
            <Plus size={14} className=""/>
          </button>
        )}
        </div>
       
      </div>

      <Card className={`border-none shadow-none ${isDark ? "bg-transparent" : "bg-white"}`}>
        <CardContent className="p-0">
          <DatabaseViewRenderer db={db} isViewOnly={isViewOnly} />
        </CardContent>
      </Card>
    </section>
  );
}

export default function DatabaseTabs({ projectId, isViewOnly = false }: { projectId: string; isViewOnly?: boolean }) {
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [showCreateDbModal, setShowCreateDbModal] = useState(false);
  const [insertAfterDatabaseId, setInsertAfterDatabaseId] = useState<string | null>(null);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { databasesByProject, activeDatabaseId, setActiveDatabase } = useWorkspaceStore();
  const dbs = useMemo(() => databasesByProject[projectId] || [], [databasesByProject, projectId]);
  const selectedDbId = searchParams.get("db");

  useEffect(() => {
    if (dbs.length === 0) return;
    const activeExists = dbs.some((db) => db._id === activeDatabaseId);
    if (!activeDatabaseId || !activeExists) {
      setActiveDatabase(dbs[0]._id);
    }
  }, [dbs, activeDatabaseId, setActiveDatabase]);

  useEffect(() => {
    if (!selectedDbId) return;
    const exists = dbs.some((db) => db._id === selectedDbId);
    if (!exists) return;

    setActiveDatabase(selectedDbId);

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(`db-section-${selectedDbId}`);
      target?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedDbId, dbs, setActiveDatabase]);

  const orderedDbs = useMemo(() => {
    if (orderedIds.length === 0) return dbs;
    const map = new Map(dbs.map((db) => [db._id, db] as const));
    const sorted = orderedIds.map((id) => map.get(id)).filter(Boolean) as Database[];
    const missing = dbs.filter((db) => !orderedIds.includes(db._id));
    return [...sorted, ...missing];
  }, [dbs, orderedIds]);

  if (dbs.length === 0) {
    return (
      <Card className={`shadow-sm ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}>
        <CardContent className="p-6 sm:p-8 md:p-10 text-center">
          <div className="text-4xl sm:text-5xl mb-3 opacity-40">📊</div>
          <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {isViewOnly 
              ? "This project has no databases yet."
              : "No databases yet. Click New Database to get started."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const openCreateAfter = (dbId: string) => {
    setInsertAfterDatabaseId(dbId);
    setShowCreateDbModal(true);
  };

  const handleDropOn = (targetDbId: string) => {
    if (!draggingId || draggingId === targetDbId) {
      setDraggingId(null);
      return;
    }

    const currentIds = orderedDbs.map((db) => db._id);
    const sourceIndex = currentIds.indexOf(draggingId);
    const targetIndex = currentIds.indexOf(targetDbId);

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggingId(null);
      return;
    }

    const next = [...currentIds];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    setOrderedIds(next);
    setDraggingId(null);
  };

  return (
    <div className="space-y-4">
      <div
        className={`sticky top-0 z-10 flex w-full gap-1 overflow-x-auto border-b pb-0 backdrop-blur ${
          isDark ? "border-gray-700 bg-neutral-900/85" : "border-gray-200 bg-white/85"
        }`}
      >
        <div className={`px-2 py-2 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Drag components to place them anywhere in this page.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 items-start">
        {orderedDbs.map((db) => (
          <DraggableDatabaseSection
            key={db._id}
            db={db}
            isDark={isDark}
            isViewOnly={isViewOnly}
            isActive={activeDatabaseId === db._id}
            onAddBelow={openCreateAfter}
            onDragStart={setDraggingId}
            onDropOn={handleDropOn}
            isDragging={draggingId === db._id}
          />
        ))}
      </div>

      {showCreateDbModal && !isViewOnly && (
        <ViewPickerCard
          projectId={projectId}
          insertAfterDatabaseId={insertAfterDatabaseId}
          isDark={isDark}
          onDone={() => {
            setShowCreateDbModal(false);
            setInsertAfterDatabaseId(null);
          }}
        />
      )}
    </div>
  );
}