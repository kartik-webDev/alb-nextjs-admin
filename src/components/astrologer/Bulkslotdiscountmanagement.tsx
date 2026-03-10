// components/astrologer/BulkSlotDiscountManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Save, Tag, Info } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscountRule {
  _id?: string;
  minSlots: number | string;
  discountPercentage: number | string;
  isActive: boolean;
  label: string;
}

interface BulkSlotDiscountManagementProps {
  astrologerId: string;
  onUpdate?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BulkSlotDiscountManagement({
  astrologerId,
  onUpdate,
}: BulkSlotDiscountManagementProps) {

  const [isBulkDiscountEnabled, setIsBulkDiscountEnabled] = useState(false);
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // For adding a new rule
  const [newRule, setNewRule] = useState<DiscountRule>({
    minSlots: '',
    discountPercentage: '',
    isActive: true,
    label: '',
  });
  const [newRuleError, setNewRuleError] = useState('');
  const [adding, setAdding] = useState(false);

  // ── Fetch existing data ─────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-slot-discounts/${astrologerId}`
      );
      const data = await res.json();

      if (data.success && data.data) {
        setIsBulkDiscountEnabled(data.data.isBulkDiscountEnabled ?? false);
        setRules(
          (data.data.slotBulkDiscounts || []).sort(
            (a: DiscountRule, b: DiscountRule) =>
              Number(a.minSlots) - Number(b.minSlots)
          )
        );
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load bulk discount settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [astrologerId]);

