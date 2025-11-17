"use client";

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar, Ban } from 'lucide-react';

const reportPrefixes = [
  { value: '#LJR-', label: 'Life Journey Report (#LJR-)' },
  { value: '#LCR-', label: 'Life Changing Report (#LCR-)' },
  { value: '#KM-', label: 'Kundli Matching Report (#KM-)' },
  { value: '#MCO-', label: 'Maha Combo Offer (#MCO-)' },
];

export default function BlockedSlotsManagement() {
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTomorrowDate());
  const [selectedPrefix, setSelectedPrefix] = useState('#LJR-');
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingSlots, setProcessingSlots] = useState<Set<string>>(new Set());

  const getNext10Days = () => {
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      dates.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        fullLabel: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
      });
    }
    return dates;
  };

  const next10Days = getNext10Days();

  // Fetch slots
  const fetchSlots = async () => {
    if (!selectedDate || !selectedPrefix) return;
    setLoading(true);
    try {
      const availableResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/life-journey-report/available-consultation-slots?date=${selectedDate}&prefix=${encodeURIComponent(selectedPrefix)}`
      );
      const availableData = await availableResponse.json();
      const blockedParams = new URLSearchParams({
        date: selectedDate,
        prefix: selectedPrefix
      });
      const blockedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/life-journey-report/blocked-slots?${blockedParams.toString()}`
      );
      const blockedData = await blockedResponse.json();

      const availableSlots = availableData.success ? availableData.slots || [] : [];
      const blockedSlots = blockedData.success ? blockedData.blockedSlots || [] : [];
      const filteredBlockedSlots = blockedSlots.filter((slot: any) =>
        slot.prefix === selectedPrefix && slot.date === selectedDate
      );

      const blockedSlotsMap = new Map();
      filteredBlockedSlots.forEach((slot: any) => {
        blockedSlotsMap.set(slot.timeRange, {
          id: slot._id,
          isActive: slot.isActive,
          reason: slot.reason,
          blockedBy: slot.blockedBy,
          prefix: slot.prefix
        });
      });

      const allTimeRanges = new Set();
      availableSlots.forEach((slot: any) => allTimeRanges.add(slot.time));
      filteredBlockedSlots.forEach((slot: any) => allTimeRanges.add(slot.timeRange));

      const allSlots = Array.from(allTimeRanges).sort().map(timeRange => {
        const blockedInfo = blockedSlotsMap.get(timeRange);
        return {
          time: timeRange,
          isBlocked: blockedInfo ? true : false,
          blockedSlotId: blockedInfo?.id || null,
          isActive: blockedInfo?.isActive ?? true,
          reason: blockedInfo?.reason,
          blockedBy: blockedInfo?.blockedBy
        };
      });

      setSlots(allSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line
  }, [selectedDate, selectedPrefix]);

  // Block Slot
  const handleBlock = async (timeRange: string) => {
    setProcessingSlots(prev => new Set(prev).add(timeRange));
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.time === timeRange
          ? { ...slot, isBlocked: true, blockedSlotId: 'temp-id' }
          : slot
      )
    );
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/life-journey-report/blocked-slots`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedDate,
            timeRange,
            prefix: selectedPrefix,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Slot blocked successfully!");
        await fetchSlots();
      } else {
        toast.error(data.message || "Failed to block slot");
        setSlots(prevSlots =>
          prevSlots.map(slot =>
            slot.time === timeRange
              ? { ...slot, isBlocked: false, blockedSlotId: null }
              : slot
          )
        );
      }
    } catch (error) {
      console.error('Error blocking slot:', error);
      toast.error("An error occurred while blocking slot");
      setSlots(prevSlots =>
        prevSlots.map(slot =>
          slot.time === timeRange
            ? { ...slot, isBlocked: false, blockedSlotId: null }
            : slot
        )
      );
    } finally {
      setProcessingSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(timeRange);
        return newSet;
      });
    }
  };

  // Unblock Slot
  const handleUnblock = async (blockedSlotId: string, timeRange: string) => {
    if (!blockedSlotId || blockedSlotId === 'temp-id') {
      toast.error("Invalid slot ID");
      return;
    }
    setProcessingSlots(prev => new Set(prev).add(timeRange));
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.time === timeRange
          ? { ...slot, isBlocked: false, blockedSlotId: null }
          : slot
      )
    );
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/life-journey-report/blocked-slots/${blockedSlotId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Slot unblocked successfully!");
      } else {
        toast.error(data.message || "Failed to unblock slot");
        setSlots(prevSlots =>
          prevSlots.map(slot =>
            slot.time === timeRange
              ? { ...slot, isBlocked: true, blockedSlotId: blockedSlotId }
              : slot
          )
        );
      }
    } catch (error) {
      console.error('Error unblocking slot:', error);
      toast.error("An error occurred while unblocking");
      setSlots(prevSlots =>
        prevSlots.map(slot =>
          slot.time === timeRange
            ? { ...slot, isBlocked: true, blockedSlotId: blockedSlotId }
            : slot
        )
      );
    } finally {
      setProcessingSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(timeRange);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <Card className="mb-6 p-6 bg-[#EF4444] text-white border-none shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Slot Management
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Manage consultation time slots availability
              </p>
            </div>
            {/* <Ban className="w-12 h-12 md:w-16 md:h-16 opacity-90" /> */}
          </div>
        </Card>

        {/* Filters */}
        <Card className="mb-6 p-6 border-[#661726]/30 bg-white shadow-md">
          <div className="space-y-4">
            {/* Report Type and Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#EF4444] mb-2 block">
                  Report Type
                </label>
                <Select value={selectedPrefix} onValueChange={setSelectedPrefix}>
                  <SelectTrigger className="border-[#661726]/30">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {reportPrefixes.map((prefix) => (
                      <SelectItem key={prefix.value} value={prefix.value}>
                        {prefix.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#EF4444] mb-2 block">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-[#661726]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                />
              </div>
            </div>

            {/* Quick Date Selection - Next 10 Days */}
            <div>
              <label className="text-sm font-medium text-[#EF4444] mb-3 block">
                Quick Select Next 10 Days
              </label>
              <div className="flex flex-wrap gap-2">
                {next10Days.map((day) => (
                  <Button
                    key={day.date}
                    variant={selectedDate === day.date ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDate(day.date)}
                    className={`${
                      selectedDate === day.date
                        ? 'bg-[#EF4444] text-white'
                        : 'border-[#661726]/30 hover:bg-[#FFF5E9]'
                    }`}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-sm text-[#7A665D] pt-2">
              Showing slots for: <span className="font-semibold text-[#EF4444]">{formatDate(selectedDate)}</span>
            </div>
          </div>
        </Card>

        {/* Slots Grid */}
        {loading ? (
          <Card className="p-12 text-center border-[#661726]/30 bg-white">
            <Loader2 className="w-12 h-12 animate-spin text-[#661726] mx-auto mb-4" />
            <p className="text-[#7A665D]">Loading slots...</p>
          </Card>
        ) : slots.length === 0 ? (
          <Card className="p-12 text-center border-[#661726]/30 bg-white">
            <Calendar className="w-16 h-16 text-[#661726]/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2F211D] mb-2">
              No Slots Available
            </h3>
            <p className="text-[#7A665D]">
              No time slots found for the selected date and report type
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slots.map((slot) => {
              const isProcessing = processingSlots.has(slot.time);
              return (
                <Card
                  key={slot.time}
                  className={`p-4 border transition-all ${
                    slot.isBlocked
                      ? 'bg-red-50 border-red-300'
                      : 'bg-green-50 border-green-300'
                  }`}
                >
                <div className="space-y-3">
  {/* Time and Button inline */}
  <div className="flex items-center justify-between">
    <p className="font-bold text-[#2F211D] text-lg mb-0">
      {slot.time}
    </p>
    <div className="ml-auto">
      {slot.isBlocked ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUnblock(slot.blockedSlotId, slot.time)}
          disabled={isProcessing || !slot.isBlocked}
          className={`${
            !slot.isBlocked
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-green-500 hover:bg-green-600 text-white border-none'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Unblock'
          )}
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => handleBlock(slot.time)}
          disabled={isProcessing || slot.isBlocked}
          className={`${
            slot.isBlocked
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Block'
          )}
        </Button>
      )}
    </div>
  </div>

  {/* BLOCKED badge */}
  {/* {slot.isBlocked && (
    <p className="text-xs text-red-600 font-medium">
      BLOCKED
    </p>
  )} */}

  {/* Reason if blocked */}
  {slot.isBlocked && slot.reason && (
    <div className="pt-2 border-t border-red-200">
      <p className="text-xs text-[#7A665D]">
        <span className="font-medium">Reason:</span> {slot.reason}
      </p>
    </div>
  )}
</div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
