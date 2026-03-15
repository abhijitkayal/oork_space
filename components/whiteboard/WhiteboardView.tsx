"use client";

import { useState, useEffect, useRef } from "react";

type TemplateName = "blank" | "flowchart" | "mindmap" | "retrospective" | "kanban" | "wireframe";

interface Template {
  name: TemplateName;
  label: string;
  icon: string;
  apply: (canvas: any, fabric: any, color: string) => void;
}

const TEMPLATES: Template[] = [
  {
    name: "blank",
    label: "Blank",
    icon: "⬜",
    apply: () => {},
  },
  {
    name: "flowchart",
    label: "Flowchart",
    icon: "🔷",
    apply: (canvas, fabric, color) => {
      const objects: any[] = [];

      // Start oval
      objects.push(new fabric.Ellipse({
        left: 320, top: 40, rx: 70, ry: 28,
        fill: "#1e3a5f", stroke: "#60a5fa", strokeWidth: 2, selectable: true,
      }));
      objects.push(new fabric.Text("Start", {
        left: 365, top: 56, fontSize: 14, fill: "#fff",
        fontFamily: "sans-serif", originX: "center",
      }));

      // Arrow down
      objects.push(new fabric.Line([390, 96, 390, 136], { stroke: "#60a5fa", strokeWidth: 2, selectable: false }));
      objects.push(new fabric.Triangle({ left: 383, top: 136, width: 14, height: 10, fill: "#60a5fa", angle: 180 }));

      // Process box 1
      objects.push(new fabric.Rect({
        left: 310, top: 146, width: 160, height: 50,
        fill: "#1e3a5f", stroke: "#60a5fa", strokeWidth: 2, rx: 4,
      }));
      objects.push(new fabric.Text("Process 1", {
        left: 390, top: 164, fontSize: 13, fill: "#fff",
        fontFamily: "sans-serif", originX: "center",
      }));

      // Arrow down
      objects.push(new fabric.Line([390, 196, 390, 236], { stroke: "#60a5fa", strokeWidth: 2, selectable: false }));
      objects.push(new fabric.Triangle({ left: 383, top: 236, width: 14, height: 10, fill: "#60a5fa", angle: 180 }));

      // Decision diamond
      const diamond = new fabric.Polygon([
        { x: 80, y: 0 }, { x: 160, y: 40 },
        { x: 80, y: 80 }, { x: 0, y: 40 },
      ], {
        left: 310, top: 246, fill: "#1e1b4b", stroke: "#a78bfa", strokeWidth: 2,
      });
      objects.push(diamond);
      objects.push(new fabric.Text("Decision?", {
        left: 390, top: 278, fontSize: 12, fill: "#fff",
        fontFamily: "sans-serif", originX: "center",
      }));

      // Yes arrow
      objects.push(new fabric.Line([390, 326, 390, 366], { stroke: "#4ade80", strokeWidth: 2 }));
      objects.push(new fabric.Text("Yes", { left: 396, top: 340, fontSize: 11, fill: "#4ade80", fontFamily: "sans-serif" }));
      objects.push(new fabric.Triangle({ left: 383, top: 366, width: 14, height: 10, fill: "#4ade80", angle: 180 }));

      // No arrow
      objects.push(new fabric.Line([470, 286, 560, 286], { stroke: "#f87171", strokeWidth: 2 }));
      objects.push(new fabric.Text("No", { left: 500, top: 270, fontSize: 11, fill: "#f87171", fontFamily: "sans-serif" }));

      // Process box 2
      objects.push(new fabric.Rect({
        left: 310, top: 376, width: 160, height: 50,
        fill: "#1e3a5f", stroke: "#60a5fa", strokeWidth: 2, rx: 4,
      }));
      objects.push(new fabric.Text("Process 2", {
        left: 390, top: 394, fontSize: 13, fill: "#fff",
        fontFamily: "sans-serif", originX: "center",
      }));

      // Arrow down
      objects.push(new fabric.Line([390, 426, 390, 466], { stroke: "#60a5fa", strokeWidth: 2 }));
      objects.push(new fabric.Triangle({ left: 383, top: 466, width: 14, height: 10, fill: "#60a5fa", angle: 180 }));

      // End oval
      objects.push(new fabric.Ellipse({
        left: 320, top: 476, rx: 70, ry: 28,
        fill: "#1e3a5f", stroke: "#f87171", strokeWidth: 2,
      }));
      objects.push(new fabric.Text("End", {
        left: 365, top: 492, fontSize: 14, fill: "#fff",
        fontFamily: "sans-serif", originX: "center",
      }));

      objects.forEach((o) => canvas.add(o));
      canvas.renderAll();
    },
  },
  {
    name: "mindmap",
    label: "Mind Map",
    icon: "🧠",
    apply: (canvas, fabric, color) => {
      const cx = 420, cy = 280;

      // Center node
      canvas.add(new fabric.Ellipse({
        left: cx - 80, top: cy - 30, rx: 80, ry: 30,
        fill: "#4f46e5", stroke: "#818cf8", strokeWidth: 2,
      }));
      canvas.add(new fabric.Text("Main Idea", {
        left: cx, top: cy - 8, fontSize: 15, fill: "#fff",
        fontFamily: "sans-serif", originX: "center", fontWeight: "bold",
      }));

      const branches = [
        { label: "Topic A", dx: -220, dy: -140, color: "#f87171" },
        { label: "Topic B", dx: 220, dy: -140, color: "#4ade80" },
        { label: "Topic C", dx: -220, dy: 140, color: "#fb923c" },
        { label: "Topic D", dx: 220, dy: 140, color: "#60a5fa" },
      ];

      branches.forEach(({ label, dx, dy, color: c }) => {
        const bx = cx + dx, by = cy + dy;
        canvas.add(new fabric.Line([cx, cy, bx, by], { stroke: c, strokeWidth: 2, selectable: false }));
        canvas.add(new fabric.Rect({
          left: bx - 60, top: by - 22, width: 120, height: 44,
          fill: "#1e1b4b", stroke: c, strokeWidth: 2, rx: 8,
        }));
        canvas.add(new fabric.Text(label, {
          left: bx, top: by - 8, fontSize: 13, fill: "#fff",
          fontFamily: "sans-serif", originX: "center",
        }));

        // Sub branches
        const subs = ["Sub 1", "Sub 2"];
        subs.forEach((sub, i) => {
          const sx = bx + (dx > 0 ? 160 : -160);
          const sy = by + (i === 0 ? -50 : 50);
          canvas.add(new fabric.Line([bx, by, sx, sy], { stroke: c, strokeWidth: 1.5, strokeDashArray: [4, 4], selectable: false }));
          canvas.add(new fabric.Rect({
            left: sx - 45, top: sy - 16, width: 90, height: 32,
            fill: "#0f0f1a", stroke: c, strokeWidth: 1.5, rx: 6, opacity: 0.9,
          }));
          canvas.add(new fabric.Text(sub, {
            left: sx, top: sy - 6, fontSize: 11, fill: "#cbd5e1",
            fontFamily: "sans-serif", originX: "center",
          }));
        });
      });

      canvas.renderAll();
    },
  },
  {
    name: "retrospective",
    label: "Retro",
    icon: "🔁",
    apply: (canvas, fabric, color) => {
      const cols = [
        { title: "✅ Went Well", x: 20, c: "#166534", b: "#4ade80" },
        { title: "⚠️ To Improve", x: 280, c: "#7c2d12", b: "#fb923c" },
        { title: "💡 Action Items", x: 540, c: "#1e3a5f", b: "#60a5fa" },
        { title: "😊 Shoutouts", x: 800, c: "#4a1d96", b: "#c084fc" },
      ];

      cols.forEach(({ title, x, c, b }) => {
        // Column bg
        canvas.add(new fabric.Rect({
          left: x, top: 20, width: 240, height: 500,
          fill: c, stroke: b, strokeWidth: 1.5, rx: 10, opacity: 0.4,
        }));
        // Header
        canvas.add(new fabric.Rect({
          left: x, top: 20, width: 240, height: 44,
          fill: c, stroke: b, strokeWidth: 1.5, rx: 10,
        }));
        canvas.add(new fabric.Text(title, {
          left: x + 120, top: 34, fontSize: 13, fill: "#fff",
          fontFamily: "sans-serif", originX: "center", fontWeight: "bold",
        }));

        // Sticky note placeholders
        [80, 160, 240, 320, 400].forEach((y) => {
          canvas.add(new fabric.Rect({
            left: x + 10, top: y + 30, width: 220, height: 60,
            fill: "#0f172a", stroke: b, strokeWidth: 1, rx: 6, opacity: 0.6,
          }));
          canvas.add(new fabric.Text("Click to add note...", {
            left: x + 120, top: y + 52, fontSize: 10, fill: "#64748b",
            fontFamily: "sans-serif", originX: "center",
          }));
        });
      });

      canvas.renderAll();
    },
  },
  {
    name: "kanban",
    label: "Kanban",
    icon: "📋",
    apply: (canvas, fabric, color) => {
      const cols = [
        { title: "📥 Backlog", x: 20, c: "#1e293b", b: "#475569", cards: ["Task 1", "Task 2", "Task 3"] },
        { title: "🔄 In Progress", x: 290, c: "#1e3a5f", b: "#60a5fa", cards: ["Task 4", "Task 5"] },
        { title: "👀 Review", x: 560, c: "#2d1b4b", b: "#a78bfa", cards: ["Task 6"] },
        { title: "✅ Done", x: 830, c: "#14532d", b: "#4ade80", cards: ["Task 7", "Task 8"] },
      ];

      cols.forEach(({ title, x, c, b, cards }) => {
        canvas.add(new fabric.Rect({
          left: x, top: 20, width: 250, height: 520,
          fill: c, stroke: b, strokeWidth: 1.5, rx: 10, opacity: 0.5,
        }));
        canvas.add(new fabric.Rect({
          left: x, top: 20, width: 250, height: 44,
          fill: c, stroke: b, strokeWidth: 1.5, rx: 10,
        }));
        canvas.add(new fabric.Text(title, {
          left: x + 125, top: 34, fontSize: 13, fill: "#fff",
          fontFamily: "sans-serif", originX: "center", fontWeight: "bold",
        }));

        cards.forEach((card, i) => {
          const cy = 80 + i * 90;
          canvas.add(new fabric.Rect({
            left: x + 10, top: cy, width: 230, height: 70,
            fill: "#0f172a", stroke: b, strokeWidth: 1.5, rx: 8,
          }));
          canvas.add(new fabric.Text(card, {
            left: x + 125, top: cy + 12, fontSize: 13, fill: "#fff",
            fontFamily: "sans-serif", originX: "center", fontWeight: "bold",
          }));
          canvas.add(new fabric.Text("Click to edit description...", {
            left: x + 125, top: cy + 34, fontSize: 10, fill: "#64748b",
            fontFamily: "sans-serif", originX: "center",
          }));
          canvas.add(new fabric.Rect({
            left: x + 16, top: cy + 50, width: 40, height: 12,
            fill: b, rx: 4, opacity: 0.5,
          }));
        });

        // Add card button
        canvas.add(new fabric.Rect({
          left: x + 10, top: 80 + cards.length * 90, width: 230, height: 36,
          fill: "transparent", stroke: b, strokeWidth: 1, rx: 8,
          strokeDashArray: [6, 4], opacity: 0.5,
        }));
        canvas.add(new fabric.Text("+ Add card", {
          left: x + 125, top: 80 + cards.length * 90 + 10,
          fontSize: 11, fill: "#64748b", fontFamily: "sans-serif", originX: "center",
        }));
      });

      canvas.renderAll();
    },
  },
  {
    name: "wireframe",
    label: "Wireframe",
    icon: "🖥️",
    apply: (canvas, fabric, color) => {
      // Browser chrome
      canvas.add(new fabric.Rect({ left: 40, top: 30, width: 800, height: 500, fill: "#0f172a", stroke: "#334155", strokeWidth: 2, rx: 8 }));
      canvas.add(new fabric.Rect({ left: 40, top: 30, width: 800, height: 40, fill: "#1e293b", stroke: "#334155", strokeWidth: 1, rx: 8 }));

      // Nav dots
      ["#f87171", "#fb923c", "#4ade80"].forEach((c, i) => {
        canvas.add(new fabric.Circle({ left: 58 + i * 22, top: 48, radius: 6, fill: c }));
      });

      // URL bar
      canvas.add(new fabric.Rect({ left: 160, top: 38, width: 400, height: 22, fill: "#0f172a", stroke: "#475569", strokeWidth: 1, rx: 4 }));
      canvas.add(new fabric.Text("https://yourapp.com", { left: 362, top: 43, fontSize: 10, fill: "#64748b", fontFamily: "monospace", originX: "center" }));

      // Navbar
      canvas.add(new fabric.Rect({ left: 40, top: 70, width: 800, height: 50, fill: "#1e293b", stroke: "#334155", strokeWidth: 1 }));
      canvas.add(new fabric.Text("LOGO", { left: 80, top: 86, fontSize: 14, fill: "#60a5fa", fontFamily: "sans-serif", fontWeight: "bold" }));
      ["Home", "About", "Features", "Pricing", "Contact"].forEach((item, i) => {
        canvas.add(new fabric.Text(item, { left: 380 + i * 80, top: 88, fontSize: 11, fill: "#94a3b8", fontFamily: "sans-serif" }));
      });
      canvas.add(new fabric.Rect({ left: 730, top: 82, width: 80, height: 28, fill: "#4f46e5", rx: 6 }));
      canvas.add(new fabric.Text("Sign Up", { left: 770, top: 90, fontSize: 11, fill: "#fff", fontFamily: "sans-serif", originX: "center" }));

      // Hero
      canvas.add(new fabric.Rect({ left: 40, top: 120, width: 800, height: 160, fill: "#0f172a", stroke: "#1e293b", strokeWidth: 1 }));
      canvas.add(new fabric.Text("Hero Headline Goes Here", { left: 440, top: 148, fontSize: 22, fill: "#e2e8f0", fontFamily: "sans-serif", originX: "center", fontWeight: "bold" }));
      canvas.add(new fabric.Text("Subheading text that describes your product or service in a few words.", { left: 440, top: 182, fontSize: 11, fill: "#64748b", fontFamily: "sans-serif", originX: "center" }));
      canvas.add(new fabric.Rect({ left: 360, top: 210, width: 100, height: 32, fill: "#4f46e5", rx: 6 }));
      canvas.add(new fabric.Text("Get Started", { left: 410, top: 219, fontSize: 11, fill: "#fff", fontFamily: "sans-serif", originX: "center" }));
      canvas.add(new fabric.Rect({ left: 476, top: 210, width: 100, height: 32, fill: "transparent", stroke: "#4f46e5", strokeWidth: 2, rx: 6 }));
      canvas.add(new fabric.Text("Learn More", { left: 526, top: 219, fontSize: 11, fill: "#60a5fa", fontFamily: "sans-serif", originX: "center" }));

      // Cards
      [0, 1, 2].forEach((i) => {
        const cx = 60 + i * 270;
        canvas.add(new fabric.Rect({ left: cx, top: 300, width: 240, height: 160, fill: "#1e293b", stroke: "#334155", strokeWidth: 1, rx: 8 }));
        canvas.add(new fabric.Rect({ left: cx, top: 300, width: 240, height: 80, fill: "#334155", rx: 8 }));
        canvas.add(new fabric.Text(`Feature ${i + 1}`, { left: cx + 120, top: 396, fontSize: 13, fill: "#e2e8f0", fontFamily: "sans-serif", originX: "center", fontWeight: "bold" }));
        canvas.add(new fabric.Text("Description text here", { left: cx + 120, top: 420, fontSize: 10, fill: "#64748b", fontFamily: "sans-serif", originX: "center" }));
      });

      canvas.renderAll();
    },
  },
];

