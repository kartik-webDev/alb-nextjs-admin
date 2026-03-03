/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type BannerElement, type ButtonElement, type CreateBannerInput, type TextElement } from "@/lib/api/banners";
import { Crop, Move } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CropRegion, SCREEN_MIN_SIZES } from "./Helper";

// ── Crop Overlay ──────────────────────────────────────────────────────────────
function CropOverlay({
  bannerWidth,
  bannerHeight,
  minWidth,
  minHeight,
  initialCrop,
  onDone,
  onCancel,
}: {
  bannerWidth: number;
  bannerHeight: number;
  minWidth: number;
  minHeight: number;
  initialCrop: CropRegion;
  onDone: (crop: CropRegion) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<CropRegion>(initialCrop);
  const dragging = useRef<{ edge: string; startX: number; startY: number; startCrop: CropRegion } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const onMouseDown = (e: React.MouseEvent, edge: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = { edge, startX: e.clientX, startY: e.clientY, startCrop: { ...crop } };

    const onMove = (me: MouseEvent) => {
      if (!dragging.current || !overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const scaleX = bannerWidth / rect.width;
      const scaleY = bannerHeight / rect.height;
      const dx = (me.clientX - dragging.current.startX) * scaleX;
      const dy = (me.clientY - dragging.current.startY) * scaleY;
      const sc = dragging.current.startCrop;

      setCrop((prev) => {
        let { x, y, w, h } = sc;
        const edge = dragging.current!.edge;

        if (edge === "move") {
          x = clamp(sc.x + dx, 0, bannerWidth - w);
          y = clamp(sc.y + dy, 0, bannerHeight - h);
        }
        if (edge === "e")  w = clamp(sc.w + dx, minWidth, bannerWidth - x);
        if (edge === "s")  h = clamp(sc.h + dy, minHeight, bannerHeight - y);
        if (edge === "w") { const nw = clamp(sc.w - dx, minWidth, sc.x + sc.w); x = sc.x + sc.w - nw; w = nw; }
        if (edge === "n") { const nh = clamp(sc.h - dy, minHeight, sc.y + sc.h); y = sc.y + sc.h - nh; h = nh; }
        if (edge === "nw") {
          const nw = clamp(sc.w - dx, minWidth, sc.x + sc.w); x = sc.x + sc.w - nw; w = nw;
          const nh = clamp(sc.h - dy, minHeight, sc.y + sc.h); y = sc.y + sc.h - nh; h = nh;
        }
        if (edge === "ne") {
          w = clamp(sc.w + dx, minWidth, bannerWidth - x);
          const nh = clamp(sc.h - dy, minHeight, sc.y + sc.h); y = sc.y + sc.h - nh; h = nh;
        }
        if (edge === "sw") {
          const nw = clamp(sc.w - dx, minWidth, sc.x + sc.w); x = sc.x + sc.w - nw; w = nw;
          h = clamp(sc.h + dy, minHeight, bannerHeight - y);
        }
        if (edge === "se") {
          w = clamp(sc.w + dx, minWidth, bannerWidth - x);
          h = clamp(sc.h + dy, minHeight, bannerHeight - y);
        }
        return { x, y, w, h };
      });
    };

    const onUp = () => {
      dragging.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  const handleStyle = (cursor: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
    position: "absolute", width: 12, height: 12, background: "#fff", border: "2px solid #8b5cf6",
    borderRadius: 2, cursor, zIndex: 10, transform: "translate(-50%,-50%)", ...extra,
  });

  return (
    <div ref={overlayRef} style={{ position: "absolute", inset: 0, zIndex: 50 }}>
      {/* Dark mask outside crop */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          <mask id="crop-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={pct(crop.x, bannerWidth)} y={pct(crop.y, bannerHeight)}
              width={pct(crop.w, bannerWidth)} height={pct(crop.h, bannerHeight)}
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
      </svg>

      {/* Crop box */}
      <div
        style={{
          position: "absolute",
          left: pct(crop.x, bannerWidth), top: pct(crop.y, bannerHeight),
          width: pct(crop.w, bannerWidth), height: pct(crop.h, bannerHeight),
          border: "2px solid #8b5cf6", boxSizing: "border-box", cursor: "move",
        }}
        onMouseDown={(e) => onMouseDown(e, "move")}
      >
        {/* Grid lines */}
        {[33, 66].map((p) => (
          <React.Fragment key={p}>
            <div style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(139,92,246,0.4)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: 1, background: "rgba(139,92,246,0.4)", pointerEvents: "none" }} />
          </React.Fragment>
        ))}

        {/* Size label */}
        <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(139,92,246,0.85)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 6px", pointerEvents: "none", fontFamily: "monospace" }}>
          {Math.round(crop.w)} × {Math.round(crop.h)}
        </div>

        {/* Handles */}
        <div style={handleStyle("nw-resize", { left: "0%", top: "0%" })} onMouseDown={(e) => onMouseDown(e, "nw")} />
        <div style={handleStyle("n-resize", { left: "50%", top: "0%" })} onMouseDown={(e) => onMouseDown(e, "n")} />
        <div style={handleStyle("ne-resize", { left: "100%", top: "0%" })} onMouseDown={(e) => onMouseDown(e, "ne")} />
        <div style={handleStyle("e-resize", { left: "100%", top: "50%" })} onMouseDown={(e) => onMouseDown(e, "e")} />
        <div style={handleStyle("se-resize", { left: "100%", top: "100%" })} onMouseDown={(e) => onMouseDown(e, "se")} />
        <div style={handleStyle("s-resize", { left: "50%", top: "100%" })} onMouseDown={(e) => onMouseDown(e, "s")} />
        <div style={handleStyle("sw-resize", { left: "0%", top: "100%" })} onMouseDown={(e) => onMouseDown(e, "sw")} />
        <div style={handleStyle("w-resize", { left: "0%", top: "50%" })} onMouseDown={(e) => onMouseDown(e, "w")} />
      </div>

      {/* Buttons */}
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 60 }}>
        <button
          onClick={onCancel}
          style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 8, padding: "6px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={() => onDone(crop)}
          style={{ background: "#8b5cf6", border: "none", color: "#fff", borderRadius: 8, padding: "6px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Apply Crop
        </button>
      </div>
    </div>
  );
}

// ── Canvas ────────────────────────────────────────────────────────────────────
export function BannerCanvas({
  banner,
  selectedId,
  onSelect,
  onPositionChange,
  onElementChange,
  cropMode,
  onCropDone,
  onCropCancel,
}: {
  banner: CreateBannerInput;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onElementChange: (el: BannerElement) => void;
  cropMode?: boolean;
  onCropDone?: (crop: CropRegion) => void;
  onCropCancel?: () => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; ex: number; ey: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const elementsRef = useRef(banner.elements);

  useEffect(() => { elementsRef.current = banner.elements; }, [banner.elements]);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (!containerRef.current) return;
      // Use more available space — subtract padding only
      const available = containerRef.current.clientWidth - 48;
      const availableH = containerRef.current.clientHeight - 80;
      const scaleW = available / banner.width;
      const scaleH = availableH / banner.height;
      setScale(Math.min(1, scaleW, scaleH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [banner.width, banner.height]);

  useEffect(() => {
    if (editingId && editingId !== selectedId) setEditingId(null);
  }, [selectedId, editingId]);

  const minSizes = SCREEN_MIN_SIZES[banner.screenType];

  const initialCrop: CropRegion = {
    x: 0,
    y: 0,
    w: minSizes.width,
    h: minSizes.height,
  };

  const onMouseDown = useCallback(
    (e: React.MouseEvent, id: string, ex: number, ey: number) => {
      if (cropMode) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect(id);
      drag.current = { id, sx: e.clientX, sy: e.clientY, ex, ey };
      const move = (me: MouseEvent) => {
        if (!drag.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const nx = Math.max(0, Math.min(100, drag.current.ex + ((me.clientX - drag.current.sx) / rect.width) * 100));
        const ny = Math.max(0, Math.min(100, drag.current.ey + ((me.clientY - drag.current.sy) / rect.height) * 100));
        onPositionChange(drag.current.id, nx, ny);
        drag.current.sx = me.clientX;
        drag.current.sy = me.clientY;
        drag.current.ex = nx;
        drag.current.ey = ny;
      };
      const up = () => {
        drag.current = null;
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [onSelect, onPositionChange, cropMode],
  );

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      const el = elementsRef.current.find((x) => x.id === id);
      if (!el) return;
      const startX = e.clientX, startY = e.clientY;
      const domEl = canvasRef.current?.querySelector(`[data-el-id="${id}"]`) as HTMLElement | null;
      const startW = el.type === "TEXT" ? ((el as TextElement).width ?? domEl?.offsetWidth ?? 120) : ((el as ButtonElement).style?.width ?? domEl?.offsetWidth ?? 120);
      const startH = el.type === "TEXT" ? ((el as TextElement).height ?? domEl?.offsetHeight ?? 40) : ((el as ButtonElement).style?.height ?? domEl?.offsetHeight ?? 44);
      const move = (me: MouseEvent) => {
        const newW = Math.max(20, startW + (me.clientX - startX) / scale);
        const newH = Math.max(16, startH + (me.clientY - startY) / scale);
        if (el.type === "TEXT") onElementChange({ ...el, width: newW, height: newH } as BannerElement);
        else if (el.type === "BUTTON") onElementChange({ ...el, style: { ...(el as ButtonElement).style, width: newW, height: newH } } as BannerElement);
      };
      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [scale, onElementChange],
  );

  const ResizeHandle = useCallback(
    ({ id, color }: { id: string; color: string }) => (
      <div
        onMouseDown={(e) => onResizeMouseDown(e, id)}
        style={{ position: "absolute", right: -6, bottom: -6, width: 14, height: 14, backgroundColor: color, border: "2.5px solid white", borderRadius: 3, cursor: "se-resize", zIndex: 9999, boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
      />
    ),
    [onResizeMouseDown],
  );

  const sorted = [...banner.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto flex flex-col items-center justify-start pt-6 pb-6 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:20px_20px] min-w-0 px-6"
      style={{ minHeight: 0 }}
    >
      <div style={{ width: banner.width * scale, height: banner.height * scale, flexShrink: 0 }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: banner.width, height: banner.height }}>
          <div
            ref={canvasRef}
            onClick={(e) => { if (e.target === e.currentTarget && !cropMode) onSelect(null); }}
            style={{
              width: banner.width,
              height: banner.height,
              backgroundColor: banner.backgroundColor,
              backgroundImage: banner.backgroundImageUrl ? `url(${banner.backgroundImageUrl})` : undefined,
              backgroundSize: banner.backgroundSize,
              backgroundPosition: banner.backgroundPosition,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 32px 64px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)",
              borderRadius: 16,
              cursor: cropMode ? "crosshair" : "default",
            }}
          >
            {sorted.map((el) => {
              if (!el.isVisible) return null;
              const isSelected = el.id === selectedId, isEditing = editingId === el.id;
              const base: React.CSSProperties = {
                position: "absolute",
                left: `${el.positionX}%`,
                top: `${el.positionY}%`,
                outline: isSelected ? "2px solid #8b5cf6" : "2px solid transparent",
                outlineOffset: 3,
                userSelect: isEditing ? "text" : "none",
                zIndex: el.zIndex,
                pointerEvents: cropMode ? "none" : "auto",
              };
              if (el.type === "TEXT") {
                const s = (el as TextElement).style;
                return (
                  <div
                    key={el.id} data-el-id={el.id}
                    style={{ ...base, fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, fontStyle: s.fontStyle, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textAlign: s.textAlign as any, textDecoration: s.textDecoration, textTransform: s.textTransform as any, color: s.color ?? "#000", backgroundColor: s.backgroundColor, padding: s.padding, borderRadius: s.borderRadius, border: s.border, textShadow: s.textShadow, boxShadow: s.boxShadow, width: (el as TextElement).width ?? "max-content", height: (el as TextElement).height, whiteSpace: "normal", wordBreak: "break-word", cursor: isEditing ? "text" : "move", overflow: "hidden" }}
                    onMouseDown={(e) => { if (isEditing) return; onMouseDown(e, el.id, el.positionX, el.positionY); }}
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingId(el.id); }}
                  >
                    {isEditing ? (
                      <span contentEditable suppressContentEditableWarning autoFocus
                        onBlur={(e) => { onElementChange({ ...el, content: e.currentTarget.textContent ?? "" } as BannerElement); setEditingId(null); }}
                        onKeyDown={(e) => { if (e.key === "Escape") (e.currentTarget as HTMLElement).blur(); e.stopPropagation(); }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ outline: "none", display: "block", minWidth: 20, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      >{(el as TextElement).content}</span>
                    ) : (
                      (el as TextElement).content || <span className="opacity-30 italic text-sm">Empty text</span>
                    )}
                    {isSelected && !isEditing && <ResizeHandle id={el.id} color="#8b5cf6" />}
                  </div>
                );
              }
              if (el.type === "BUTTON") {
                const s = (el as ButtonElement).style;
                return (
                  <div
                    key={el.id} data-el-id={el.id}
                    style={{ ...base, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: s.fontSize, fontFamily: s.fontFamily, fontWeight: s.fontWeight, textTransform: s.textTransform as any, letterSpacing: s.letterSpacing, backgroundColor: s.backgroundColor ?? "#4f46e5", color: s.textColor ?? "#fff", borderRadius: s.borderRadius ?? 6, borderWidth: s.borderWidth ?? 0, borderColor: s.borderColor, borderStyle: (s.borderStyle ?? "solid") as any, paddingTop: isEditing ? 0 : (s.paddingTop ?? 10), paddingRight: isEditing ? 0 : (s.paddingRight ?? 24), paddingBottom: isEditing ? 0 : (s.paddingBottom ?? 10), paddingLeft: isEditing ? 0 : (s.paddingLeft ?? 24), boxShadow: s.boxShadow, opacity: s.opacity ?? 1, width: s.width, height: s.height, cursor: isEditing ? "text" : "move", overflow: "hidden" }}
                    onMouseDown={(e) => { if (isEditing) return; onMouseDown(e, el.id, el.positionX, el.positionY); }}
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingId(el.id); }}
                  >
                    {isEditing ? (
                      <span contentEditable suppressContentEditableWarning autoFocus
                        onBlur={(e) => { onElementChange({ ...el, label: e.currentTarget.textContent ?? "" } as BannerElement); setEditingId(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); } if (e.key === "Escape") (e.currentTarget as HTMLElement).blur(); e.stopPropagation(); }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ outline: "none", display: "inline-block", minWidth: 20, whiteSpace: "nowrap", textAlign: "center", color: s.textColor ?? "#fff", padding: `${s.paddingTop ?? 10}px ${s.paddingRight ?? 24}px ${s.paddingBottom ?? 10}px ${s.paddingLeft ?? 24}px` }}
                      >{(el as ButtonElement).label}</span>
                    ) : (
                      (el as ButtonElement).label || "Button"
                    )}
                    {isSelected && !isEditing && <ResizeHandle id={el.id} color="#0ea5e9" />}
                  </div>
                );
              }
              return null;
            })}

            {banner.elements.length === 0 && !cropMode && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                <Move className="h-8 w-8 opacity-20" />
                <p className="text-sm opacity-30 font-medium">Add elements from the panel</p>
              </div>
            )}

            {/* Crop Overlay */}
            {cropMode && onCropDone && onCropCancel && (
              <CropOverlay
                bannerWidth={banner.width}
                bannerHeight={banner.height}
                minWidth={minSizes.width}
                minHeight={minSizes.height}
                initialCrop={initialCrop}
                onDone={onCropDone}
                onCancel={onCropCancel}
              />
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 font-mono mt-4">
        {banner.width} × {banner.height}px · {banner.screenType} · {Math.round(scale * 100)}%
        {banner.width > minSizes.width || banner.height > minSizes.height ? (
          <span className="ml-2 text-amber-500 font-semibold">⚠ Larger than ideal ({minSizes.width}×{minSizes.height})</span>
        ) : null}
      </p>
    </div>
  );
}