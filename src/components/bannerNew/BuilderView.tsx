/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  BannerAPI,
  type Banner,
  type BannerElement,
  type BannerStatus,
  type ButtonElement,
  type CreateBannerInput,
  type ScreenType,
  type TextElement,
} from "@/lib/api/banners";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ImageIcon,
  Layers,
  Loader2,
  Monitor,
  MousePointer,
  Move,
  PanelLeft,
  Save,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { BannerCanvas } from "./BannerCanvas";
import { ButtonPanel } from "./ButtonPanel";
import { defaultBanner, Field, Inp, MobilePanel, SCREEN_PRESETS, Sel, STATUS_COLORS, toSlug } from "./Helper";
import { TextPanel } from "./TextPanel";

// ✅ Same resolve function as BannerListView — keeps image URL handling consistent
const resolveBannerImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('blob:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = (process.env.NEXT_PUBLIC_IMAGE_URL || '').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

// ── Builder View ──────────────────────────────────────────────────────────────
export function BuilderView({
  initialBanner,
  onBack,
  addToast,
}: {
  initialBanner: CreateBannerInput | Banner | null;
  onBack: () => void;
  addToast: (type: "success" | "error", msg: string) => void;
}) {

  const isEdit = !!(initialBanner && '_id' in initialBanner && initialBanner._id);

  const getBannerForState = (): CreateBannerInput => {
    if (!initialBanner) return defaultBanner();

    if ('_id' in initialBanner) {
      const { _id, __v, createdAt, updatedAt, createdBy, updatedBy, ...rest } = initialBanner as Banner;
      return {
        ...rest,
        // ✅ Resolve stored S3 path so canvas shows the image on edit
        backgroundImageUrl: resolveBannerImageUrl(rest.backgroundImageUrl),
      } as CreateBannerInput;
    }
    return initialBanner as CreateBannerInput;
  };

  const [banner, setBanner] = useState<CreateBannerInput>(getBannerForState());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<"layers" | "config">("config");
  const [saving, setSaving] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [selectedBackgroundFile, setSelectedBackgroundFile] = useState<File | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel | null>(null);

  const initialRef = useRef(JSON.stringify(getBannerForState()));
  const isDirty = JSON.stringify(banner) !== initialRef.current;

  const handleBack = () => {
    if (isDirty && !confirm("You have unsaved changes. Leave anyway?")) return;
    onBack();
  };

  const slugEditedRef = useRef(false);
  const handleNameChange = (name: string) =>
    setBanner((b) => ({
      ...b,
      name,
      ...(slugEditedRef.current ? {} : { slug: toSlug(name) }),
    }));
  const handleSlugChange = (slug: string) => {
    slugEditedRef.current = true;
    setBanner((b) => ({ ...b, slug: toSlug(slug) }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgUploading(true);
    try {
      setSelectedBackgroundFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBanner((b) => ({ ...b, backgroundImageUrl: previewUrl }));
      addToast("success", "Background image selected");
    } catch (err: unknown) {
      addToast("error", (err as Error).message ?? "Failed to select file");
    } finally {
      setBgUploading(false);
      e.target.value = "";
    }
  };

  const addText = () => {
    const el: TextElement = {
      id: uuidv4(),
      type: "TEXT",
      zIndex: banner.elements.length,
      content: "New Text",
      positionX: 5,
      positionY: 5,
      isVisible: true,
      style: { fontSize: 32, fontWeight: "700", color: "#1e293b" },
    };
    setBanner((b) => ({ ...b, elements: [...b.elements, el] }));
    setSelectedId(el.id);
    setLeftTab("layers");
    setMobilePanel("layers");
  };

  const addButton = () => {
    const el: ButtonElement = {
      id: uuidv4(),
      type: "BUTTON",
      zIndex: banner.elements.length,
      label: "Click Here",
      href: "#",
      isExternal: false,
      positionX: 5,
      positionY: 55,
      isVisible: true,
      style: {
        backgroundColor: "#4f46e5",
        textColor: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        borderRadius: 10,
        paddingTop: 12,
        paddingRight: 28,
        paddingBottom: 12,
        paddingLeft: 28,
        height: 48,
      },
    };
    setBanner((b) => ({ ...b, elements: [...b.elements, el] }));
    setSelectedId(el.id);
    setLeftTab("layers");
    setMobilePanel("layers");
  };

  const updateElement = (updated: BannerElement) =>
    setBanner((b) => ({
      ...b,
      elements: b.elements.map((e) => (e.id === updated.id ? updated : e)),
    }));

  const deleteElement = (id: string) => {
    setBanner((b) => ({ ...b, elements: b.elements.filter((e) => e.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };

  const handlePositionChange = (id: string, x: number, y: number) =>
    setBanner((b) => ({
      ...b,
      elements: b.elements.map((e) => e.id === id ? { ...e, positionX: x, positionY: y } : e),
    }));

  const handleScreenChange = (screen: ScreenType) => {
    const preset = SCREEN_PRESETS[screen];
    const hasCustom =
      banner.width !== SCREEN_PRESETS[banner.screenType].width ||
      banner.height !== SCREEN_PRESETS[banner.screenType].height;
    if (hasCustom && !confirm(`Switch to ${screen}? Resets to ${preset.width}×${preset.height}px.`)) return;
    setBanner((b) => ({ ...b, screenType: screen, ...preset }));
  };

  const handleSave = async () => {
    if (!banner.name.trim()) { addToast("error", "Banner name is required"); setMobilePanel("config"); return; }
    if (!banner.slug.trim()) { addToast("error", "Slug is required"); setMobilePanel("config"); return; }

    setSaving(true);
    try {
      // ✅ Always strip backgroundImageUrl before sending to backend:
      //    - blob: URLs are client-only previews
      //    - resolved http(s): URLs are display-only — backend stores raw S3 paths
      //    Backend keeps the existing image unless a new File is uploaded
      const { backgroundImageUrl: _stripped, ...bannerData } = banner;

      if (isEdit && initialBanner && '_id' in initialBanner) {
        const bannerId = (initialBanner as Banner)._id;
        await BannerAPI.update(bannerId, bannerData, selectedBackgroundFile);
        addToast("success", "Banner updated");
        initialRef.current = JSON.stringify(banner);
      } else {
        await BannerAPI.create(bannerData, selectedBackgroundFile);
        addToast("success", "Banner created");
        onBack();
      }
    } catch (err: unknown) {
      addToast("error", (err as Error)?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const formatForDateTimeInput = (isoString: string | null | undefined): string => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch { return ""; }
  };

  const formatDateTimeForAPI = (datetime: string | null): string | null => {
    if (!datetime) return null;
    try {
      const d = new Date(datetime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/) ? datetime + ":00" : datetime);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch { return null; }
    return null;
  };

  const selectedElement = banner.elements.find((e) => e.id === selectedId) ?? null;
  const sortedLayers = [...banner.elements].sort((a, b) => b.zIndex - a.zIndex);
  const isReady = banner.name.trim() && banner.slug.trim();

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (banner.backgroundImageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(banner.backgroundImageUrl);
      }
    };
  }, [banner.backgroundImageUrl]);

  // ── Panel content ─────────────────────────────────────────────────────────

  const ConfigContent = (
    <div className="space-y-3 p-3">
      <Field label="Name *">
        <Inp value={banner.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Summer Sale Banner" className={!banner.name.trim() ? "border-red-300 focus:ring-red-400" : ""} />
      </Field>
      <Field label="Slug *">
        <Inp value={banner.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="summer-sale-banner" className={`font-mono text-xs ${!banner.slug.trim() ? "border-red-300 focus:ring-red-400" : ""}`} />
        <p className="text-[10px] text-slate-400 mt-0.5">Auto-generated · editable</p>
      </Field>
      <Field label="Page Route">
        <Inp value={banner.page} onChange={(e) => setBanner((b) => ({ ...b, page: e.target.value }))} placeholder="/home" />
      </Field>
      <Field label="Slot">
        <Sel value={banner.position} onChange={(e) => setBanner((b) => ({ ...b, position: e.target.value }))}>
          {["top", "hero", "sidebar", "footer", "popup"].map((p) => <option key={p}>{p}</option>)}
        </Sel>
      </Field>
      <Field label="Priority">
        <Inp type="number" value={banner.priority} onChange={(e) => setBanner((b) => ({ ...b, priority: +e.target.value }))} />
      </Field>
      <Field label="Starts At">
        <Inp type="datetime-local" value={formatForDateTimeInput(banner.startsAt)} onChange={(e) => setBanner((b) => ({ ...b, startsAt: formatDateTimeForAPI(e.target.value) }))} />
      </Field>
      <Field label="Ends At">
        <Inp type="datetime-local" value={formatForDateTimeInput(banner.endsAt)} onChange={(e) => setBanner((b) => ({ ...b, endsAt: formatDateTimeForAPI(e.target.value) }))} />
      </Field>
      <Field label="Width (px)">
        <Inp type="number" value={banner.width} onChange={(e) => setBanner((b) => ({ ...b, width: +e.target.value }))} />
      </Field>
      <Field label="Height (px)">
        <Inp type="number" value={banner.height} onChange={(e) => setBanner((b) => ({ ...b, height: +e.target.value }))} />
      </Field>
      <Field label="Description">
        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y min-h-[50px]" value={banner.description ?? ""} onChange={(e) => setBanner((b) => ({ ...b, description: e.target.value }))} />
      </Field>
    </div>
  );

  const LayersContent = (
    <div className="p-3">
      <div className="flex gap-1.5 mb-3">
        <button onClick={addText} className="flex-1 flex flex-col items-center gap-1 border border-dashed border-slate-200 rounded-xl py-3 text-xs font-semibold text-slate-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all">
          <Type className="h-4 w-4" /> Text
        </button>
        <button onClick={addButton} className="flex-1 flex flex-col items-center gap-1 border border-dashed border-slate-200 rounded-xl py-3 text-xs font-semibold text-slate-400 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-all">
          <MousePointer className="h-4 w-4" /> Button
        </button>
      </div>
      {banner.elements.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8">No elements yet.<br />Add text or a button above.</p>
      ) : (
        <div className="space-y-0.5">
          {sortedLayers.map((el) => (
            <div key={el.id} onClick={() => { setSelectedId(el.id === selectedId ? null : el.id); setMobilePanel("properties"); }}
              className={`flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer text-xs transition-all ${el.id === selectedId ? "bg-violet-50 text-violet-700" : "hover:bg-slate-50 text-slate-500"}`}
            >
              {el.type === "TEXT" ? (
                <div className="h-5 w-5 bg-violet-100 rounded flex items-center justify-center flex-shrink-0"><Type className="h-2.5 w-2.5 text-violet-600" /></div>
              ) : (
                <div className="h-5 w-5 bg-sky-100 rounded flex items-center justify-center flex-shrink-0"><MousePointer className="h-2.5 w-2.5 text-sky-600" /></div>
              )}
              <span className="flex-1 truncate font-semibold">
                {el.type === "TEXT" ? (el as TextElement).content?.slice(0, 14) || "Text" : (el as ButtonElement).label || "Button"}
              </span>
              <div className="flex gap-0.5 flex-shrink-0">
                <button onClick={(e) => { e.stopPropagation(); updateElement({ ...el, zIndex: el.zIndex + 1 }); }} className="p-0.5 hover:text-violet-600"><ChevronUp className="h-3 w-3" /></button>
                <button onClick={(e) => { e.stopPropagation(); updateElement({ ...el, zIndex: Math.max(0, el.zIndex - 1) }); }} className="p-0.5 hover:text-violet-600"><ChevronDown className="h-3 w-3" /></button>
                <button onClick={(e) => { e.stopPropagation(); updateElement({ ...el, isVisible: !el.isVisible }); }} className="p-0.5">
                  {el.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-slate-300" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="p-0.5 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const PropertiesContent = (
    <div className="p-4">
      {selectedElement ? (
        selectedElement.type === "TEXT" ? (
          <TextPanel el={selectedElement as TextElement} onChange={updateElement} onDelete={() => deleteElement(selectedElement.id)} />
        ) : (
          <ButtonPanel el={selectedElement as ButtonElement} onChange={updateElement} onDelete={() => deleteElement(selectedElement.id)} />
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-14 w-14 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center mb-4">
            <PanelLeft className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-xs font-semibold text-slate-400 leading-relaxed">Click an element<br />on the canvas to<br />edit its properties</p>
        </div>
      )}
    </div>
  );

  const BgToolbar = ({ compact = false }: { compact?: boolean }) => (
    <div className={`bg-white border-b border-slate-100 flex items-center gap-2 flex-shrink-0 overflow-x-auto ${compact ? "px-3 py-1.5" : "px-4 py-2 gap-3"}`}>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-bold text-slate-400">BG</span>
        <input type="color" value={banner.backgroundColor} onChange={(e) => setBanner((b) => ({ ...b, backgroundColor: e.target.value }))} className={`rounded-md border border-slate-200 cursor-pointer p-0.5 ${compact ? "h-6 w-6" : "h-7 w-7 rounded-lg"}`} />
        <Inp value={banner.backgroundColor} onChange={(e) => setBanner((b) => ({ ...b, backgroundColor: e.target.value }))} className={`font-mono ${compact ? "w-20 text-xs" : "w-24 text-xs"}`} />
      </div>
      {!compact && <div className="h-4 w-px bg-slate-200 flex-shrink-0" />}
      <label className={`flex items-center gap-1.5 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50 text-slate-600 flex-shrink-0 ${compact ? "px-2 py-1" : "px-3 py-1.5"} ${bgUploading ? "opacity-60 pointer-events-none" : ""}`}>
        {bgUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
        {bgUploading ? "Uploading…" : compact ? "BG" : "BG Image"}
        <input type="file" accept="image/*" className="hidden" disabled={bgUploading} onChange={handleFileChange} />
      </label>
      {banner.backgroundImageUrl && (
        <>
          {!compact && (
            <Sel value={banner.backgroundSize} onChange={(e) => setBanner((b) => ({ ...b, backgroundSize: e.target.value }))} className="w-24 text-xs">
              {["cover", "contain", "auto", "100% 100%"].map((s) => <option key={s}>{s}</option>)}
            </Sel>
          )}
          <button onClick={() => {
            if (banner.backgroundImageUrl?.startsWith('blob:')) URL.revokeObjectURL(banner.backgroundImageUrl);
            setBanner((b) => ({ ...b, backgroundImageUrl: "" }));
            setSelectedBackgroundFile(null);
          }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      )}
      {!compact && (
        <div className="ml-auto hidden xl:flex items-center gap-3 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1"><Move className="h-3 w-3" /> Drag</span>
          <span className="opacity-40">·</span>
          <span>Dbl-click to edit</span>
          <span className="opacity-40">·</span>
          <span>⌟ resize</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col relative" style={{ height: "calc(100vh - 56px)" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 h-12 flex-shrink-0">
        <button onClick={handleBack} className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-800 transition-colors flex-shrink-0">
          <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Banners</span>
        </button>
        <div className="h-4 w-px bg-slate-200 flex-shrink-0" />
        <button onClick={() => setMobilePanel(mobilePanel === "config" ? null : "config")} className="flex-1 min-w-0 text-left lg:pointer-events-none">
          <span className={`text-sm font-bold truncate block ${banner.name ? "text-slate-900" : "text-slate-300"}`}>
            {banner.name || "Untitled"}
            {isDirty && <span className="ml-1.5 text-amber-400 text-xs font-normal">●</span>}
          </span>
        </button>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
          {(["DESKTOP", "TABLET", "MOBILE"] as ScreenType[]).map((s) => {
            const Icon = s === "DESKTOP" ? Monitor : s === "TABLET" ? Tablet : Smartphone;
            return (
              <button key={s} onClick={() => handleScreenChange(s)} title={s} className={`p-1 sm:p-1.5 rounded-md transition-all ${banner.screenType === s ? "bg-white text-violet-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            );
          })}
        </div>
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {(["DRAFT", "ACTIVE", "INACTIVE", "SCHEDULED"] as BannerStatus[]).map((s) => (
            <button key={s} onClick={() => setBanner((b) => ({ ...b, status: s }))} className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${banner.status === s ? STATUS_COLORS[s] + " ring-1 ring-inset ring-current" : "text-slate-400 hover:bg-slate-100"}`}>
              {s === "SCHEDULED" ? "SCHED" : s}
            </button>
          ))}
        </div>
        <div className="sm:hidden">
          <select value={banner.status || "DRAFT"} onChange={(e) => setBanner((b) => ({ ...b, status: e.target.value as BannerStatus }))} className={`text-xs font-bold rounded-lg px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-violet-400 ${STATUS_COLORS[banner.status || "DRAFT"]}`}>
            {(["DRAFT", "ACTIVE", "INACTIVE", "SCHEDULED"] as BannerStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={handleSave} disabled={saving} className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${isReady ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"} disabled:opacity-60`}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{saving ? "Saving…" : isEdit ? "Update" : "Publish"}</span>
        </button>
      </div>

      {/* Desktop: 3-panel */}
      <div className="hidden lg:flex flex-1 overflow-hidden min-h-0">
        <div className="w-56 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col">
          <div className="flex border-b border-slate-100">
            {(["config", "layers"] as const).map((tab) => (
              <button key={tab} onClick={() => setLeftTab(tab)} className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${leftTab === tab ? "text-violet-600 border-b-2 border-violet-500" : "text-slate-400 hover:text-slate-600"}`}>{tab}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">{leftTab === "layers" ? LayersContent : ConfigContent}</div>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <BgToolbar />
          <BannerCanvas banner={banner} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); if (id) setLeftTab("layers"); }} onPositionChange={handlePositionChange} onElementChange={updateElement} />
        </div>
        <div className="w-64 flex-shrink-0 bg-white border-l border-slate-100 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Properties</p>
          </div>
          <div className="flex-1 overflow-y-auto">{PropertiesContent}</div>
        </div>
      </div>

      {/* Mobile/Tablet */}
      <div className="lg:hidden flex flex-col flex-1 overflow-hidden min-h-0">
        <BgToolbar compact />
        <div className="flex-1 overflow-hidden min-h-0">
          <BannerCanvas banner={banner} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); if (id) setMobilePanel("properties"); }} onPositionChange={handlePositionChange} onElementChange={updateElement} />
        </div>
        <div className="bg-white border-t border-slate-100 flex items-center flex-shrink-0 z-10">
          {([{ id: "layers" as MobilePanel, label: "Layers", icon: Layers }, { id: "config" as MobilePanel, label: "Config", icon: SlidersHorizontal }, { id: "properties" as MobilePanel, label: "Properties", icon: PanelLeft }]).map(({ id, label, icon: Icon }) => {
            const active = mobilePanel === id;
            return (
              <button key={id} onClick={() => setMobilePanel(active ? null : id)} className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${active ? "text-violet-600" : "text-slate-400"}`}>
                <Icon className="h-4 w-4" />{label}
                {active && <div className="w-4 h-0.5 rounded-full bg-violet-500 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom sheet */}
      {mobilePanel !== null && (
        <>
          <div className="lg:hidden fixed inset-0 z-20 bg-black/25" onClick={() => setMobilePanel(null)} />
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-2xl shadow-2xl flex flex-col" style={{ maxHeight: "65vh" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                {mobilePanel === "layers" && <><Layers className="h-4 w-4 text-violet-500" /><span className="text-sm font-bold text-slate-700">Layers</span></>}
                {mobilePanel === "config" && <><SlidersHorizontal className="h-4 w-4 text-violet-500" /><span className="text-sm font-bold text-slate-700">Config</span></>}
                {mobilePanel === "properties" && <><PanelLeft className="h-4 w-4 text-violet-500" /><span className="text-sm font-bold text-slate-700">Properties</span></>}
              </div>
              <button onClick={() => setMobilePanel(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1 overscroll-contain">
              {mobilePanel === "layers" && LayersContent}
              {mobilePanel === "config" && ConfigContent}
              {mobilePanel === "properties" && PropertiesContent}
            </div>
          </div>
        </>
      )}
    </div>
  );
}