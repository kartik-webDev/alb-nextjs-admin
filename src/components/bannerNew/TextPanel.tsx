/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  type TextElement
} from "@/lib/api/banners";
import {
  Trash2,
  Type
} from "lucide-react";
import { ColorRow, Field, Inp, Sel, Toggle } from "./Helper";


// ── Text/Button Panels ────────────────────────────────────────────────────────
export function TextPanel({
  el,
  onChange,
  onDelete,
}: {
  el: TextElement;
  onChange: (u: TextElement) => void;
  onDelete: () => void;
}) {
  const s = el.style;
  const set = (p: Partial<typeof s>) =>
    onChange({ ...el, style: { ...s, ...p } });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-violet-100 rounded-lg flex items-center justify-center">
            <Type className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <span className="text-sm font-bold text-slate-800">Text Element</span>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <Field label="Content">
        <textarea
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y min-h-[60px]"
          value={el.content}
          onChange={(e) => onChange({ ...el, content: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Size (px)">
          <Inp
            type="number"
            value={s.fontSize ?? 16}
            onChange={(e) => set({ fontSize: +e.target.value })}
          />
        </Field>
        <Field label="Weight">
          <Sel
            value={s.fontWeight ?? "400"}
            onChange={(e) => set({ fontWeight: e.target.value })}
          >
            {["300", "400", "500", "600", "700", "800", "900"].map((w) => (
              <option key={w}>{w}</option>
            ))}
          </Sel>
        </Field>
      </div>
      <ColorRow
        label="Text Color"
        value={s.color ?? "#000000"}
        onChange={(v) => set({ color: v })}
      />
      <ColorRow
        label="Background"
        value={s.backgroundColor ?? "#ffffff"}
        onChange={(v) => set({ backgroundColor: v })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Align">
          <Sel
            value={s.textAlign ?? "left"}
            onChange={(e) => set({ textAlign: e.target.value })}
          >
            {["left", "center", "right", "justify"].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Sel>
        </Field>
        <Field label="Transform">
          <Sel
            value={s.textTransform ?? "none"}
            onChange={(e) => set({ textTransform: e.target.value })}
          >
            {["none", "uppercase", "lowercase", "capitalize"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Sel>
        </Field>
        <Field label="Radius (px)">
          <Inp
            type="number"
            value={s.borderRadius ?? 0}
            onChange={(e) => set({ borderRadius: +e.target.value })}
          />
        </Field>
        <Field label="Padding">
          <Inp
            value={s.padding ?? "0px"}
            onChange={(e) => set({ padding: e.target.value })}
            placeholder="8px 16px"
          />
        </Field>
        <Field label="X (%)">
          <Inp
            type="number"
            min={0}
            max={100}
            value={el.positionX}
            onChange={(e) => onChange({ ...el, positionX: +e.target.value })}
          />
        </Field>
        <Field label="Y (%)">
          <Inp
            type="number"
            min={0}
            max={100}
            value={el.positionY}
            onChange={(e) => onChange({ ...el, positionY: +e.target.value })}
          />
        </Field>
        <Field label="Z-Index">
          <Inp
            type="number"
            value={el.zIndex}
            onChange={(e) => onChange({ ...el, zIndex: +e.target.value })}
          />
        </Field>
        <Field label="Width (px)">
          <Inp
            type="number"
            value={el.width ?? ""}
            placeholder="auto"
            onChange={(e) =>
              onChange({
                ...el,
                width: e.target.value ? +e.target.value : undefined,
              })
            }
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <Toggle
          value={el.isVisible}
          onChange={(v) => onChange({ ...el, isVisible: v })}
        />
        <span className="text-xs font-semibold text-slate-500">Visible</span>
      </label>
    </div>
  );
}
