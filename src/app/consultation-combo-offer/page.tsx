"use client";

import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { Plus, Trash2, Save } from "lucide-react";
import { SwitchOnSvg, SwitchOffSvg, EditSvg, CrossSvg } from "@/components/svgs/page";
import { Color } from "@/assets/colors";

// ─── SweetAlert2 Toast helper (non-blocking, top-right) ───────────────────────
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

const toastSuccess = (msg: string) => Toast.fire({ icon: "success", title: msg });
const toastError   = (msg: string) => Toast.fire({ icon: "error",   title: msg });
const toastWarning = (msg: string) => Toast.fire({ icon: "warning", title: msg });

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscountRule {
  minSlots: number | string;
  discountPercentage: number | string;
  isActive: boolean;
  label: string;
}

interface Astrologer {
  _id: string;
  astrologerName: string;
  email: string;
  phoneNumber: string;
  isBulkDiscountEnabled?: boolean;
  slotBulkDiscounts?: DiscountRule[];
}

type ApplyMode = "selected" | "all";

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ─── Reusable Rules Editor ────────────────────────────────────────────────────
interface RulesEditorProps {
  rules: DiscountRule[];
  ruleErrors: string[];
  editingIndex: number | null;
  onSetEditing: (i: number | null) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, field: keyof DiscountRule, value: any) => void;
  // new-rule form state
  newRule: DiscountRule;
  newRuleError: string;
  onNewRuleChange: (field: keyof DiscountRule, val: any) => void;
  onNewRuleAdd: () => void;
}

