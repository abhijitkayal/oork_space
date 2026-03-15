import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "./Modal";
import { FiChevronsRight } from "react-icons/fi";
import {
  LayoutGrid, Search, Calendar, Activity, Inbox,
  Plus, Moon, Sun, Folder, FileText, Layout, Store, Menu, X,
} from "lucide-react";
import ProjectRow from "./ProjectsRow";
import { useWorkspaceStore } from "@/app/store/WorkspaceStore";

export const EMOJI_LIST = [
  "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
  "😉","😍","🥰","😘","😋","😎","🤓","🥳","😭","😡",
  "📁","📂","🗂️","📋","📌","📍","🗃️","🗄️","💼","🏢",
  "🔧","⚙️","🛠️","🔩","💡","🔑","🗝️","🔒","🔓","🎯",
  "🌱","🌿","🍀","🌲","🌳","🌴","🌵","🌸","🌺","🌻",
  "⭐","🌟","✨","💫","🔥","❄️","🌈","☀️","🌙","⚡",
  "🎨","🎭","📷","🎥","🎬","📺","🎙️","📢","📣","🎵",
  "🐶","🐱","🦊","🐻","🐼","🦁","🐯","🦋","🐝","🦅",
  "🍕","🍔","🌮","🍜","🍣","🎂","☕","🍎","🍇","🥑",
  "🏆","🥇","🎖️","🏅","🎗️","🎀","🎉","🎊","🎆","🎇",
  "🚀","✈️","🚂","🚢","🏠","🏗️","🌍","🗺️","🧭","🔭",
  "📚","📖","✏️","🖊️","📝","📓","📔","📒","📃","📜",
  "✅","☑️","❌","⚠️","🔗","📎","🧑‍💻","👤","👥","💬",
  "📅","🗓️","⏰","⌛","⏳","📊","📈","📉","💰","💳",
];

type MenuKey =
  | "dashboard" | "project-board" | "task-board"
  | "schedule" | "activities" | "inbox"
  | "template" | "market-places";

type SidebarPage = {
  _id: string;
  pageName: string;
  menuKey: MenuKey;
  emoji: string;
  createdAt: string;
  updatedAt: string;
};

type Project = {
  _id: string;
  name: string;
  emoji: string;
  createdAt?: string;
  updatedAt?: string;
};

interface SidebarProps {
  view: string;
  setView: (view: string) => void;
}

