"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Copy, Download, Play, Settings, Users, ChevronLeft, ChevronRight } from "lucide-react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

interface Slide {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  layout: "title-content" | "title-only" | "content-only";
}

interface PresentationTemplate {
  name: string;
  slides: Slide[];
}

const TEMPLATES: Record<string, PresentationTemplate> = {
  blank: {
    name: "Blank Presentation",
    slides: [
      {
        id: "1",
        title: "Welcome to Presentation",
        content: "Click to edit this slide content",
        backgroundColor: "#1e1b4b",
        textColor: "#ffffff",
        layout: "title-content",
      },
    ],
  },
  business: {
    name: "Business Pitch",
    slides: [
      {
        id: "1",
        title: "Business Pitch",
        content: "Your Company Name",
        backgroundColor: "#1e1b4b",
        textColor: "#ffffff",
        layout: "title-content",
      },
      {
        id: "2",
        title: "Problem",
        content: "Describe the problem you're solving",
        backgroundColor: "#0f172a",
        textColor: "#ffffff",
        layout: "title-content",
      },
      {
        id: "3",
        title: "Solution",
        content: "How your product solves the problem",
        backgroundColor: "#1e293b",
        textColor: "#ffffff",
        layout: "title-content",
      },
      {
        id: "4",
        title: "Market Opportunity",
        content: "Size and growth potential",
        backgroundColor: "#14532d",
        textColor: "#ffffff",
        layout: "title-content",
      },
      {
        id: "5",
        title: "Thank You",
        content: "Questions?",
        backgroundColor: "#7f1d1d",
        textColor: "#ffffff",
        layout: "title-content",
      },
    ],
  },
  product: {
    name: "Product Demo",
    slides: [
      {
        id: "1",
        title: "Product Demo",
        content: "Introducing Our Latest Product",
        backgroundColor: "#1d4ed8",
        textColor: "#ffffff",
        layout: "title-content",
      },
      {
        id: "2",
        title: "Features",
        content: "Key features and benefits",
        backgroundColor: "#1e1b4b",
        textColor: "#ffffff",
        layout: "title-content",
      },
      {
        id: "3",
        title: "Live Demo",
        content: "See it in action",
        backgroundColor: "#0f172a",
        textColor: "#ffffff",
        layout: "title-content",
      },
      {
        id: "4",
        title: "Pricing",
        content: "Flexible pricing plans",
        backgroundColor: "#6d28d9",
        textColor: "#ffffff",
        layout: "title-content",
      },
    ],
  },
};

const BG_COLORS = [
  "#1e1b4b",
  "#0f172a",
  "#1e293b",
  "#14532d",
  "#7f1d1d",
  "#1d4ed8",
  "#6d28d9",
  "#831843",
];

