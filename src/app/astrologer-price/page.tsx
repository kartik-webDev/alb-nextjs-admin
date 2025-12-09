"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Color } from "@/assets/colors";
import { CrossSvg } from "@/components/svgs/page";

interface GlobalOfferPrice {
  _id?: string;
  OfferPrice: number;
}

export default function GlobalOfferPricePage() {
  const [globalOfferPrice, setGlobalOfferPrice] = useState<GlobalOfferPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [priceError, setPriceError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch current global offer price
  const fetchGlobalOfferPrice = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/get-offer-price`
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      console.log("Fetched data:", data);
      
      if (data.success && data.data) {
        setGlobalOfferPrice(data.data);
        setPriceInput(data.data.OfferPrice.toString());
      }
    } catch (e) {
      console.error("Error fetching global offer price:", e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load global offer price",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalOfferPrice();
  }, []);

  // Open/Close Modal
  const openModal = () => {
    setShowModal(true);
    setPriceError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setPriceInput(globalOfferPrice?.OfferPrice.toString() || "");
    setPriceError("");
  };

  // Validate Price Input
  const validatePrice = () => {
    const price = Number(priceInput);

    if (!priceInput) {
      setPriceError("Please enter a price");
      return false;
    }

    if (isNaN(price) || price <= 0) {
      setPriceError("Please enter a valid price greater than 0");
      return false;
    }

    setPriceError("");
    return true;
  };

  // Submit Price
  const submitPrice = async () => {
    if (!validatePrice()) return;

    const result = await Swal.fire({
      title: "Update Global Offer Price?",
      html: `
        <p>Set global first-time offer price to:</p>
        <p class="text-3xl font-bold text-red-600 my-3">₹${priceInput}</p>
        <p class="text-sm text-gray-600">This will apply to all new customers for 15-minute consultations</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);

      Swal.fire({
        title: "Updating...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/offer-price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            OfferPrice: Number(priceInput),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();

      if (data.success) {
        // Refresh data after update
        await fetchGlobalOfferPrice();
        closeModal();

        Swal.fire({
          icon: "success",
          title: "Success!",
          html: `
            <p>Global offer price updated to</p>
            <p class="text-3xl font-bold text-green-600 my-2">₹${priceInput}</p>
          `,
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update global offer price",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Global First-Time Offer Price
          </h1>
          <p className="text-gray-600">
            Manage the special offer price shown to all new customers for 15-minute consultations
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Content */}
          <div className="p-6">
            {globalOfferPrice ? (
              <div className="space-y-6">
                {/* Simple Price Display */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Offer Price</p>
                    <div className="text-4xl font-bold text-red-600">
                      ₹{globalOfferPrice.OfferPrice}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">for 15-minute consultation</p>
                  </div>
                  <button
                    onClick={openModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    Edit Price
                  </button>
                </div>

                {/* Info Boxes */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Who Sees This Price?
                    </h3>
                    <p className="text-sm text-blue-800">
                      All new customers (first-time users) for astrologers who have enabled
                      "Use Global First-Time Offer Price" in their settings
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Duration
                    </h3>
                    <p className="text-sm text-purple-800">
                      This price applies only to 15-minute consultations. Other durations will
                      use their respective pricing
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Global Offer Price Set
                </h3>
                <p className="text-gray-500 mb-6">
                  Set a global offer price to attract new customers
                </p>
                <button
                  onClick={openModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Set Global Price
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Important Notes
          </h3>
          <ul className="text-sm text-amber-800 space-y-1 ml-7">
            <li>• This price only applies to NEW customers (first-time consultations)</li>
            <li>• Only works for astrologers who have enabled global pricing in their profile</li>
            <li>• Astrologers with custom first-time pricing will use their own prices instead</li>
            <li>• Changes take effect immediately for all applicable astrologers</li>
          </ul>
        </div>
      </div>

      {/* Edit Price Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {globalOfferPrice ? "Update" : "Set"} Global Offer Price
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Price Input */}
              <div className="mb-6">
                <label
                  htmlFor="offerPrice"
                  className="block text-sm font-semibold mb-2 text-gray-700"
                >
                  Offer Price (for 15 min consultation){" "}
                  <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-600 font-bold text-lg">
                    ₹
                  </span>
                  <input
                    id="offerPrice"
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    onFocus={() => setPriceError("")}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      priceError ? "border-red-600" : "border-gray-300"
                    }`}
                    placeholder="Enter price"
                  />
                </div>
                {priceError && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {priceError}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                  <svg className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  This price will apply to all new customers for astrologers using global pricing
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPrice}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Updating..." : globalOfferPrice ? "Update Price" : "Set Price"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
