'use client';
import React, { useState, useEffect, Suspense } from "react";
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

interface Device {
  _id: string;
  deviceId: string;
  expoPushToken: string;
  platform: string;
  updatedAt: string;
}

interface FormState {
  deviceId: string;
  title: string;
  body: string;
  screen: string;
}

interface FormErrors {
  deviceId: string;
  title: string;
  body: string;
}

function SendToDeviceContent() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [form, setForm] = useState<FormState>({ deviceId: "", title: "", body: "", screen: "" });
  const [errors, setErrors] = useState<FormErrors>({ deviceId: "", title: "", body: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shopify/devices`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        if (response.ok) {
          const data = await response.json();
          setDevices(data.devices || []);
        }
      } catch (error) {
        console.error("Failed to fetch devices:", error);
      } finally {
        setLoadingDevices(false);
      }
    };
    fetchDevices();
  }, []);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors: FormErrors = { deviceId: "", title: "", body: "" };

    if (!form.deviceId.trim()) {
      newErrors.deviceId = "Please select or enter a device ID";
      isValid = false;
    }
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

    setLoading(true);
    try {
      const payload: { deviceId: string; title: string; body: string; data?: { screen: string } } = {
        deviceId: form.deviceId,
        title: form.title,
        body: form.body,
      };
      if (form.screen) {
        payload.data = { screen: form.screen };
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shopify/notify/device`,
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
          text: "Notification sent to device successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        setForm((prev) => ({ ...prev, title: "", body: "", screen: "" }));
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
      console.error("Send to device error:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDevice = devices.find((d) => d.deviceId === form.deviceId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-semibold text-gray-800">
            Send to Device
          </div>
          <button
            onClick={() => router.back()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition duration-200"
          >
            Back
          </button>
        </div>

        <div className="space-y-5">
          {/* Device selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Device <span className="text-red-500">*</span>
            </label>
            {loadingDevices ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Loading devices...
              </div>
            ) : devices.length > 0 ? (
              <select
                value={form.deviceId}
                onChange={(e) => handleChange("deviceId", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                  errors.deviceId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a device</option>
                {devices.map((d) => (
                  <option key={d._id} value={d.deviceId}>
                    {d.deviceId.slice(0, 20)}... — {d.platform} — {new Date(d.updatedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.deviceId}
                onChange={(e) => handleChange("deviceId", e.target.value)}
                placeholder="Enter device ID manually"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.deviceId ? "border-red-500" : "border-gray-300"
                }`}
              />
            )}
            {errors.deviceId && (
              <p className="text-red-500 text-sm">{errors.deviceId}</p>
            )}
            {selectedDevice && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                <p><span className="font-medium">Platform:</span> {selectedDevice.platform}</p>
                <p><span className="font-medium">Token:</span> {selectedDevice.expoPushToken.slice(0, 40)}...</p>
                <p><span className="font-medium">Last seen:</span> {new Date(selectedDevice.updatedAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Your order is confirmed!"
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
              placeholder="e.g. Your gemstone order has been shipped!"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.body ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.body && (
              <p className="text-red-500 text-sm">{errors.body}</p>
            )}
          </div>

          {/* Screen */}
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
                "Send Notification"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SendToDevice = () => (
  <Suspense
    fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    }
  >
    <SendToDeviceContent />
  </Suspense>
);

export default SendToDevice;