"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Save, Edit2, Info } from "lucide-react";

interface GlobalOfferPrice {
  _id?: string;
  OfferPrice: number;
}

export default function GlobalOfferPricePage() {
  const [globalOfferPrice, setGlobalOfferPrice] = useState<GlobalOfferPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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
      
      if (data.success && data.data) {
        setGlobalOfferPrice(data.data);
        setPriceInput(data.data.OfferPrice.toString());
      }
    } catch (e) {
      console.error("Error fetching global offer price:", e);
      toast.error("Failed to load global offer price");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalOfferPrice();
  }, []);

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

    try {
      setSubmitting(true);

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
        await fetchGlobalOfferPrice();
        setIsEditing(false);
        toast.success(`Global offer price updated to ₹${priceInput}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update global offer price");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPriceInput(globalOfferPrice?.OfferPrice.toString() || "");
    setPriceError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Customer First-Time Consultation Price</h2>
          <p className="text-sm text-gray-600">Platform-wide offer price for new customers (15 min consultations)</p>
        </div>

        {/* Main Content Area */}
        <div className="space-y-5">
          
          {/* Price Management Card */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <div className="bg-white rounded-lg border border-red-200 p-5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Current Offer Price</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-[2px] hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Price
                  </button>
                )}
              </div>

              {!isEditing ? (
                // Display Mode
                <div className="flex items-center justify-between px-5 py-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Active Offer Price</p>
                    <div className="text-3xl font-bold text-red-600">
                      ₹{globalOfferPrice?.OfferPrice || "Not Set"}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-semibold text-gray-700">15 minutes</p>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* Price Input */}
                    <div className="md:col-span-6">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Offer Price (₹) <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-gray-600 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          value={priceInput}
                          onChange={(e) => {
                            setPriceInput(e.target.value);
                            setPriceError("");
                          }}
                          className={`w-full pl-9 pr-4 py-2.5 border-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                            priceError ? "border-red-600" : "border-gray-300"
                          }`}
                          placeholder="Enter price"
                          min="0"
                        />
                      </div>
                      {priceError && (
                        <p className="text-red-600 text-xs mt-1.5">{priceError}</p>
                      )}
                      {/* <p className="text-xs text-gray-500 mt-1.5">
                        This price applies to all new customers for astrologers using global pricing
                      </p> */}
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-6 flex items-center gap-3">
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitPrice}
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-[2px] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Price
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Information Cards Grid */}
          {/* <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Important Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1.5">Who Sees This?</h4>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      New customers only, for astrologers who have enabled global pricing in their settings
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Info className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-900 mb-1.5">Consultation Duration</h4>
                    <p className="text-xs text-purple-800 leading-relaxed">
                      This price applies only to 15-minute consultations. Other durations use their own pricing
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Info className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1.5">Custom Override</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Individual astrologers can set their own custom first-time pricing to override this global price
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Quick Notes */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Notes</h4>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Changes take effect immediately for all applicable astrologers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>This is a first-time offer price, shown only to new customers on their first consultation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Astrologers must either enable " Global Pricing" or define their first time "Custom Price" by admin section</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