  // ── Save master toggle ──────────────────────────────────────────────────────
  const handleToggleSave = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-slot-discounts/toggle`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            astrologerIds: [astrologerId],
            applyToAll: false,
            isBulkDiscountEnabled,
          }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(
        `Bulk discount ${isBulkDiscountEnabled ? 'enabled' : 'disabled'} successfully`
      );
      onUpdate?.();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Validate a single rule ──────────────────────────────────────────────────
  const validateNewRule = (): boolean => {
    const slots = Number(newRule.minSlots);
    const disc = Number(newRule.discountPercentage);

    if (!newRule.minSlots || isNaN(slots) || slots < 1) {
      setNewRuleError('Min slots must be ≥ 1');
      return false;
    }
    if (newRule.discountPercentage === '' || isNaN(disc) || disc < 0 || disc > 100) {
      setNewRuleError('Discount must be between 0 and 100');
      return false;
    }

    // Check duplicate
    const exists = rules.some((r) => Number(r.minSlots) === slots);
    if (exists) {
      setNewRuleError(`A rule for ${slots} slots already exists`);
      return false;
    }

    setNewRuleError('');
    return true;
  };

  // ── Add new rule ────────────────────────────────────────────────────────────
  const handleAddRule = async () => {
    if (!validateNewRule()) return;

    const updatedRules = [
      ...rules.map((r) => ({
        minSlots: Number(r.minSlots),
        discountPercentage: Number(r.discountPercentage),
        isActive: r.isActive,
        label: r.label,
      })),
      {
        minSlots: Number(newRule.minSlots),
        discountPercentage: Number(newRule.discountPercentage),
        isActive: newRule.isActive,
        label: newRule.label,
      },
    ].sort((a, b) => a.minSlots - b.minSlots);

    try {
      setAdding(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-slot-discounts/update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applyToAll: false,
            astrologerIds: [astrologerId],
            isBulkDiscountEnabled: true, // auto-enable when adding a rule
            slotBulkDiscounts: updatedRules,
          }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success('Discount rule added successfully');
      setNewRule({ minSlots: '', discountPercentage: '', isActive: true, label: '' });
      await fetchData();
      onUpdate?.();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add rule');
    } finally {
      setAdding(false);
    }
  };

  // ── Delete a rule ───────────────────────────────────────────────────────────
  const handleDeleteRule = async (minSlots: number | string) => {
    const updatedRules = rules
      .filter((r) => Number(r.minSlots) !== Number(minSlots))
      .map((r) => ({
        minSlots: Number(r.minSlots),
        discountPercentage: Number(r.discountPercentage),
        isActive: r.isActive,
        label: r.label,
      }));

    try {
      setSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-slot-discounts/update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applyToAll: false,
            astrologerIds: [astrologerId],
            isBulkDiscountEnabled: updatedRules.length > 0 ? isBulkDiscountEnabled : false,
            slotBulkDiscounts: updatedRules,
          }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success('Discount rule deleted');
      await fetchData();
      onUpdate?.();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete rule');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle individual rule active/inactive ──────────────────────────────────
  const handleToggleRule = async (minSlots: number | string) => {
    const updatedRules = rules.map((r) => ({
      minSlots: Number(r.minSlots),
      discountPercentage: Number(r.discountPercentage),
      isActive: Number(r.minSlots) === Number(minSlots) ? !r.isActive : r.isActive,
      label: r.label,
    }));

    try {
      setSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-slot-discounts/update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applyToAll: false,
            astrologerIds: [astrologerId],
            isBulkDiscountEnabled,
            slotBulkDiscounts: updatedRules,
          }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      await fetchData();
      onUpdate?.();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update rule');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Best discount (highest %) among active rules ────────────────────────────
  const bestDiscount =
    rules.filter((r) => r.isActive).length > 0
      ? Math.max(...rules.filter((r) => r.isActive).map((r) => Number(r.discountPercentage)))
      : null;

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-200 border-t-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Slot Discount</h2>
        <p className="text-gray-600 text-sm mt-0.5">
          Offer discounts when customers book multiple slots at once
        </p>
      </div>

      {/* ── Enable / Disable Card ── */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Enabled option */}
            <label
              className={`flex items-start gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-red-50 ${
                isBulkDiscountEnabled
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <input
                type="radio"
                name="bulkMode"
                checked={isBulkDiscountEnabled}
                onChange={() => setIsBulkDiscountEnabled(true)}
                className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm mb-0.5">Enabled</div>
                <div className="text-xs text-red-600 font-bold">
                  {rules.filter((r) => r.isActive).length} active rule(s)
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Discounts applied on bulk booking</div>
              </div>
            </label>

            {/* Disabled option */}
            <label
              className={`flex items-start gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-red-50 ${
                !isBulkDiscountEnabled
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <input
                type="radio"
                name="bulkMode"
                checked={!isBulkDiscountEnabled}
                onChange={() => setIsBulkDiscountEnabled(false)}
                className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm mb-0.5">Disabled</div>
                <div className="text-xs text-gray-400 font-bold">No discount</div>
                <div className="text-xs text-gray-500 mt-0.5">Standard pricing for all bookings</div>
              </div>
            </label>
          </div>

          {/* Save button */}
          <div className="md:w-40 flex justify-center items-center">
            <button
              type="button"
              onClick={handleToggleSave}
              disabled={submitting}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Rules Section ── */}
      <div className="bg-white rounded-lg border border-red-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Discount Rules</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Define how much discount to give based on number of slots booked
            </p>
          </div>
        </div>

        {/* Best discount badge */}
        {bestDiscount !== null && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-xs text-green-800">
              Best active discount:{' '}
              <span className="font-bold">{bestDiscount}% off</span>
            </p>
          </div>
        )}

        {/* Existing rules list */}
        {rules.length > 0 ? (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {rules.map((rule, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  rule.isActive
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Active dot */}
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      rule.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 text-sm">
                        {rule.minSlots}+ slots
                      </span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="font-bold text-red-600 text-sm">
                        {rule.discountPercentage}% off
                      </span>
                    </div>
                    {rule.label ? (
                      <p className="text-xs text-gray-500 truncate">{rule.label}</p>
                    ) : null}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {/* Toggle active */}
                  <button
                    type="button"
                    onClick={() => handleToggleRule(rule.minSlots)}
                    disabled={submitting}
                    title={rule.isActive ? 'Deactivate' : 'Activate'}
                    className={`p-1 rounded text-xs font-medium transition-colors ${
                      rule.isActive
                        ? 'text-green-600 hover:bg-green-100'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {rule.isActive ? 'ON' : 'OFF'}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.minSlots)}
                    disabled={submitting}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4">
            <Info className="w-7 h-7 text-gray-400 mx-auto mb-1" />
            <p className="text-gray-600 text-sm font-medium">No discount rules yet</p>
            <p className="text-gray-400 text-xs mt-0.5">Add your first rule below</p>
          </div>
        )}

        {/* Add new rule form */}
        <div className="bg-gray-100 p-3 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-xs font-medium text-gray-700 mb-2">Add New Discount Rule</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

            {/* Min Slots */}
            <div>
              <input
                type="number"
                min={1}
                value={newRule.minSlots}
                onChange={(e) => {
                  setNewRule({ ...newRule, minSlots: e.target.value });
                  setNewRuleError('');
                }}
                placeholder="Min Slots (e.g. 3)"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm ${
                  newRuleError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>

            {/* Discount % */}
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={newRule.discountPercentage}
                onChange={(e) => {
                  setNewRule({ ...newRule, discountPercentage: e.target.value });
                  setNewRuleError('');
                }}
                placeholder="Discount % (e.g. 10)"
                className={`w-full px-3 py-2 pr-7 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm ${
                  newRuleError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="absolute right-2.5 top-2.5 text-gray-400 text-xs">%</span>
            </div>

            {/* Label */}
            <div>
              <input
                type="text"
                value={newRule.label}
                onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
                placeholder={`Label (optional)`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>

            {/* Add button */}
            <button
              type="button"
              onClick={handleAddRule}
              disabled={adding}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {adding ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Rule
                </>
              )}
            </button>
          </div>

          {newRuleError && (
            <p className="text-red-500 text-xs mt-1.5">{newRuleError}</p>
          )}
        </div>
      </div>
    </div>
  );
}