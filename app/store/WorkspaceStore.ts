// import { create } from "zustand";

// export type ViewType = "timeline" | "table" | "board" | "gallery";

// export type Project = {
//   _id: string;
//   name: string;
//   emoji: string;
// };

// export type Database = {
//   _id: string;
//   projectId: string;
//   name: string;
//   icon: string;
//   viewType: ViewType;
// };

// type WorkspaceState = {
//   projects: Project[];
//   databasesByProject: Record<string, Database[]>;
//   activeProjectId: string | null;
//   activeDatabaseId: string | null;

//   fetchProjects: () => Promise<void>;
//   fetchDatabases: (projectId: string) => Promise<void>;

//   setActiveProject: (projectId: string) => void;
//   setActiveDatabase: (dbId: string) => void;
// };

// export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
//   projects: [],
//   databasesByProject: {},
//   activeProjectId: null,
//   activeDatabaseId: null,

//   fetchProjects: async () => {
//     const res = await fetch("/api/projects");
//     const data = await res.json();
//     set({ projects: data });
//   },

//   fetchDatabases: async (projectId) => {
//     const res = await fetch(`/api/databases?projectId=${projectId}`);
//     const data = await res.json();

//     set((state) => ({
//       databasesByProject: {
//         ...state.databasesByProject,
//         [projectId]: data,
//       },
//     }));
//   },

//   setActiveProject: (projectId) => {
//     set({ activeProjectId: projectId, activeDatabaseId: null });
//     get().fetchDatabases(projectId);
//   },

//   setActiveDatabase: (dbId) => set({ activeDatabaseId: dbId }),
// }));


import { create } from "zustand";

export type ViewType =
  | "timeline"
  | "table"
  | "board"
  | "gallery"
  | "todo"
  | "text"
  | "heading"
  | "bullatedlist"
  | "numberlist"
  | "pagelink"
  | "presentation"
  | "video"
  | "whiteboard"
  | "settings";

export type Project = {
  _id: string;
  name: string;
  emoji: string;
};

export type Database = {
  _id: string;
  projectId: string;
  name: string;
  icon: string;
  viewType: ViewType;
  templateName?: string;
};

type WorkspaceState = {
  projects: Project[];
  databasesByProject: Record<string, Database[]>;
  activeProjectId: string | null;
  activeDatabaseId: string | null;
  activeDatabaseObject: Database | null; // ✅ new — holds the full DB object

  fetchProjects: () => Promise<void>;
  fetchDatabases: (projectId: string) => Promise<void>;

  setActiveProject: (projectId: string) => void;
  setActiveDatabase: (dbIdOrObject: string | Database) => void; // ✅ accepts both
  clearActiveDatabase: () => void; // ✅ new — reset active DB
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  projects: [],
  databasesByProject: {},
  activeProjectId: null,
  activeDatabaseId: null,
  activeDatabaseObject: null,

  fetchProjects: async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      set({ projects: data });
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  },

  fetchDatabases: async (projectId) => {
    try {
      const res = await fetch(`/api/databases?projectId=${projectId}`);
      const data = await res.json();

      set((state) => ({
        databasesByProject: {
          ...state.databasesByProject,
          [projectId]: data,
        },
      }));
    } catch (err) {
      console.error("Failed to fetch databases:", err);
    }
  },

  setActiveProject: (projectId) => {
    set({
      activeProjectId: projectId,
      activeDatabaseId: null,
      activeDatabaseObject: null,
    });
    get().fetchDatabases(projectId);
  },

  // ✅ Accepts either a string ID or a full Database object
  setActiveDatabase: (dbIdOrObject) => {
    if (typeof dbIdOrObject === "string") {
      // Called with just an ID — find the object from the store if possible
      const state = get();
      const allDbs = Object.values(state.databasesByProject).flat();
      const found = allDbs.find((db) => db._id === dbIdOrObject) ?? null;

      set({
        activeDatabaseId: dbIdOrObject,
        activeDatabaseObject: found,
      });
    } else {
      // Called with full Database object (e.g. from ViewPickerCard after creation)
      set({
        activeDatabaseId: dbIdOrObject._id,
        activeDatabaseObject: dbIdOrObject,
      });
    }
  },

  clearActiveDatabase: () =>
    set({
      activeDatabaseId: null,
      activeDatabaseObject: null,
    }),
}));