'use client';
import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const SCREENS = [
  { label: "Home", value: "" },
  { label: "Gemstones", value: "pages/gemstones" },
  { label: "Gemstone Calculator", value: "pages/gemstone-calculator" },
  { label: "Rudraksha Calculator", value: "pages/rudraksha-calculator" },
  { label: "Gemstone Consultation", value: "pages/gemstones-consultation" },
  { label: "Moolank Calculator", value: "pages/moolank-calculator" },
  { label: "Ratti Calculator", value: "pages/ratti-calculator" },
  { label: "Bracelet Calculator", value: "pages/bracelet-calculator" },
  { label: "About Us", value: "pages/about-us" },
];

interface FormState {
  title: string;
  body: string;
  screen: string;
}

interface FormErrors {
  title: string;
  body: string;
}

function BroadcastNotificationContent() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ title: "", body: "", screen: "" });
  const [errors, setErrors] = useState<FormErrors>({ title: "", body: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors: FormErrors = { title: "", body: "" };

    if (!form.title.trim()) {
      newErrors.title = "Please enter a notification title";
      isValid = false;
    }
    if (!form.body.trim()) {
      newErrors.body = "Please enter a notification message";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: "Send to all devices?",
      text: "This will send a push notification to all registered Android users.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Yes, Send",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const payload: { title: string; body: string; data?: { screen: string } } = {
        title: form.title,
        body: form.body,
      };
      if (form.screen) {
        payload.data = { screen: form.screen };
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shopify/notify/broadcast`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Sent!",
          text: `Notification sent to ${result.sent} device(s)`,
          timer: 2000,
          showConfirmButton: false,
        });
        setForm({ title: "", body: "", screen: "" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: result.message || "Failed to send notification",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error!",
        text: "Please check your connection and try again.",
        confirmButtonColor: "#d33",
      });
      console.error("Broadcast error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 ">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-semibold text-gray-800">
            Broadcast Notification
          </div>
          <button
            onClick={() => router.back()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition duration-200"
          >
            Back
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-700">
          This will send a push notification to <strong>all registered devices</strong>. Use with care.
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Flash Sale 🔥"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => handleChange("body", e.target.value)}
              rows={4}
              placeholder="e.g. 50% off all gemstones today only!"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.body ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.body && (
              <p className="text-red-500 text-sm">{errors.body}</p>
            )}
          </div>

          {/* Screen (optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Navigate to Screen{" "}
              <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <select
              value={form.screen}
              onChange={(e) => handleChange("screen", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {SCREENS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Tapping the notification will open this screen in the app.
            </p>
          </div>

          {/* Preview */}
          {(form.title || form.body) && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Preview</p>
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex gap-3 items-start">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500 text-xs font-bold flex-shrink-0">
                  LCA
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{form.title || "Notification title"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{form.body || "Notification message"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-start pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg cursor-pointer font-medium transition duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                "Send to All Devices"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const BroadcastNotification = () => (
  <Suspense
    fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    }
  >
    <BroadcastNotificationContent />
  </Suspense>
);

export default BroadcastNotification;