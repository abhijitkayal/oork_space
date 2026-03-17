"use client";

import { useState } from "react";
import { useWorkspaceStore, ViewType } from "@/app/store/WorkspaceStore";
import { X } from "lucide-react";

const OPTIONS: {
  type: ViewType;
  title: string;
  desc: string;
  icon: string;
}[] = [
  { type: "timeline",    title: "Timeline",       desc: "Plan by dates",           icon: "🗓" },
  { type: "table",       title: "Table",          desc: "Rows & properties",       icon: "📊" },
  { type: "board",       title: "Board",          desc: "Kanban workflow",         icon: "🧩" },
  { type: "gallery",     title: "Gallery",        desc: "Cards layout",            icon: "🖼" },
  { type: "todo",        title: "ToDo",           desc: "Task list",               icon: "✅" },
  { type: "text",        title: "Text",           desc: "Text content",            icon: "📝" },
  { type: "heading",     title: "Heading",        desc: "Heading content",         icon: "📌" },
  { type: "bullatedlist",title: "Bulleted List",  desc: "Bulleted list content",   icon: "•" },
  { type: "numberlist",  title: "Numbered List",  desc: "Numbered list content",   icon: "1." },
  { type: "pagelink",    title: "Page Link",      desc: "Link to another page",    icon: "🔗" },
  { type: "presentation",title: "Presentation",   desc: "Slides and decks",        icon: "🎯" },
  { type: "video",       title: "Video Editing",  desc: "Edit and trim videos",    icon: "🎥" },
  { type: "whiteboard",  title: "Whiteboard",     desc: "Sketch and collaborate",  icon: "✏️" },
  { type: "socialmedia", title: "Social Media",   desc: "Create social posts",     icon: "📱" }, // ✅ new
];

const TEMPLATES: Record<string, { id: number; name: string; desc: string }[]> = {
  table: [
    { id: 1, name: "Blank Table",       desc: "Start from scratch" },
    { id: 2, name: "Project Tracker",   desc: "Track project status" },
    { id: 3, name: "Budget Tracking",   desc: "Monitor expenses" },
  ],
  board: [
    { id: 1, name: "Blank Board",       desc: "Start from scratch" },
    { id: 2, name: "Sprint Planning",   desc: "Organize sprint tasks" },
    { id: 3, name: "Content Calendar",  desc: "Plan content strategy" },
  ],
  timeline: [
    { id: 1, name: "Blank Timeline",    desc: "Start from scratch" },
    { id: 2, name: "Project Timeline",  desc: "Gantt chart planning" },
    { id: 3, name: "Product Roadmap",   desc: "Product development" },
  ],
  gallery: [
    { id: 1, name: "Blank Gallery",     desc: "Start from scratch" },
    { id: 2, name: "Design Portfolio",  desc: "Showcase designs" },
    { id: 3, name: "Product Catalog",   desc: "Display products" },
  ],
  todo: [
    { id: 1, name: "Blank Todo",        desc: "Start from scratch" },
    { id: 2, name: "Daily Tasks",       desc: "Organize daily work" },
    { id: 3, name: "Checklist",         desc: "Simple checklist" },
  ],
  text: [
    { id: 1, name: "Blank Text",        desc: "Start from scratch" },
    { id: 2, name: "Documentation",     desc: "Create documentation" },
    { id: 3, name: "Meeting Notes",     desc: "Notes during meetings" },
  ],
  heading: [
    { id: 1, name: "Blank Heading",     desc: "Start from scratch" },
    { id: 2, name: "Section Header",    desc: "Organize sections" },
  ],
  bullatedlist: [
    { id: 1, name: "Blank List",        desc: "Start from scratch" },
    { id: 2, name: "Feature List",      desc: "List product features" },
  ],
  numberlist: [
    { id: 1, name: "Blank List",        desc: "Start from scratch" },
    { id: 2, name: "Step by Step",      desc: "Ordered instructions" },
  ],
  pagelink: [
    { id: 1, name: "Blank Link",        desc: "Start from scratch" },
  ],
  presentation: [
    { id: 1, name: "Blank Presentation",desc: "Start from scratch" },
    { id: 2, name: "Business Pitch",    desc: "Professional pitch deck" },
    { id: 3, name: "Product Demo",      desc: "Product showcase slides" },
  ],
  video: [
    { id: 1, name: "Blank Video",       desc: "Start from scratch" },
    { id: 2, name: "Tutorial",          desc: "Step-by-step tutorial" },
    { id: 3, name: "Promotional",       desc: "Marketing video" },
  ],
  whiteboard: [
    { id: 1, name: "Blank Canvas",      desc: "Start from scratch" },
    { id: 2, name: "Brainstorm",        desc: "Collaborative brainstorm" },
    { id: 3, name: "Wireframe",         desc: "Design wireframes" },
  ],
  // ✅ 10 social media templates
  socialmedia: [
    { id: 1,  name: "Instagram Post",    desc: "Square 1080x1080 feed post" },
    { id: 2,  name: "Instagram Story",   desc: "Vertical 1080x1920 story" },
    { id: 3,  name: "Facebook Post",     desc: "Landscape 1200x630 post" },
    { id: 4,  name: "Twitter/X Post",    desc: "Wide 1600x900 tweet card" },
    { id: 5,  name: "LinkedIn Post",     desc: "Professional 1200x627 post" },
    { id: 6,  name: "YouTube Thumbnail", desc: "Video thumbnail 1280x720" },
    { id: 7,  name: "Pinterest Pin",     desc: "Tall vertical 1000x1500 pin" },
    { id: 8,  name: "TikTok Cover",      desc: "Vertical 1080x1920 cover" },
    { id: 9,  name: "WhatsApp Status",   desc: "Status card 1080x1920" },
    { id: 10, name: "Snapchat Story",    desc: "Vertical snap 1080x1920" },
  ],
};