const RulesEditor: React.FC<RulesEditorProps> = ({
  rules, ruleErrors, onRemove, onChange,
  newRule, newRuleError, onNewRuleChange, onNewRuleAdd,
}) => (
  <div className="space-y-3">

    {/* ── Existing rules as chips ── */}
    {rules.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {rules.map((rule, i) => (
          <div
            key={i}
            className={`group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              rule.isActive
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-gray-100 border-gray-200 text-gray-400"
            }`}
          >
            <span>
              {rule.minSlots}+ slots &nbsp;→&nbsp;
              <span className="font-bold">{rule.discountPercentage}% off</span>
            </span>
            {rule.label && (
              <span className="text-xs opacity-60 hidden sm:inline">· {rule.label}</span>
            )}
            {/* Active dot */}
            <span className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? "bg-green-500" : "bg-gray-300"}`} />
            {/* Delete */}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="ml-0.5 text-gray-300 hover:text-red-500 transition-colors"
              title="Remove"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Validation error */}
            {ruleErrors[i] && (
              <span className="text-red-500 text-xs">{ruleErrors[i]}</span>
            )}
          </div>
        ))}
      </div>
    )}

    {/* ── Add new rule form ── */}
    <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add Discount Rule</p>
      <div className="flex flex-wrap gap-2 items-start">
        {/* Min Slots */}
        <input
          type="number"
          min={1}
          value={newRule.minSlots}
          onChange={(e) => onNewRuleChange("minSlots", e.target.value)}
          placeholder="Min slots (e.g. 3)"
          className={`w-36 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-400 bg-white ${
            newRuleError ? "border-red-400" : "border-gray-300"
          }`}
        />
        {/* Discount % */}
        <div className="relative">
          <input
            type="number"
            min={0}
            max={100}
            value={newRule.discountPercentage}
            onChange={(e) => onNewRuleChange("discountPercentage", e.target.value)}
            placeholder="Discount %"
            className={`w-32 px-3 py-1.5 pr-6 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-400 bg-white ${
              newRuleError ? "border-red-400" : "border-gray-300"
            }`}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">%</span>
        </div>
        {/* Label */}
        <input
          type="text"
          value={newRule.label}
          onChange={(e) => onNewRuleChange("label", e.target.value)}
          placeholder={`Label (optional)`}
          className="flex-1 min-w-[140px] px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-400 bg-white"
        />
        {/* Add button */}
        <button
          type="button"
          onClick={onNewRuleAdd}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      {newRuleError && (
        <p className="text-red-500 text-xs mt-1.5">{newRuleError}</p>
      )}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BulkSlotDiscountPage() {

  // ── List state ────────────────────────────────────────────────────────────
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [astroLoading, setAstroLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ── Bulk panel state ──────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [applyMode, setApplyMode] = useState<ApplyMode>("selected");
  const [rules, setRules] = useState<DiscountRule[]>([
    { minSlots: 3, discountPercentage: 10, isActive: true, label: "" },
  ]);
  const [isBulkDiscountEnabled, setIsBulkDiscountEnabled] = useState(true);
  const [ruleErrors, setRuleErrors] = useState<string[]>([""]);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(0);
  const [newRule, setNewRule] = useState<DiscountRule>({ minSlots: "", discountPercentage: "", isActive: true, label: "" });
  const [newRuleError, setNewRuleError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Edit popup state ──────────────────────────────────────────────────────
  const [editModal, setEditModal] = useState<{
    open: boolean;
    astrologer: Astrologer | null;
  }>({ open: false, astrologer: null });
  const [editRules, setEditRules] = useState<DiscountRule[]>([]);
  const [editRuleErrors, setEditRuleErrors] = useState<string[]>([]);
  const [editEnabled, setEditEnabled] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingEditRuleIndex, setEditingEditRuleIndex] = useState<number | null>(null);
  const [editNewRule, setEditNewRule] = useState<DiscountRule>({ minSlots: "", discountPercentage: "", isActive: true, label: "" });
  const [editNewRuleError, setEditNewRuleError] = useState("");

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAstrologers = async () => {
    try {
      setAstroLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/get-all-astrologers`
      );
      if (!res.ok) throw new Error("Failed to fetch astrologers");
      const data = await res.json();

      setAstrologers(
        (data.astrologers || []).map((a: any) => ({
          _id: a._id,
          astrologerName: a.astrologerName,
          email: a.email,
          phoneNumber: a.phoneNumber,
          isBulkDiscountEnabled: a.isBulkDiscountEnabled ?? false,
          slotBulkDiscounts: a.slotBulkDiscounts ?? [],
        }))
      );
    } catch (e) {
      console.error(e);
      toastError("Failed to load astrologers");
    } finally {
      setAstroLoading(false);
    }
  };

  useEffect(() => { fetchAstrologers(); }, []);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredAstrologers = useMemo(() => {
    if (!searchText) return astrologers;
    const q = searchText.toLowerCase();
    return astrologers.filter(
      (a) =>
        a.astrologerName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phoneNumber?.toLowerCase().includes(q)
    );
  }, [astrologers, searchText]);

  // ── Checkbox selection ────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    selectedIds.size === filteredAstrologers.length
      ? setSelectedIds(new Set())
      : setSelectedIds(new Set(filteredAstrologers.map((a) => a._id)));

  const allSelected =
    filteredAstrologers.length > 0 &&
    selectedIds.size === filteredAstrologers.length;

  // ── Bulk panel rule management ────────────────────────────────────────────
  const addRule = () => {
    setRules((p) => { 
      setEditingRuleIndex(p.length); 
      return [...p, { minSlots: "", discountPercentage: "", isActive: true, label: "" }];
    });
    setRuleErrors((p) => [...p, ""]);
  };
  const removeRule = (i: number) => {
    setRules((p) => p.filter((_, idx) => idx !== i));
    setRuleErrors((p) => p.filter((_, idx) => idx !== i));
  };
  const updateRule = (i: number, field: keyof DiscountRule, value: any) =>
    setRules((p) => p.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const handleAddNewRule = () => {
    const slots = Number(newRule.minSlots);
    const disc = Number(newRule.discountPercentage);
    if (!newRule.minSlots || isNaN(slots) || slots < 1) { setNewRuleError("Min slots must be ≥ 1"); return; }
    if (newRule.discountPercentage === "" || isNaN(disc) || disc < 0 || disc > 100) { setNewRuleError("Discount must be 0–100"); return; }
    if (rules.some((r) => Number(r.minSlots) === slots)) { setNewRuleError(`A rule for ${slots} slots already exists`); return; }
    setNewRuleError("");
    setRules((p) => [...p, { ...newRule, minSlots: slots, discountPercentage: disc }].sort((a, b) => Number(a.minSlots) - Number(b.minSlots)));
    setRuleErrors((p) => [...p, ""]);
    setNewRule({ minSlots: "", discountPercentage: "", isActive: true, label: "" });
  };

  // ── Generic validator ─────────────────────────────────────────────────────
  const validate = (
    rulesList: DiscountRule[],
    setErrors: React.Dispatch<React.SetStateAction<string[]>>
  ): boolean => {
    const errors = rulesList.map((r) => {
      const slots = Number(r.minSlots);
      const disc = Number(r.discountPercentage);
      if (!r.minSlots || isNaN(slots) || slots < 1) return "Min slots must be ≥ 1";
      if (r.discountPercentage === "" || isNaN(disc) || disc < 0 || disc > 100)
        return "Discount must be 0–100";
      return "";
    });

    const slotValues = rulesList.map((r) => Number(r.minSlots));
    if (slotValues.length !== new Set(slotValues).size) {
      toastError("Duplicate 'Min Slots' values — each must be unique");
      return false;
    }

    setErrors(errors);
    return errors.every((e) => e === "");
  };

  // ── Bulk submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (applyMode === "selected" && selectedIds.size === 0) {
      toastWarning("Select at least one astrologer or choose Apply to All");
      return;
    }
    if (!validate(rules, setRuleErrors)) return;

    // ── SweetAlert2 confirmation before bulk apply ────────────────────────
    const target =
      applyMode === "all"
        ? `all <b>${astrologers.length}</b> astrologers`
        : `<b>${selectedIds.size}</b> selected astrologer(s)`;

    const confirm = await Swal.fire({
      title: "Apply Bulk Discounts?",
      html: `This will update discount rules for ${target}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Apply",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    const payload: any = {
      applyToAll: applyMode === "all",
      isBulkDiscountEnabled,
      slotBulkDiscounts: rules.map((r) => ({
        minSlots: Number(r.minSlots),
        discountPercentage: Number(r.discountPercentage),
        isActive: r.isActive,
        label: r.label,
      })),
    };
    if (applyMode === "selected") payload.astrologerIds = Array.from(selectedIds);

    try {
      setSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-slot-discounts/update`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toastSuccess(`Bulk discounts applied to ${data.data.modifiedCount} astrologer(s)`);
      await fetchAstrologers();
      setSelectedIds(new Set());
    } catch (e: any) {
      toastError(e?.message || "Failed to apply bulk discounts");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Per-row toggle ────────────────────────────────────────────────────────
  const handleRowToggle = async (astro: Astrologer) => {
    const nextValue = !astro.isBulkDiscountEnabled;

    // ── SweetAlert2 confirmation for toggle ───────────────────────────────
    const action = nextValue ? "enable" : "disable";
    const confirm = await Swal.fire({
      title: `${nextValue ? "Enable" : "Disable"} Bulk Discount?`,
      html: `Are you sure you want to <b>${action}</b> bulk discount for <b>${astro.astrologerName}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${nextValue ? "Enable" : "Disable"}`,
      cancelButtonText: "Cancel",
      confirmButtonColor: nextValue ? "#16a34a" : "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    // Optimistic update
    setAstrologers((prev) =>
      prev.map((a) => (a._id === astro._id ? { ...a, isBulkDiscountEnabled: nextValue } : a))
    );

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-slot-discounts/toggle`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ astrologerIds: [astro._id], applyToAll: false, isBulkDiscountEnabled: nextValue }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toastSuccess(`Bulk discount ${nextValue ? "enabled" : "disabled"} for ${astro.astrologerName}`);
    } catch (e: any) {
      // Rollback on failure
      setAstrologers((prev) =>
        prev.map((a) =>
          a._id === astro._id ? { ...a, isBulkDiscountEnabled: astro.isBulkDiscountEnabled } : a
        )
      );
      toastError(e?.message || "Failed to toggle");
    }
  };

  // ── Open/close edit popup ─────────────────────────────────────────────────
  const openEditModal = (astro: Astrologer) => {
    const existing =
      astro.slotBulkDiscounts && astro.slotBulkDiscounts.length > 0
        ? astro.slotBulkDiscounts.map((r) => ({
            minSlots: r.minSlots,
            discountPercentage: r.discountPercentage,
            isActive: r.isActive,
            label: r.label || "",
          }))
        : [{ minSlots: "", discountPercentage: "", isActive: true, label: "" }];

    setEditRules(existing);
    setEditRuleErrors(existing.map(() => ""));
    setEditEnabled(astro.isBulkDiscountEnabled ?? false);
    setEditingEditRuleIndex(null);
    setEditModal({ open: true, astrologer: astro });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, astrologer: null });
    setEditRules([]);
    setEditRuleErrors([]);
    setEditNewRule({ minSlots: "", discountPercentage: "", isActive: true, label: "" });
    setEditNewRuleError("");
  };

  // ── Edit popup rule management ────────────────────────────────────────────
  const addEditRule = () => {
    setEditRules((p) => {
      setEditingEditRuleIndex(p.length);
      return [...p, { minSlots: "", discountPercentage: "", isActive: true, label: "" }];
    });
    setEditRuleErrors((p) => [...p, ""]);
  };
  const removeEditRule = (i: number) => {
    setEditRules((p) => p.filter((_, idx) => idx !== i));
    setEditRuleErrors((p) => p.filter((_, idx) => idx !== i));
  };
  const updateEditRule = (i: number, field: keyof DiscountRule, value: any) =>
    setEditRules((p) => p.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const handleAddEditNewRule = () => {
    const slots = Number(editNewRule.minSlots);
    const disc = Number(editNewRule.discountPercentage);
    if (!editNewRule.minSlots || isNaN(slots) || slots < 1) { setEditNewRuleError("Min slots must be ≥ 1"); return; }
    if (editNewRule.discountPercentage === "" || isNaN(disc) || disc < 0 || disc > 100) { setEditNewRuleError("Discount must be 0–100"); return; }
    if (editRules.some((r) => Number(r.minSlots) === slots)) { setEditNewRuleError(`A rule for ${slots} slots already exists`); return; }
    setEditNewRuleError("");
    setEditRules((p) => [...p, { ...editNewRule, minSlots: slots, discountPercentage: disc }].sort((a, b) => Number(a.minSlots) - Number(b.minSlots)));
    setEditRuleErrors((p) => [...p, ""]);
    setEditNewRule({ minSlots: "", discountPercentage: "", isActive: true, label: "" });
  };

  // ── Edit popup save ───────────────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editModal.astrologer) return;
    if (!validate(editRules, setEditRuleErrors)) return;

    try {
      setEditSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-slot-discounts/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applyToAll: false,
            astrologerIds: [editModal.astrologer._id],
            isBulkDiscountEnabled: editEnabled,
            slotBulkDiscounts: editRules.map((r) => ({
              minSlots: Number(r.minSlots),
              discountPercentage: Number(r.discountPercentage),
              isActive: r.isActive,
              label: r.label,
            })),
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toastSuccess(`Discount rules updated for ${editModal.astrologer.astrologerName}`);
      await fetchAstrologers();
      closeEditModal();
    } catch (e: any) {
      toastError(e?.message || "Failed to save changes");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Bulk Slot Discount Settings</h2>
            <p className="text-sm text-gray-600">
              Define slot-count-based discounts and apply them to selected or all astrologers.
            </p>
          </div>

          {/* ── Bulk Apply Panel ── */}
          <div className="border border-gray-200 rounded-lg p-5 mb-6 space-y-5">
            <RulesEditor
              rules={rules}
              ruleErrors={ruleErrors}
              editingIndex={editingRuleIndex}
              onSetEditing={setEditingRuleIndex}
              onAdd={addRule}
              onRemove={removeRule}
              onChange={updateRule}
              newRule={newRule}
              newRuleError={newRuleError}
              onNewRuleChange={(f, v) => { setNewRule((p) => ({ ...p, [f]: v })); setNewRuleError(""); }}
              onNewRuleAdd={handleAddNewRule}
            />

            <hr className="border-gray-200" />

            {/* Apply mode */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Apply To</p>
              <div className="flex gap-3">
                {(["selected", "all"] as ApplyMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setApplyMode(mode)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium border-2 transition-colors ${
                      applyMode === mode
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {mode === "selected"
                      ? `Selected Astrologers${selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}`
                      : `All Astrologers (${astrologers.length})`}
                  </button>
                ))}
              </div>
              {applyMode === "selected" && selectedIds.size === 0 && (
                <p className="text-xs text-amber-600">Select astrologers from the table below.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                {submitting ? <Spinner /> : <Save className="w-4 h-4" />}
                {submitting ? "Applying..." : "Apply Discounts"}
              </button>
            </div>
          </div>

          {/* ── Astrologers Table ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Astrologers</h3>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name, email, mobile..."
                className="w-64 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-[480px] overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2">
                        {applyMode === "selected" && (
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            className="accent-red-600 w-4 h-4"
                          />
                        )}
                      </th>
                      {["S. No.", "Name", "Email", "Mobile", "Bulk Discount", "Action"].map(
                        (h) => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {astroLoading ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-gray-500 text-sm">
                          Loading astrologers...
                        </td>
                      </tr>
                    ) : filteredAstrologers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-gray-500 text-sm">
                          No astrologers found.
                        </td>
                      </tr>
                    ) : (
                      filteredAstrologers.map((astro, index) => (
                        <tr
                          key={astro._id}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            selectedIds.has(astro._id) ? "bg-red-50" : ""
                          }`}
                        >
                          <td className="px-3 py-2">
                            {applyMode === "selected" && (
                              <input
                                type="checkbox"
                                checked={selectedIds.has(astro._id)}
                                onChange={() => toggleSelect(astro._id)}
                                className="accent-red-600 w-4 h-4"
                              />
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700">{index + 1}</td>
                          <td className="px-3 py-2 text-xs font-medium text-gray-900">{astro.astrologerName}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{astro.email || "N/A"}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{astro.phoneNumber || "N/A"}</td>

                          {/* Toggle */}
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRowToggle(astro)}
                              className="inline-flex items-center justify-center"
                            >
                              {astro.isBulkDiscountEnabled ? <SwitchOnSvg /> : <SwitchOffSvg />}
                            </button>
                          </td>

                          {/* Edit icon — opens popup */}
                          <td className="px-3 py-2 text-center">
                            <div
                              onClick={() => openEditModal(astro)}
                              className="cursor-pointer inline-flex items-center justify-center"
                              title="Edit discount rules"
                            >
                              <EditSvg />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Toggle to enable/disable bulk discounts per astrologer. Click the edit icon to
              view and modify individual discount rules.
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          Edit Popup — individual astrologer
      ════════════════════════════════════════ */}
      {editModal.open && editModal.astrologer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-medium" style={{ color: Color.black }}>
                    Edit Discount Rules
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {editModal.astrologer.astrologerName}
                  </p>
                </div>
                <div onClick={closeEditModal} className="cursor-pointer">
                  <CrossSvg />
                </div>
              </div>

              {/* Enable / Disable toggle */}
              <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bulk Discount</p>
                  <p className="text-xs text-gray-500">
                    Enable or disable all discount rules for this astrologer
                  </p>
                </div>
                <button type="button" onClick={() => setEditEnabled((v) => !v)}>
                  {editEnabled ? <SwitchOnSvg /> : <SwitchOffSvg />}
                </button>
              </div>

              {/* Rules editor */}
              <RulesEditor
                rules={editRules}
                ruleErrors={editRuleErrors}
                editingIndex={editingEditRuleIndex}
                onSetEditing={setEditingEditRuleIndex}
                onAdd={addEditRule}
                onRemove={removeEditRule}
                onChange={updateEditRule}
                newRule={editNewRule}
                newRuleError={editNewRuleError}
                onNewRuleChange={(f, v) => { setEditNewRule((p) => ({ ...p, [f]: v })); setEditNewRuleError(""); }}
                onNewRuleAdd={handleAddEditNewRule}
              />

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-2 border-2 border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSave}
                  disabled={editSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                  style={{ backgroundColor: Color.primary }}
                >
                  {editSubmitting ? <Spinner /> : <Save className="w-4 h-4" />}
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}