export default function PresentationView({ 
  databaseId, 
  templateName = "blank" 
}: { 
  databaseId: string;
  templateName?: string;
}) {
  const template = TEMPLATES[templateName] || TEMPLATES.blank;
  const [slides, setSlides] = useState<Slide[]>(template.slides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingField, setEditingField] = useState<"title" | "content" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const yDocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const slidesArrayRef = useRef<Y.Array<Y.Map<string, any>> | null>(null);

  // Initialize Yjs for collaboration
  useEffect(() => {
    const ydoc = new Y.Doc();
    yDocRef.current = ydoc;

    const yarray = ydoc.getArray("slides");
    slidesArrayRef.current = yarray;

    if (yarray.length === 0) {
      slides.forEach((slide) => {
        yarray.push([new Y.Map(Object.entries(slide))]);
      });
    }

    yarray.observe(() => {
       const updatedSlides = yarray.toArray().map((item) => {
         const map = item as Y.Map<string, any>;
         return {
           id: map.get("id"),
           title: map.get("title"),
           content: map.get("content"),
           backgroundColor: map.get("backgroundColor"),
           textColor: map.get("textColor"),
           layout: map.get("layout"),
         };
       });
       setSlides(updatedSlides);
     });

    try {
      const provider = new WebsocketProvider(
        "ws://localhost:1234",
        `presentation-${databaseId}`,
        ydoc
      );
      providerRef.current = provider;

      provider.awareness.on("change", (changes: any) => {
        const states = Array.from(provider.awareness.getStates().values());
        const users = states
          .map((state: any) => state.user?.name)
          .filter(Boolean);
        setCollaborators(users);
      });

      provider.awareness.setLocalState({
        user: {
          name: `User-${Math.random().toString(36).substr(2, 9)}`,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        },
      });
    } catch (error) {
      console.log("WebSocket connection failed, running in offline mode");
    }

    return () => {
      if (providerRef.current) {
        providerRef.current.disconnect();
      }
      ydoc.destroy();
    };
  }, [databaseId]);

  const currentSlide = slides[currentIndex];

  const goNext = () => setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
  const goPrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      content: "New slide content",
      backgroundColor: "#1e293b",
      textColor: "#ffffff",
      layout: "title-content",
    };

    if (slidesArrayRef.current) {
      slidesArrayRef.current.push([new Y.Map(Object.entries(newSlide))]);
    } else {
      setSlides([...slides, newSlide]);
    }
    setCurrentIndex(slides.length);
  };

  const deleteSlide = (id: string) => {
    if (slides.length === 1) return;

    if (slidesArrayRef.current) {
      const index = slides.findIndex((s) => s.id === id);
      if (index !== -1) {
        slidesArrayRef.current.delete(index, 1);
      }
    } else {
      const updated = slides.filter((s) => s.id !== id);
      setSlides(updated);
      setCurrentIndex((prev) => Math.min(prev, updated.length - 1));
    }
  };

  const duplicateSlide = (id: string) => {
    const slideIndex = slides.findIndex((s) => s.id === id);
    if (slideIndex === -1) return;

    const slide = slides[slideIndex];
    const newSlide = { ...slide, id: Date.now().toString() };

    if (slidesArrayRef.current) {
      slidesArrayRef.current.insert(slideIndex + 1, [new Y.Map(Object.entries(newSlide))]);
    } else {
      setSlides([...slides.slice(0, slideIndex + 1), newSlide, ...slides.slice(slideIndex + 1)]);
    }
  };

  const startEdit = (field: "title" | "content") => {
    setEditingField(field);
    setEditValue(currentSlide[field]);
  };

  const saveEdit = () => {
    if (!editingField || !slidesArrayRef.current) return;

    const slideMap = slidesArrayRef.current.get(currentIndex) as Y.Map<any>;
    slideMap.set(editingField, editValue);
    setEditingField(null);
  };

  const updateBgColor = (color: string) => {
    if (!slidesArrayRef.current) return;
    const slideMap = slidesArrayRef.current.get(currentIndex) as Y.Map<any>;
    slideMap.set("backgroundColor", color);
  };

  const downloadPresentation = () => {
    const data = JSON.stringify(slides, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentation-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (editingField) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editingField, currentIndex, slides.length]);

  return (
    <div className={`flex flex-col h-full ${
      isFullscreen ? "fixed inset-0 z-50 bg-black" : "bg-gray-900 rounded-2xl"
    }`}>
      {/* Top Bar */}
      {!isFullscreen && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">🎯 Presentation</span>
            <span className="text-gray-400 text-xs px-2 py-1 bg-gray-700 rounded-full">
              {currentIndex + 1} / {slides.length}
            </span>
            {collaborators.length > 0 && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-700">
                <Users size={14} className="text-indigo-400" />
                <span className="text-xs text-gray-300">{collaborators.length}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 hover:bg-gray-700 rounded-lg transition text-gray-300"
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={addSlide}
              className="flex items-center gap-1 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition"
            >
              <Plus size={14} />
              Add
            </button>
            <button
              onClick={downloadPresentation}
              className="p-1.5 hover:bg-gray-700 rounded-lg transition text-gray-300"
              title="Download"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition"
            >
              <Play size={14} />
              Present
            </button>
          </div>
        </div>
      )}

      <div className={`flex ${isFullscreen ? "h-full" : "flex-1 overflow-hidden"}`}>
        {/* Slide Thumbnails */}
        {!isFullscreen && (
          <div className="w-32 bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col gap-1 p-2">
            {slides.map((slide, index) => (
              <div key={slide.id} className="relative group">
                <div
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-lg overflow-hidden cursor-pointer border-2 transition h-20 flex flex-col items-center justify-center text-center p-1 text-[10px] ${
                    index === currentIndex ? "border-indigo-500" : "border-gray-600 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: slide.backgroundColor }}
                >
                  <p className="text-[9px] font-bold truncate text-white max-w-full">
                    {slide.title || "Untitled"}
                  </p>
                  <span className="absolute top-0.5 right-0.5 text-[8px] font-semibold text-gray-300 bg-black/50 px-1 py-0.5 rounded">
                    {index + 1}
                  </span>
                </div>
                <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition flex gap-0.5">
                  <button
                    onClick={() => duplicateSlide(slide.id)}
                    className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={() => deleteSlide(slide.id)}
                      className="p-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Slide View */}
        <div
          className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: currentSlide?.backgroundColor }}
        >
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-lg text-xs transition z-10"
            >
              ✕ Exit
            </button>
          )}

          {/* Slide Content */}
          {currentSlide && (
            <div className="w-full max-w-3xl px-8 text-center">
              {/* Title */}
              {editingField === "title" ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="text-4xl font-bold w-full bg-transparent border-b-2 border-white outline-none text-center mb-6"
                  style={{ color: currentSlide.textColor }}
                />
              ) : (
                <h1
                  onClick={() => !isFullscreen && startEdit("title")}
                  className={`text-4xl font-bold mb-6 ${!isFullscreen ? "cursor-text hover:opacity-80" : ""}`}
                  style={{ color: currentSlide.textColor }}
                >
                  {currentSlide.title}
                </h1>
              )}

              {/* Content */}
              {editingField === "content" ? (
                <textarea
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  rows={4}
                  className="text-xl w-full bg-transparent border-b-2 border-white outline-none text-center resize-none"
                  style={{ color: currentSlide.textColor }}
                />
              ) : (
                <p
                  onClick={() => !isFullscreen && startEdit("content")}
                  className={`text-xl opacity-90 whitespace-pre-wrap ${
                    !isFullscreen ? "cursor-text hover:opacity-100" : ""
                  }`}
                  style={{ color: currentSlide.textColor }}
                >
                  {currentSlide.content}
                </p>
              )}
            </div>
          )}

          {/* Navigation Arrows */}
          <div className="absolute bottom-6 flex items-center gap-6">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-black/30 hover:bg-black/50 text-white rounded-full disabled:opacity-30 transition text-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-white text-sm opacity-70 min-w-12 text-center">
              {currentIndex + 1} / {slides.length}
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex === slides.length - 1}
              className="px-4 py-2 bg-black/30 hover:bg-black/50 text-white rounded-full disabled:opacity-30 transition text-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {!isFullscreen && showSettings && currentSlide && (
          <div className="w-48 bg-gray-800 border-l border-gray-700 p-3 overflow-y-auto">
            <h3 className="text-white font-semibold text-sm mb-3">Settings</h3>

            {/* Background Colors */}
            <div className="mb-4">
              <label className="text-gray-300 text-xs font-semibold block mb-2">
                Background
              </label>
              <div className="grid grid-cols-4 gap-1">
                {BG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateBgColor(color)}
                    className={`w-full h-8 rounded-lg border-2 transition ${
                      currentSlide.backgroundColor === color
                        ? "border-white"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
