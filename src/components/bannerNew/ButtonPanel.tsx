/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  type ButtonElement
} from "@/lib/api/banners";
import {
  MousePointer,
  Trash2
} from "lucide-react";
import { ColorRow, Field, Inp, Sel, Toggle } from "./Helper";
export function ButtonPanel({
  el,
  onChange,
  onDelete,
}: {
  el: ButtonElement;
  onChange: (u: ButtonElement) => void;
  onDelete: () => void;
}) {
  const s = el.style;
  const set = (p: Partial<typeof s>) =>
    onChange({ ...el, style: { ...s, ...p } });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-sky-100 rounded-lg flex items-center justify-center">
            <MousePointer className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            Button Element
          </span>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <Field label="Label">
        <Inp
          value={el.label}
          onChange={(e) => onChange({ ...el, label: e.target.value })}
        />
      </Field>
      <Field label="Link (href)">
        <Inp
          value={el.href}
          onChange={(e) => onChange({ ...el, href: e.target.value })}
          placeholder="/page or https://..."
        />
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <Toggle
          value={el.isExternal}
          onChange={(v) => onChange({ ...el, isExternal: v })}
        />
        <span className="text-xs font-semibold text-slate-500">
          Open in new tab
        </span>
      </label>
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
            value={s.fontWeight ?? "600"}
            onChange={(e) => set({ fontWeight: e.target.value })}
          >
            {["300", "400", "500", "600", "700", "800"].map((w) => (
              <option key={w}>{w}</option>
            ))}
          </Sel>
        </Field>
      </div>
      <ColorRow
        label="Background"
        value={s.backgroundColor ?? "#4f46e5"}
        onChange={(v) => set({ backgroundColor: v })}
      />
      <ColorRow
        label="Text Color"
        value={s.textColor ?? "#ffffff"}
        onChange={(v) => set({ textColor: v })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Radius (px)">
          <Inp
            type="number"
            value={s.borderRadius ?? 6}
            onChange={(e) => set({ borderRadius: +e.target.value })}
          />
        </Field>
        <Field label="Height (px)">
          <Inp
            type="number"
            value={s.height ?? 44}
            onChange={(e) => set({ height: +e.target.value })}
          />
        </Field>
        <Field label="Width (px)">
          <Inp
            type="number"
            value={s.width ?? ""}
            placeholder="auto"
            onChange={(e) =>
              set({ width: e.target.value ? +e.target.value : undefined })
            }
          />
        </Field>
        <Field label="Opacity">
          <Inp
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={parseFloat((s.opacity ?? 1).toFixed(2))}
            onChange={(e) =>
              set({ opacity: Math.min(1, Math.max(0, +e.target.value)) })
            }
          />
        </Field>
        <Field label="Pad Top">
          <Inp
            type="number"
            value={s.paddingTop ?? 10}
            onChange={(e) => set({ paddingTop: +e.target.value })}
          />
        </Field>
        <Field label="Pad Right">
          <Inp
            type="number"
            value={s.paddingRight ?? 24}
            onChange={(e) => set({ paddingRight: +e.target.value })}
          />
        </Field>
        <Field label="Pad Bottom">
          <Inp
            type="number"
            value={s.paddingBottom ?? 10}
            onChange={(e) => set({ paddingBottom: +e.target.value })}
          />
        </Field>
        <Field label="Pad Left">
          <Inp
            type="number"
            value={s.paddingLeft ?? 24}
            onChange={(e) => set({ paddingLeft: +e.target.value })}
          />
        </Field>
        <Field label="Border W">
          <Inp
            type="number"
            value={s.borderWidth ?? 0}
            onChange={(e) => set({ borderWidth: +e.target.value })}
          />
        </Field>
        <Field label="Border Color">
          <Inp
            value={s.borderColor ?? "#4f46e5"}
            onChange={(e) => set({ borderColor: e.target.value })}
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