export default function WhiteboardView({ databaseId }: { databaseId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTool, setActiveTool] = useState<"pen" | "select" | "rect" | "circle" | "text" | "eraser">("pen");
  const [activeColor, setActiveColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [activeTemplate, setActiveTemplate] = useState<TemplateName>("blank");

  useEffect(() => {
    if (!canvasRef.current) return;

    import("fabric").then((mod) => {
      const fabric = mod.fabric ?? mod;
      const parent = canvasRef.current?.parentElement;
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        backgroundColor: "#1a1a2e",
        width: parent?.offsetWidth || 900,
        height: parent?.offsetHeight || 520,
      });

      canvas.freeDrawingBrush.color = "#ffffff";
      canvas.freeDrawingBrush.width = 3;
      fabricRef.current = canvas;
      setIsReady(true);

      // Auto-open template picker on first load
      setShowTemplates(true);

      const handleResize = () => {
        const p = canvasRef.current?.parentElement;
        if (!p) return;
        canvas.setWidth(p.offsetWidth);
        canvas.setHeight(p.offsetHeight);
        canvas.renderAll();
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        canvas.dispose();
      };
    });

    return () => { fabricRef.current?.dispose(); };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (activeTool === "pen") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = brushSize;
    } else if (activeTool === "eraser") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = "#1a1a2e";
      canvas.freeDrawingBrush.width = brushSize * 4;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [activeTool, activeColor, brushSize]);

  const applyTemplate = async (template: Template) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const mod = await import("fabric");
    const fabric = mod.fabric ?? mod;
    canvas.clear();
    canvas.setBackgroundColor("#1a1a2e", () => {
      template.apply(canvas, fabric, activeColor);
      canvas.renderAll();
    });
    setActiveTemplate(template.name);
    setShowTemplates(false);
    setActiveTool("select");
  };

  const addRect = async () => {
    const mod = await import("fabric");
    const fabric = mod.fabric ?? mod;
    const rect = new fabric.Rect({ left: 100, top: 100, width: 130, height: 80, fill: "transparent", stroke: activeColor, strokeWidth: 2 });
    fabricRef.current?.add(rect);
    fabricRef.current?.setActiveObject(rect);
    setActiveTool("select");
  };

  const addCircle = async () => {
    const mod = await import("fabric");
    const fabric = mod.fabric ?? mod;
    const circle = new fabric.Circle({ left: 150, top: 150, radius: 50, fill: "transparent", stroke: activeColor, strokeWidth: 2 });
    fabricRef.current?.add(circle);
    fabricRef.current?.setActiveObject(circle);
    setActiveTool("select");
  };

  const addText = async () => {
    const mod = await import("fabric");
    const fabric = mod.fabric ?? mod;
    const text = new fabric.IText("Type here...", { left: 120, top: 120, fill: activeColor, fontSize: 18, fontFamily: "sans-serif" });
    fabricRef.current?.add(text);
    fabricRef.current?.setActiveObject(text);
    setActiveTool("select");
  };

  const handleClear = () => {
    fabricRef.current?.clear();
    fabricRef.current?.setBackgroundColor("#1a1a2e", () => fabricRef.current?.renderAll());
  };

  const handleDownload = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL({ format: "png", multiplier: 2 });
    const a = document.createElement("a");
    a.href = url;
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}?whiteboard=${databaseId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const COLORS = ["#ffffff", "#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#f472b6"];

  const toolBtn = (
    tool: typeof activeTool,
    icon: React.ReactNode,
    title: string,
    onClick?: () => void
  ) => (
    <button
      onClick={onClick ?? (() => setActiveTool(tool))}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition ${
        activeTool === tool
          ? "bg-violet-600 text-white"
          : "text-gray-400 hover:text-white hover:bg-white/10"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] rounded-xl overflow-hidden border border-white/[0.06]">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#111114] border-b border-white/[0.06] flex-wrap gap-2">

        {/* Left */}
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-400 shrink-0">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
          <span className="text-white text-xs font-semibold">Whiteboard</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isReady ? "bg-emerald-400" : "bg-gray-600"}`} />
        </div>

        {/* Center: Tools */}
        <div className="flex items-center gap-1 flex-wrap">

          {/* Template picker button */}
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1 px-2 py-1 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 rounded-md text-[11px] font-medium transition"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Templates
          </button>

          <div className="w-px h-4 bg-white/10 mx-0.5" />

          {/* Pen */}
          {toolBtn("pen",
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>, "Pen"
          )}
          {/* Select */}
          {toolBtn("select",
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 3l14 9-7 1-4 7z"/>
            </svg>, "Select"
          )}
          {/* Rect */}
          {toolBtn("rect",
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>, "Rectangle", addRect
          )}
          {/* Circle */}
          {toolBtn("circle",
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9"/>
            </svg>, "Circle", addCircle
          )}
          {/* Text */}
          {toolBtn("text",
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
            </svg>, "Text", addText
          )}
          {/* Eraser */}
          {toolBtn("eraser",
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/><path d="M6 11l4 4"/>
            </svg>, "Eraser"
          )}

          <div className="w-px h-4 bg-white/10 mx-0.5" />

          {/* Colors */}
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setActiveColor(c); setActiveTool("pen"); }}
              className={`w-4 h-4 rounded-full border-2 transition ${activeColor === c ? "border-white scale-125" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}

          <div className="w-px h-4 bg-white/10 mx-0.5" />

          <input
            type="range" min={1} max={20} value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-16 h-1 accent-violet-500 cursor-pointer"
            title="Brush size"
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <button onClick={() => setShowShareModal(true)} title="Share"
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <button onClick={handleDownload} disabled={!isReady} title="Download PNG"
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-30 transition">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <div className="w-px h-3 bg-white/10 mx-0.5" />
          <button onClick={handleClear} disabled={!isReady} title="Clear canvas"
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 disabled:opacity-30 transition">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className="flex-1 overflow-hidden relative" style={{ minHeight: 0 }}>
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a2e] gap-3 z-10">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500 tracking-widest uppercase">Loading canvas</span>
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#111114] border-t border-white/[0.06]">
        <span className="text-[10px] text-gray-600">{isReady ? "● active" : "○ loading"}</span>
        <span className="text-[10px] text-gray-600 tracking-widest">fabric.js · {activeTemplate}</span>
      </div>

      {/* ── Template Picker Modal ── */}
      {showTemplates && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTemplates(false)}
        >
          <div
            className="bg-[#111114] rounded-2xl p-6 w-full max-w-lg border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white">Choose a Template</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Start with a pre-built layout or blank canvas</p>
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition hover:border-violet-500 hover:bg-violet-500/10 ${
                    activeTemplate === t.name
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-[11px] text-gray-300 font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-[#111114] rounded-2xl p-5 w-full max-w-xs border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Share whiteboard</h2>
              <button onClick={() => setShowShareModal(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Invite link</p>
            <div className="flex gap-2">
              <input readOnly value={`${window.location.origin}?whiteboard=${databaseId}`}
                className="flex-1 bg-[#0d0d0f] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-400 outline-none font-mono truncate" />
              <button onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                  copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}