export default function ViewPickerCard({
  projectId,
  insertAfterDatabaseId,
  onDone,
  isDark,
}: {
  projectId: string;
  insertAfterDatabaseId?: string | null;
  onDone: () => void;
  isDark?: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState<ViewType>("table");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const { fetchDatabases, setActiveDatabase } = useWorkspaceStore();

  const createDbFromTemplate = async (templateId: number) => {
    if (creating) return;
    setCreating(true);

    const template = (TEMPLATES[selectedCategory] || []).find((t) => t.id === templateId);
    if (!template) { setCreating(false); return; }

    let templateName = "blank";
    if (selectedCategory === "presentation") {
      templateName = templateId === 1 ? "blank" : templateId === 2 ? "business" : "product";
    } else if (selectedCategory === "video") {
      templateName = templateId === 1 ? "blank" : templateId === 2 ? "tutorial" : "promotional";
    } else if (selectedCategory === "whiteboard") {
      templateName = templateId === 1 ? "blank" : templateId === 2 ? "brainstorm" : "wireframe";
    } else if (selectedCategory === "socialmedia") {
      const smNames = ["instagram-post","instagram-story","facebook-post","twitter-post","linkedin-post","youtube-thumbnail","pinterest-pin","tiktok-cover","whatsapp-status","snapchat-story"];
      templateName = smNames[templateId - 1] || "blank";
    }

    const payload = {
      projectId,
      name: template.name,
      icon: OPTIONS.find((o) => o.type === selectedCategory)?.icon || "📄",
      viewType: selectedCategory,
      templateName,
      insertAfterDatabaseId: insertAfterDatabaseId ?? null,
    };

    try {
      const res = await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || `Status ${res.status}`);

      await fetchDatabases(projectId);

      if (data?._id && setActiveDatabase) {
        setActiveDatabase(data);
      }

      onDone();
    } catch (err) {
      console.error("Failed to create database:", err);
    } finally {
      setCreating(false);
    }
  };

  const templates = TEMPLATES[selectedCategory] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 md:p-6">
      <div className={`w-full max-w-7xl h-full sm:h-[90vh] overflow-hidden sm:rounded-2xl border shadow-2xl flex flex-col ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}>

        {/* Header */}
        <div className={`border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}>
          <h1 className={`text-lg sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Create a design
          </h1>
          <button onClick={onDone}
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className={`hidden md:block w-48 lg:w-64 border-r overflow-y-auto ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="p-3 lg:p-4 space-y-4 lg:space-y-6">

              {/* DATASET */}
              <SidebarSection title="Dataset (suggested)" isDark={isDark}>
                {OPTIONS.filter((o) => ["table","board","timeline","gallery"].includes(o.type)).map((option) => (
                  <SidebarButton key={option.type} option={option} isActive={selectedCategory === option.type} isDark={isDark} onClick={() => setSelectedCategory(option.type)} />
                ))}
              </SidebarSection>

              {/* MEDIA & COLLABORATION */}
              <SidebarSection title="Media & Collaboration" isDark={isDark}>
                {OPTIONS.filter((o) => ["presentation","video","whiteboard","socialmedia"].includes(o.type)).map((option) => (
                  <SidebarButton key={option.type} option={option} isActive={selectedCategory === option.type} isDark={isDark} onClick={() => setSelectedCategory(option.type)} />
                ))}
              </SidebarSection>

              {/* BASIC NOTES */}
              <SidebarSection title="Basic Notes" isDark={isDark}>
                {OPTIONS.filter((o) => ["todo","text","heading","bullatedlist","numberlist","pagelink"].includes(o.type)).map((option) => (
                  <SidebarButton key={option.type} option={option} isActive={selectedCategory === option.type} isDark={isDark} onClick={() => setSelectedCategory(option.type)} />
                ))}
              </SidebarSection>

            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isDark ? "bg-gray-900" : "bg-white"}`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="mb-4 sm:mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {OPTIONS.find((o) => o.type === selectedCategory)?.title} templates
                </h2>
                <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {OPTIONS.find((o) => o.type === selectedCategory)?.desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => createDbFromTemplate(template.id)}
                    onMouseEnter={() => setSelectedTemplate(template.id)}
                    onMouseLeave={() => setSelectedTemplate(null)}
                    disabled={creating}
                    className={`group relative rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark ? "border-gray-700 hover:border-teal-500" : "border-gray-200 hover:border-blue-500"
                    }`}
                    style={{ aspectRatio: "4/3" }}
                  >
                    {/* Preview */}
                    <div className={`absolute inset-0 p-3 sm:p-4 ${isDark ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"}`}>
                      <div className="h-full flex items-center justify-center">
                        {selectedCategory === "table" && <TableTemplatePreview templateId={template.id} />}
                        {selectedCategory === "board" && <BoardTemplatePreview templateId={template.id} />}
                        {selectedCategory === "timeline" && <TimelineTemplatePreview templateId={template.id} />}
                        {selectedCategory === "gallery" && <GalleryTemplatePreview templateId={template.id} />}
                        {selectedCategory === "todo" && <TodoTemplatePreview templateId={template.id} />}
                        {["text","heading","bullatedlist","numberlist","pagelink"].includes(selectedCategory) && <GenericTemplatePreview type={selectedCategory} />}
                        {selectedCategory === "presentation" && <PresentationTemplatePreview templateId={template.id} />}
                        {selectedCategory === "video" && <VideoTemplatePreview templateId={template.id} />}
                        {selectedCategory === "whiteboard" && <WhiteboardTemplatePreview templateId={template.id} />}
                        {selectedCategory === "socialmedia" && <SocialMediaTemplatePreview templateId={template.id} />}
                      </div>
                    </div>

                    {/* Info */}
                    <div className={`absolute bottom-0 left-0 right-0 backdrop-blur-sm p-3 sm:p-4 border-t ${
                      isDark ? "bg-gray-800/95 border-gray-700" : "bg-white/95 border-gray-200"
                    }`}>
                      <h3 className={`font-semibold text-xs sm:text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{template.name}</h3>
                      <p className={`text-[10px] sm:text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{template.desc}</p>
                    </div>

                    {/* Hover */}
                    {selectedTemplate === template.id && !creating && (
                      <div className={`absolute inset-0 flex items-center justify-center ${isDark ? "bg-teal-500/10" : "bg-blue-500/10"}`}>
                        <div className={`px-4 py-2 rounded-lg font-medium text-white text-sm ${isDark ? "bg-teal-500" : "bg-blue-500"}`}>Create</div>
                      </div>
                    )}

                    {/* Spinner */}
                    {creating && selectedTemplate === template.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar helpers ── */
function SidebarSection({ title, isDark, children }: { title: string; isDark?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className={`text-xs font-semibold uppercase mb-2 px-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarButton({ option, isActive, isDark, onClick }: { option: any; isActive: boolean; isDark?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg text-left transition ${
        isActive
          ? isDark ? "bg-gray-700 shadow-sm font-medium" : "bg-white shadow-sm font-medium"
          : isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
      }`}>
      <span className="text-lg lg:text-xl">{option.icon}</span>
      <div className="flex-1 min-w-0">
        <div className={`text-xs lg:text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{option.title}</div>
        <div className={`text-[10px] lg:text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{option.desc}</div>
      </div>
    </button>
  );
}

/* ── Template Previews ── */
function TableTemplatePreview({ templateId }: { templateId: number }) {
  return (
    <div className="w-full bg-white rounded-lg p-3 text-[10px]">
      <div className="grid grid-cols-3 gap-2 font-semibold text-gray-700"><div>Name</div><div>Status</div><div>Date</div></div>
      <div className="mt-2 space-y-1">
        {templateId === 1
          ? <><div className="h-5 bg-gray-100 rounded" /><div className="h-5 bg-gray-100 rounded" /></>
          : [1,2,3].map((i) => <div key={i} className="grid grid-cols-3 gap-2"><div>Task {i}</div><div className="text-green-600">●</div><div>Feb {10+i}</div></div>)
        }
      </div>
    </div>
  );
}

function BoardTemplatePreview({ templateId }: { templateId: number }) {
  return (
    <div className="w-full grid grid-cols-3 gap-2 text-[9px]">
      {["Todo","Doing","Done"].map((col) => (
        <div key={col} className="rounded-md bg-white p-2">
          <div className="font-semibold text-gray-700">{col}</div>
          <div className="mt-2 space-y-1">
            {templateId === 1
              ? <div className="h-6 bg-gray-100 rounded" />
              : <><div className="h-6 bg-blue-100 rounded" /><div className="h-6 bg-purple-100 rounded" /></>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineTemplatePreview({ templateId }: { templateId: number }) {
  return (
    <div className="w-full bg-white rounded-lg p-3">
      <div className="text-[9px] text-gray-500 mb-2">{templateId === 1 ? "Empty timeline" : "Feb 2026"}</div>
      <div className="relative h-16">
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-300" />
        {templateId > 1 && <>
          <div className="absolute top-1 left-2 right-1/2 h-5 bg-blue-200 rounded-sm text-[8px] flex items-center px-1">Task 1</div>
          <div className="absolute top-7 left-8 right-1/3 h-5 bg-green-200 rounded-sm text-[8px] flex items-center px-1">Task 2</div>
        </>}
      </div>
    </div>
  );
}

function GalleryTemplatePreview({ templateId }: { templateId: number }) {
  return (
    <div className="w-full grid grid-cols-3 gap-2">
      {[1,2,3].map((i) => (
        <div key={i} className="rounded-md bg-white overflow-hidden">
          <div className={`h-12 ${templateId === 1 ? "bg-gray-100" : "bg-gradient-to-br from-blue-100 to-purple-100"}`} />
          <div className="p-1 text-[8px] font-semibold">{templateId === 1 ? "" : `Item ${i}`}</div>
        </div>
      ))}
    </div>
  );
}

function TodoTemplatePreview({ templateId }: { templateId: number }) {
  return (
    <div className="w-full bg-white rounded-lg p-3">
      <div className="space-y-2">
        {[1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <div className="w-3 h-3 rounded border-2 border-gray-300" />
            <div className="text-gray-700">{templateId === 1 ? `Task ${i}` : `Daily task ${i}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericTemplatePreview({ type }: { type: string }) {
  const icons: Record<string, string> = { text:"📝", heading:"📌", bullatedlist:"•", numberlist:"1.", pagelink:"🔗" };
  return <div className="w-full bg-white rounded-lg p-4 flex items-center justify-center text-4xl">{icons[type] ?? "📄"}</div>;
}

function PresentationTemplatePreview({ templateId }: { templateId: number }) {
  const labels = ["Blank Slides","Business Pitch","Product Demo"];
  return (
    <div className="w-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-4 flex flex-col items-center justify-center text-white">
      <div className="text-3xl mb-2">🎯</div>
      <div className="text-[10px] font-semibold text-center">{labels[templateId-1]}</div>
      <div className="mt-2 flex gap-1">
        <div className="w-8 h-6 bg-white/30 rounded-sm" />
        <div className="w-8 h-6 bg-white/20 rounded-sm" />
        <div className="w-8 h-6 bg-white/10 rounded-sm" />
      </div>
    </div>
  );
}

function VideoTemplatePreview({ templateId }: { templateId: number }) {
  const labels = ["Blank Video","Tutorial","Promotional"];
  return (
    <div className="w-full bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center text-white">
      <div className="text-3xl mb-2">🎥</div>
      <div className="w-12 h-8 bg-gray-700 rounded-md flex items-center justify-center mb-2"><span className="text-lg">▶</span></div>
      <div className="text-[10px] font-semibold text-center">{labels[templateId-1]}</div>
      <div className="mt-2 w-full bg-gray-700 h-1 rounded-full">
        <div className="bg-red-500 h-1 rounded-full" style={{ width: `${templateId * 30}%` }} />
      </div>
    </div>
  );
}

function WhiteboardTemplatePreview({ templateId }: { templateId: number }) {
  const labels = ["Blank Canvas","Brainstorm","Wireframe"];
  return (
    <div className="w-full bg-white rounded-lg p-4 flex flex-col items-center justify-center border-2 border-gray-200">
      <div className="text-3xl mb-2">✏️</div>
      <div className="w-full h-10 bg-gray-50 rounded-md mb-2 flex items-center justify-center">
        {templateId === 1 && <div className="text-[10px] text-gray-400">Blank canvas</div>}
        {templateId === 2 && <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /><div className="w-2 h-2 rounded-full bg-green-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /></div>}
        {templateId === 3 && <div className="flex gap-2"><div className="w-3 h-4 border-2 border-gray-400 rounded" /><div className="w-3 h-4 border-2 border-gray-400 rounded" /></div>}
      </div>
      <div className="text-[10px] font-semibold">{labels[templateId-1]}</div>
    </div>
  );
}

// ✅ NEW — Social Media previews
function SocialMediaTemplatePreview({ templateId }: { templateId: number }) {
  const configs = [
    { label: "Instagram Post",    bg: "from-purple-500 to-pink-500",   icon: "📸", ratio: "1:1"  },
    { label: "Instagram Story",   bg: "from-pink-500 to-orange-400",   icon: "📱", ratio: "9:16" },
    { label: "Facebook Post",     bg: "from-blue-600 to-blue-400",     icon: "👍", ratio: "1.91:1" },
    { label: "Twitter/X",         bg: "from-sky-500 to-cyan-400",      icon: "🐦", ratio: "16:9" },
    { label: "LinkedIn",          bg: "from-blue-700 to-blue-500",     icon: "💼", ratio: "1.91:1" },
    { label: "YouTube",           bg: "from-red-600 to-red-400",       icon: "▶️", ratio: "16:9" },
    { label: "Pinterest",         bg: "from-red-500 to-rose-400",      icon: "📌", ratio: "2:3"  },
    { label: "TikTok",            bg: "from-gray-900 to-gray-700",     icon: "🎵", ratio: "9:16" },
    { label: "WhatsApp Status",   bg: "from-green-500 to-emerald-400", icon: "💬", ratio: "9:16" },
    { label: "Snapchat",          bg: "from-yellow-400 to-yellow-300", icon: "👻", ratio: "9:16" },
  ];
  const c = configs[templateId - 1] || configs[0];
  return (
    <div className={`w-full bg-gradient-to-br ${c.bg} rounded-lg p-4 flex flex-col items-center justify-center text-white`}>
      <div className="text-3xl mb-2">{c.icon}</div>
      <div className="text-[10px] font-bold text-center">{c.label}</div>
      <div className="mt-1 text-[9px] text-white/70">{c.ratio}</div>
      <div className="mt-2 flex gap-1 items-end">
        <div className="w-6 h-6 bg-white/30 rounded" />
        <div className="w-6 h-8 bg-white/20 rounded" />
        <div className="w-6 h-5 bg-white/10 rounded" />
      </div>
    </div>
  );
}