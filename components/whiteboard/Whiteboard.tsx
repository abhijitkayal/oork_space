'use client';

import { useState, useEffect, useRef } from 'react';

export function Whiteboard({
  roomId,
  initialData,
  onChange,
}: {
  roomId?: string;
  initialData?: any;
  onChange?: (data: any) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<"pen" | "select" | "eraser">("pen");
  const [activeColor, setActiveColor] = useState("#2563eb");
  const [brushSize, setBrushSize] = useState(3);

  const [roomIdState] = useState<string>(
    () => roomId ?? `whiteboard-${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    import("fabric").then((mod) => {
      const fabric = mod.fabric ?? mod;
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        backgroundColor: "#ffffff",
        width: canvasRef.current?.parentElement?.offsetWidth || 800,
        height: canvasRef.current?.parentElement?.offsetHeight || 400,
      });

      canvas.freeDrawingBrush.color = "#2563eb";
      canvas.freeDrawingBrush.width = 3;
      fabricRef.current = canvas;
      setIsReady(true);

      canvas.on("object:added", () => {
        const data = canvas.toJSON();
        onChange?.(data);
        setHasUnsavedChanges(true);
      });

      const handleResize = () => {
        const parent = canvasRef.current?.parentElement;
        if (!parent) return;
        canvas.setWidth(parent.offsetWidth);
        canvas.setHeight(parent.offsetHeight);
        canvas.renderAll();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        canvas.dispose();
      };
    }).catch(() => setError("Failed to load whiteboard"));

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
      canvas.freeDrawingBrush.color = "#ffffff";
      canvas.freeDrawingBrush.width = brushSize * 4;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [activeTool, activeColor, brushSize]);

  const addText = async () => {
    const mod = await import("fabric");
    const fabric = mod.fabric ?? mod;
    const text = new fabric.IText("Type here...", {
      left: 100, top: 100,
      fill: activeColor, fontSize: 16, fontFamily: "sans-serif",
    });
    fabricRef.current?.add(text);
    fabricRef.current?.setActiveObject(text);
    setActiveTool("select");
  };

  const handleClear = () => {
    fabricRef.current?.clear();
    fabricRef.current?.setBackgroundColor("#ffffff", () => fabricRef.current?.renderAll());
    setHasUnsavedChanges(false);
  };

  const handleExportPNG = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL({ format: "png", multiplier: 2 });
    const a = document.createElement("a");
    a.href = url;
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
  };

  const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#db2777", "#000000", "#6b7280"];

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <p className="text-xs text-red-500">{error}</p>
          <button onClick={() => setError(null)} className="px-3 py-1 bg-red-500 text-white text-xs rounded-md">Dismiss</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden rounded-xl border border-gray-200 bg-white">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-gray-50 border-b border-gray-200 shrink-0 flex-wrap gap-1">

        {/* Left: title */}
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
          <span className="text-[11px] font-semibold text-gray-700">Whiteboard</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isReady ? "bg-emerald-400" : "bg-amber-400"}`} />
        </div>

        {/* Center: tools + colors */}
        <div className="flex items-center gap-1">
          {/* Pen */}
          <button
            onClick={() => setActiveTool("pen")}
            title="Pen"
            className={`w-6 h-6 flex items-center justify-center rounded transition ${activeTool === "pen" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
          </button>
          {/* Select */}
          <button
            onClick={() => setActiveTool("select")}
            title="Select"
            className={`w-6 h-6 flex items-center justify-center rounded transition ${activeTool === "select" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 3l14 9-7 1-4 7z"/>
            </svg>
          </button>
          {/* Text */}
          <button
            onClick={addText}
            title="Text"
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 transition"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
            </svg>
          </button>
          {/* Eraser */}
          <button
            onClick={() => setActiveTool("eraser")}
            title="Eraser"
            className={`w-6 h-6 flex items-center justify-center rounded transition ${activeTool === "eraser" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/><path d="M6 11l4 4"/>
            </svg>
          </button>

          <div className="w-px h-3 bg-gray-200 mx-1" />

          {/* Colors */}
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => { setActiveColor(color); setActiveTool("pen"); }}
              className={`w-3.5 h-3.5 rounded-full border-2 transition ${activeColor === color ? "border-gray-800 scale-125" : "border-transparent"}`}
              style={{ backgroundColor: color }}
            />
          ))}

          <div className="w-px h-3 bg-gray-200 mx-1" />

          {/* Brush size */}
          <input
            type="range" min={1} max={20} value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-14 h-1 accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Right: export + clear */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleExportPNG}
            disabled={!isReady}
            title="Export PNG"
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 transition"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <div className="w-px h-3 bg-gray-200 mx-0.5" />
          <button
            onClick={handleClear}
            disabled={!isReady}
            title="Clear"
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 transition"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
          {hasUnsavedChanges && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-1" title="Unsaved" />
          )}
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className="flex-1 overflow-hidden relative" style={{ minHeight: 0 }}>
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white gap-2 z-10">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-gray-400 uppercase tracking-widest">Loading</span>
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-gray-50 border-t border-gray-200 shrink-0">
        <span className="text-[10px] text-gray-400">{isReady ? "● active" : "○ initializing…"}</span>
        <span className="text-[10px] text-gray-300 font-mono">{roomIdState.substring(0, 8)}</span>
      </div>
    </div>
  );
}