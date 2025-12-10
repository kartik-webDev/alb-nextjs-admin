// components/astrologer/SpecialOffers.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Check, Plus, Trash2, Clock, Save, Tag, Calendar } from 'lucide-react';

interface SlotDuration {
  _id: string;
  slotDuration: number;
  active: boolean;
}

// ✅ FIXED: Match API response structure
interface OfferPrice {
  _id?: string;
  duration: {
    _id: string;
    slotDuration: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  price: number;
}

interface SpecialOffersProps {
  astrologerId: string;
  initialData: any;
  onUpdate: () => void;
}

export default function SpecialOffers({ astrologerId, initialData, onUpdate }: SpecialOffersProps) {
  // Offer metadata state
  const [isActive, setIsActive] = useState(initialData?.specialOffer?.isActive || false);
  const [startDate, setStartDate] = useState(
    initialData?.specialOffer?.startDate 
      ? new Date(initialData.specialOffer.startDate).toISOString().split('T')[0] 
      : ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.specialOffer?.endDate 
      ? new Date(initialData.specialOffer.endDate).toISOString().split('T')[0] 
      : ''
  );
  const [offerTitle, setOfferTitle] = useState(initialData?.specialOffer?.offerTitle || '');
  const [offerDescription, setOfferDescription] = useState(initialData?.specialOffer?.offerDescription || '');

  // Offer prices state
  const [existingOfferPrices, setExistingOfferPrices] = useState<OfferPrice[]>([]);
  const [newOfferPrice, setNewOfferPrice] = useState<{ durationId: string; price: string }>({
    durationId: '',
    price: ''
  });

  const [allSlotDurations, setAllSlotDurations] = useState<SlotDuration[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingPrice, setAddingPrice] = useState(false);

  // -------------------- load data --------------------
  useEffect(() => {
    fetchSlotDurations();
    loadExistingOfferPrices();
  }, []);

  const loadExistingOfferPrices = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/get-offer-price`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ astrologerId })
        }
      );

      const data = await response.json();

      if (data.success) {
        setExistingOfferPrices(data.data || []);
      }
    } catch (error) {
      console.error('Error loading offer prices:', error);
    }
  };

  const fetchSlotDurations = async () => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/get_slots_duration`);
      const data = await response.json();
      if (data.success) {
        const slots = data.slots || [];
        const activeSlots = slots.filter((s: SlotDuration) => s.active);
        setAllSlotDurations(activeSlots);
      }
    } catch (error) {
      console.error('Error fetching slot durations:', error);
      toast.error('Failed to load slot durations');
    } finally {
      setLoadingSlots(false);
    }
  };

  // -------------------- helpers --------------------
  const getSlotDuration = (durationId: string | undefined): SlotDuration | undefined => {
    if (!durationId) return undefined;
    return allSlotDurations.find(s => s._id === durationId);
  };

  // ✅ FIXED: Check against duration._id instead of duration
  const getAvailableSlots = (): SlotDuration[] => {
    const usedDurationIds = existingOfferPrices.map(p => p.duration._id);
    return allSlotDurations.filter(s => !usedDurationIds.includes(s._id));
  };

  // -------------------- offer prices --------------------
  const handleAddOfferPrice = async () => {
    if (!newOfferPrice.durationId) {
      toast.error('Please select a duration');
      return;
    }

    if (!newOfferPrice.price || Number(newOfferPrice.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setAddingPrice(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/create-offer-price`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            astrologerId,
            durationId: newOfferPrice.durationId,
            price: Number(newOfferPrice.price)
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Special offer price added successfully');
        setNewOfferPrice({ durationId: '', price: '' });
        loadExistingOfferPrices();
        onUpdate();
      } else {
        toast.error(data.message || 'Failed to add price');
      }
    } catch (error) {
      console.error('Error adding offer price:', error);
      toast.error('Network error occurred');
    } finally {
      setAddingPrice(false);
    }
  };

  // ✅ FIXED: Send only the durationId string, not the whole object
  const handleDeleteOfferPrice = async (durationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/delete-offer-price`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            astrologerId,
            durationId // ✅ Just send the string ID
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Special offer price deleted successfully');
        loadExistingOfferPrices();
        onUpdate();
      } else {
        toast.error(data.message || 'Failed to delete price');
      }
    } catch (error) {
      console.error('Error deleting offer price:', error);
      toast.error('Network error occurred');
    }
  };

  // -------------------- save offer metadata --------------------
  const handleUpdateOfferMetadata = async () => {
    // Validation
    if (isActive && (!startDate || !endDate)) {
      toast.error('Please set both start and end dates for active offer');
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        astrologerId,
        astrologerName: initialData?.astrologerName || '',
        displayName: initialData?.displayName || '',
        title: initialData?.title || '',
        email: initialData?.email || '',
        phoneNumber: initialData?.phoneNumber || '',
        alternateNumber: initialData?.alternateNumber || '',
        country_phone_code: initialData?.country_phone_code || '91',
        gender: initialData?.gender || '',
        dateOfBirth: initialData?.dateOfBirth || '',
        address: initialData?.address || '',
        country: initialData?.country || 'India',
        state: initialData?.state || '',
        city: initialData?.city || '',
        zipCode: initialData?.zipCode || '',
        password: initialData?.password || '',
        confirm_password: initialData?.confirm_password || initialData?.password || '',

        experience: initialData?.experience || '',
        about: initialData?.about || '',
        short_bio: initialData?.short_bio || '',
        long_bio: initialData?.long_bio || '',
        youtubeLink: initialData?.youtubeLink || '',
        tagLine: initialData?.tagLine || '',
        language: initialData?.language || [],
        workingOnOtherApps: initialData?.workingOnOtherApps || 'No',

        skill: initialData?.skill?.map((s: any) => s._id) || [],
        mainExpertise: initialData?.mainExpertise?.map((e: any) => e._id) || [],
        remedies: initialData?.remedies?.map((r: any) => r._id) || [],

        account_holder_name: initialData?.account_holder_name || '',
        account_number: initialData?.account_number || '',
        account_type: initialData?.account_type || '',
        IFSC_code: initialData?.IFSC_code || '',
        account_name: initialData?.account_name || '',
        panCard: initialData?.panCard || '',
        aadharNumber: initialData?.aadharNumber || '',

        consultation: initialData?.consultation || '1000',
        consultation_commission: initialData?.consultation_commission || 0,

        free_min: initialData?.free_min || 0,
        chat_price: initialData?.chat_price || null,
        call_price: initialData?.call_price || null,
        video_call_price: initialData?.video_call_price || 0,
        normal_video_call_price: initialData?.normal_video_call_price || 0,
        commission_call_price: initialData?.commission_call_price || '0',
        commission_chat_price: initialData?.commission_chat_price || '0',
        commission_video_call_price: initialData?.commission_video_call_price || 0,
        commission_normal_video_call_price: initialData?.commission_normal_video_call_price || 0,
        gift_commission: initialData?.gift_commission || 0,

        follower_count: initialData?.follower_count || 0,
        totalCallDuration: initialData?.totalCallDuration || 0,
        totalChatDuration: initialData?.totalChatDuration || 0,
        totalVideoCallDuration: initialData?.totalVideoCallDuration || 0,
        currency: initialData?.currency || 'INR',

        isDealInReport: initialData?.isDealInReport || false,
        reportTypes: initialData?.reportTypes || [],

        // Special Offer fields
        specialOfferIsActive: isActive,
        specialOfferStartDate: startDate,
        specialOfferEndDate: endDate,
        specialOfferTitle: offerTitle,
        specialOfferDescription: offerDescription,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/update-astrologer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Special offer details updated successfully');
        onUpdate();
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const availableSlots = getAvailableSlots();

  // Check if offer is currently running
  const isOfferRunning = () => {
    if (!isActive) return false;
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-gray-900">New Astrologer Special Offers Management</h2>
        </div>
        <p className="text-gray-600 text-sm">Create time-limited promotional offers with special pricing</p>
      </div>

      {/* Main card */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-6">
          {/* Active Toggle */}
          <div className="bg-gray-100 p-3 rounded-lg border border-red-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 text-sm">Activate Special Offer</span>
                <p className="text-xs text-gray-600">Enable this offer for customers</p>
              </div>
            </label>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Offer Title
            </label>
            <input
              type="text"
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder="e.g., New Year Special, Diwali Mega Sale"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Offer Description
            </label>
            <textarea
              value={offerDescription}
              onChange={(e) => setOfferDescription(e.target.value)}
              placeholder="e.g., Get 50% off on all consultations this festive season!"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
            />
          </div>

          {/* Save Metadata Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleUpdateOfferMetadata}
              disabled={submitting}
              className="px-5 py-2.5 bg-red-600 text-white rounded-[2px] font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Offer Details
                </>
              )}
            </button>
          </div>

        {/* Offer Prices Section */}
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Special Offer Prices</h3>
              <p className="text-xs text-gray-600 mt-0.5">Set discounted prices for different durations</p>
            </div>
          </div>

          {loadingSlots ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-200 border-t-red-500 mx-auto"></div>
              <p className="text-gray-500 text-xs mt-2">Loading...</p>
            </div>
          ) : (
            <>
              {/* Existing Offer Prices */}
              {existingOfferPrices.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {existingOfferPrices.map((price) => {
                      // ✅ FIXED: Access duration.slotDuration and duration._id correctly
                      return (
                        <div
                          key={price._id || price.duration._id}
                          className="flex items-center justify-between bg-gray-100 p-2 rounded-lg border border-red-200"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-900 text-sm">
                                {price.duration.slotDuration}min
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="font-bold text-red-600 text-sm">₹{price.price}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteOfferPrice(price.duration._id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add New Offer Price Form */}
              {availableSlots.length > 0 ? (
                <div className="bg-gray-100 p-3 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-xs font-medium text-gray-700 mb-2">Add New Offer Price</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      value={newOfferPrice.durationId}
                      onChange={(e) => setNewOfferPrice({ ...newOfferPrice, durationId: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      <option value="">Select Duration</option>
                      {availableSlots.map(slot => (
                        <option key={slot._id} value={slot._id}>
                          {slot.slotDuration} minutes
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={newOfferPrice.price}
                      onChange={(e) => setNewOfferPrice({ ...newOfferPrice, price: e.target.value })}
                      placeholder="Enter offer price"
                      min="0"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />

                    <button
                      type="button"
                      onClick={handleAddOfferPrice}
                      disabled={addingPrice}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-[2px] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {addingPrice ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Price
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-100 rounded-lg border border-red-200">
                  <Check className="w-8 h-8 text-green-500 mx-auto mb-1" />
                  <p className="text-gray-700 font-medium text-sm">All durations have offer prices</p>
                  <p className="text-gray-500 text-xs mt-0.5">Delete a price to add a different one</p>
                </div>
              )}

              {existingOfferPrices.length === 0 && availableSlots.length > 0 && (
                <div className="text-center py-4 bg-gray-100 rounded-lg border border-red-200 mb-3">
                  <Clock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No offer prices set yet</p>
                  <p className="text-gray-500 text-xs mt-1">Add your first offer price using the form above</p>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