export default function Sidebar({ view, setView }: SidebarProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pages, setPages] = useState<SidebarPage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pageForm, setPageForm] = useState<{ pageName: string; menuKey: MenuKey | ""; emoji: string }>({
    pageName: "", menuKey: "", emoji: "📄",
  });
  const [lastSavedName, setLastSavedName] = useState("");
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", emoji: "📁" });
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // ✅ WorkspaceStore — used to sync active database across app
  const { setActiveDatabase, setActiveProject } = useWorkspaceStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMounted(true); }, []);

  const fetchProjects = async () => {
    try { setProjects(await (await fetch("/api/projects")).json()); }
    catch (err) { console.log(err); }
  };

  const fetchPages = async () => {
    try { setPages(await (await fetch("/api/sidebar")).json()); }
    catch (err) { console.log(err); }
  };

  useEffect(() => { fetchProjects(); fetchPages(); }, []);

  const isDark = resolvedTheme === "dark";
  const setGlobalTheme = (dark: boolean) => setTheme(dark ? "dark" : "light");

  const navigateTo = (path: string) => {
    if (pathname !== path) router.push(path);
    setMobileOpen(false);
  };

  const openCreateModal = (menuKey: MenuKey) => {
    setPageForm({ pageName: "", menuKey, emoji: "📄" });
    setLastSavedName("");
    setCurrentPageId(null);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setPageForm({ pageName: "", menuKey: "", emoji: "📄" });
    setLastSavedName("");
    setCurrentPageId(null);
  };

  const handleCreateOrUpdatePage = async () => {
    if (!pageForm.pageName.trim() || pageForm.pageName === lastSavedName) return;
    try {
      if (currentPageId) {
        await fetch(`/api/sidebar?id=${currentPageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageName: pageForm.pageName, emoji: pageForm.emoji }),
        });
      } else {
        const data = await (await fetch("/api/sidebar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageForm),
        })).json();
        setCurrentPageId(data._id);
      }
      await fetchPages();
      setLastSavedName(pageForm.pageName);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (pageForm.pageName.trim() && createModalOpen && pageForm.pageName !== lastSavedName) {
      const t = setTimeout(handleCreateOrUpdatePage, 800);
      return () => clearTimeout(t);
    }
  }, [pageForm.pageName, pageForm.emoji, createModalOpen]);

  const handleDeletePage = async (pageId: string) => {
    try {
      await fetch(`/api/sidebar?id=${pageId}`, { method: "DELETE" });
      await fetchPages();
    } catch (err: any) { alert(err.message); }
  };

  const handleCreateProject = async () => {
    if (!projectForm.name.trim()) return;
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectForm.name, emoji: projectForm.emoji }),
      });
      await fetchProjects();
      setProjectForm({ name: "", emoji: "📁" });
      setEmojiPickerOpen(false);
      setCreateProjectModalOpen(false);
    } catch (err) { console.error(err); }
  };

  if (!mounted) return null;

  const hoverClass = isDark ? "hover:bg-white/5" : "hover:bg-rose-200/50";

  const menuItems: { key: MenuKey; label: string; path: string; icon: React.ReactNode }[] = [
    { key: "dashboard",     label: "Dashboard",     path: "/",              icon: <LayoutGrid size={open ? 20 : 22} /> },
    { key: "project-board", label: "Project Board", path: "/project-board", icon: <Folder     size={open ? 20 : 22} /> },
    { key: "task-board",    label: "Task Board",    path: "/task-board",    icon: <FileText   size={open ? 20 : 22} /> },
    { key: "schedule",      label: "Schedule",      path: "/schedule",      icon: <Calendar   size={open ? 20 : 22} /> },
    { key: "activities",    label: "Activities",    path: "/activities",    icon: <Activity   size={open ? 20 : 22} /> },
    { key: "inbox",         label: "Inbox",         path: "/inbox",         icon: <Inbox      size={open ? 20 : 22} /> },
    { key: "template",      label: "Template",      path: "/template",      icon: <Layout     size={open ? 20 : 22} /> },
    { key: "market-places", label: "Market Places", path: "/market-places", icon: <Store      size={open ? 20 : 22} /> },
  ];

  const SidebarContent = () => (
    <>
      <div className={`flex-1 overflow-y-auto pb-16 ${isDark ? "bg-gray-900" : "bg-rose-50"}`}>

        {/* SEARCH */}
        <div className={`${open ? "p-6 pb-2" : "p-4 pb-2"}`}>
          {open && (
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-600"}`} />
              <input type="text" placeholder="Search..."
                className={`w-full text-sm pl-10 pr-4 py-3 rounded-2xl border focus:outline-none ${
                  isDark
                    ? "bg-[#18191d] text-gray-200 border-transparent focus:border-white/10 placeholder:text-gray-600"
                    : "bg-white text-gray-900 border-rose-100 focus:border-rose-300 placeholder:text-gray-500 shadow-sm"
                }`}
              />
            </div>
          )}
        </div>

        {/* NAV */}
        <div className={`${open ? "px-6 py-2" : "px-2 py-2"}`}>
          <div className="space-y-2 relative">
            {open && (
              <div className={`absolute left-[8px] top-0 bottom-0 w-[2px] ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
            )}

            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const itemPages = pages.filter((p) => p.menuKey === item.key);

              return (
                <div key={item.key} className="rounded-xl overflow-visible relative">
                  {open && (
                    <div className={`absolute left-[10px] top-0 w-[28px] h-[25px] border-l-2 border-b-2 rounded-bl-lg ${isDark ? "border-gray-700" : "border-gray-300"}`} />
                  )}

                  {/* Menu row */}
                  <div className="relative cursor-pointer group" onClick={() => navigateTo(item.path)}>
                    <div className={`absolute inset-0 w-60 ml-3 bg-gradient-to-r from-teal-600 to-rose-600 rounded-xl ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
                    <div className={`relative flex items-center ${open ? "gap-3 px-4" : "justify-center px-2"} py-2 ${isActive ? "text-white" : isDark ? "text-gray-400" : "text-gray-700"}`}>
                      {itemPages.length > 0 ? (
                        <span className="text-xl flex-shrink-0 ml-3">{itemPages[0].emoji || "📄"}</span>
                      ) : (
                        <motion.div layout className={`grid h-full ${open ? "w-10" : "w-full"} place-content-center text-lg ml-3`}>
                          {item.icon}
                        </motion.div>
                      )}
                      {open && (
                        <div className="flex items-center justify-between w-full">
                          <motion.span layout className="font-medium">{item.label}</motion.span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                item.key === "project-board"
                                  ? setCreateProjectModalOpen(true)
                                  : openCreateModal(item.key);
                              }}
                              className={`p-1 rounded-md ${hoverClass}`}
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); alert("Options coming soon..."); }}
                              className={`p-1 rounded-md ${hoverClass}`}
                            >
                              <span className="text-lg leading-none">⋯</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sub items */}
                  {open && (
                    item.key === "project-board" ? (
                      <div className="pl-6 pb-2 space-y-2 relative">
                        {projects.length > 0 && (
                          <div className={`absolute left-[30px] top-2 bottom-0 w-[2px] ${isDark ? "bg-gray-600" : "bg-gray-400"}`} />
                        )}
                        {projects.length === 0 ? (
                          <p className={`text-xs px-3 py-2 rounded-xl ml-[32px] ${isDark ? "text-gray-500 bg-white/5" : "text-gray-600 bg-white"}`}>
                            No projects yet. Create one.
                          </p>
                        ) : (
                          projects.map((project) => (
                            <div key={project._id} className="relative">
                              <div className={`absolute left-[8px] top-2 w-[28px] h-[14px] border-l-2 border-b-2 rounded-bl-lg ${isDark ? "border-gray-600" : "border-gray-400"}`} />
                              <div className="ml-[32px]">
                                {/* ✅ Pass setActiveDatabase and setActiveProject to ProjectRow */}
                                <ProjectRow
                                  project={project}
                                  isDark={isDark}
                                  pathname={pathname}
                                  onSelectDatabase={(db: any) => {
                                    setActiveProject(project._id);
                                    setActiveDatabase(db);
                                  }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="pl-6 pb-2 space-y-1 relative">
                        {itemPages.length > 0 && (
                          <div className={`absolute left-[8px] top-2 bottom-0 w-[2px] ${isDark ? "bg-gray-600" : "bg-gray-400"}`} />
                        )}
                        {itemPages.slice(0, 5).map((p, i) => {
                          const bgColors = [
                            isDark ? "bg-purple-500/10" : "bg-purple-100",
                            isDark ? "bg-blue-500/10"   : "bg-blue-100",
                            isDark ? "bg-green-500/10"  : "bg-green-100",
                            isDark ? "bg-orange-500/10" : "bg-orange-100",
                            isDark ? "bg-pink-500/10"   : "bg-pink-100",
                          ];
                          return (
                            <div key={p._id} className="relative">
                              <div className={`absolute left-[8px] top-0 w-[28px] h-[14px] border-l-2 border-b-2 rounded-bl-lg ${isDark ? "border-gray-600" : "border-gray-400"}`} />
                              <div
                                className={`group text-xs px-3 py-2 rounded-lg cursor-pointer transition-all ml-[32px] ${bgColors[i % 5]} ${isDark ? "text-gray-300 hover:brightness-125" : "text-gray-800 hover:brightness-95"}`}
                                onClick={(e) => { e.stopPropagation(); alert(`Open page: ${p.pageName}`); }}
                              >
                                <div className="flex items-center gap-2 justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-lg flex-shrink-0">{p.emoji || "📄"}</span>
                                    <span className="truncate font-medium">{p.pageName}</span>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${p.pageName}"?`)) handleDeletePage(p._id); }}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${isDark ? "hover:bg-white/10" : "hover:bg-white/50"}`}
                                  >
                                    <span className="text-xs">✕</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* THEME TOGGLE */}
        <div className={`mt-auto ${open ? "p-6 pb-4" : "p-4 pb-2"}`}>
          <div className={`flex items-center justify-center rounded-full p-1 border ${isDark ? "bg-black/40 border-gray-800" : "bg-gray-100 border-rose-200"}`}>
            <button onClick={() => setGlobalTheme(false)} className={`p-1.5 rounded-full transition-all ${!isDark ? "bg-white text-amber-500 shadow-sm" : "text-gray-600 hover:text-gray-400"}`}>
              <Sun size={16} />
            </button>
            <button onClick={() => setGlobalTheme(true)} className={`p-1.5 rounded-full transition-all ${isDark ? "bg-[#2c2d31] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              <Moon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* COLLAPSE BUTTON */}
      <motion.button layout onClick={() => setOpen((v) => !v)}
        className={`hidden lg:flex fixed bottom-0 left-0 border-t z-50 ${isDark ? "border-gray-800 bg-[#0F1014] hover:bg-[#1a1b1e]" : "border-rose-200 bg-rose-50 hover:bg-rose-100"}`}
        style={{ width: open ? "300px" : "80px" }}>
        <div className={`flex items-center ${open ? "justify-start px-4" : "justify-center"} p-2`}>
          <motion.div layout className={`grid ${open ? "size-10" : "size-8"} place-content-center`}>
            <FiChevronsRight className={`${!open && "rotate-180"} ${isDark ? "text-gray-400" : "text-gray-600"}`} size={open ? 20 : 18} />
          </motion.div>
          {open && <motion.span layout className="text-xs font-medium">Hide</motion.span>}
        </div>
      </motion.button>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-lg ${isDark ? "bg-[#0F1014] text-gray-300 border border-gray-800" : "bg-white text-gray-900 border border-rose-200"}`}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-40" />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`lg:hidden fixed top-0 left-0 h-screen w-[300px] z-40 flex flex-col font-sans border-r ${isDark ? "bg-[#0F1014] text-gray-300 border-gray-800" : "bg-rose-50 text-gray-900 border-rose-200"}`}>
            <SidebarContent />
          </motion.nav>
        )}
      </AnimatePresence>

      <motion.nav layout
        className={`hidden lg:flex h-screen flex-col font-sans shrink-0 relative border-t ${isDark ? "bg-[#0F1014] text-gray-300 border-gray-800" : "bg-rose-50 text-gray-900 border-rose-200"}`}
        style={{ width: open ? "300px" : "80px", minWidth: open ? "300px" : "80px" }}>
        <SidebarContent />
      </motion.nav>

      {/* CREATE PAGE MODAL */}
      {createModalOpen && (
        <Modal isOpen={createModalOpen} onClose={closeCreateModal} title="New Page" isDark={isDark}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl border-2 border-dashed flex-shrink-0"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#fecdd3" }}>
                {pageForm.emoji}
              </div>
              <input value={pageForm.pageName}
                onChange={(e) => setPageForm((pv) => ({ ...pv, pageName: e.target.value }))}
                placeholder="Page name..." autoFocus
                className={`w-full p-4 rounded-2xl border outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-rose-100 text-gray-900"}`}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE PROJECT MODAL */}
      {createProjectModalOpen && (
        <Modal isOpen={createProjectModalOpen}
          onClose={() => { setCreateProjectModalOpen(false); setProjectForm({ name: "", emoji: "📁" }); setEmojiPickerOpen(false); }}
          title="New Project" isDark={isDark}>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div ref={emojiPickerRef} className="relative flex-shrink-0">
                <button type="button" onClick={() => setEmojiPickerOpen((v) => !v)}
                  className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center border-2 transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                    emojiPickerOpen
                      ? isDark ? "border-teal-500 bg-teal-500/10" : "border-teal-400 bg-teal-50"
                      : isDark ? "border-white/10 bg-white/5 hover:border-white/25" : "border-rose-200 bg-white hover:border-rose-400 shadow-sm"
                  }`}>
                  {projectForm.emoji}
                </button>
                <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  tap to change
                </span>

                <AnimatePresence>
                  {emojiPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ type: "spring", damping: 20, stiffness: 320 }}
                      className={`absolute top-16 left-0 z-[999] w-64 rounded-2xl border shadow-2xl overflow-hidden ${isDark ? "bg-[#1c1d21] border-white/10" : "bg-white border-rose-100"}`}>
                      <div className="p-2 grid grid-cols-8 gap-0.5 max-h-56 overflow-y-auto">
                        {EMOJI_LIST.map((emoji) => (
                          <button key={emoji} type="button"
                            onClick={() => { setProjectForm((pv) => ({ ...pv, emoji })); setEmojiPickerOpen(false); }}
                            className={`text-xl w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-125 ${
                              projectForm.emoji === emoji
                                ? isDark ? "bg-teal-500/20 ring-1 ring-teal-500/60" : "bg-teal-100 ring-1 ring-teal-400"
                                : isDark ? "hover:bg-white/10" : "hover:bg-rose-50"
                            }`}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className={`px-3 py-2 border-t flex items-center gap-2 ${isDark ? "border-white/10" : "border-rose-100"}`}>
                        <span className="text-lg">{projectForm.emoji}</span>
                        <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Selected</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input value={projectForm.name}
                onChange={(e) => setProjectForm((pv) => ({ ...pv, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                placeholder="Project name..." autoFocus
                className={`w-full mt-1 p-4 rounded-2xl border outline-none transition-colors ${isDark ? "bg-white/5 border-white/10 text-white focus:border-teal-500/40" : "bg-white border-rose-100 text-gray-900 focus:border-teal-300 shadow-sm"}`}
              />
            </div>

            <button onClick={handleCreateProject} disabled={!projectForm.name.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-rose-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity mt-6">
              Create Project
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}