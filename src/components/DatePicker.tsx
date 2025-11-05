'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import moment from 'moment';

interface TimeSlot {
  _id: string;
  fromTime: string;
  toTime: string;
  duration: number;
  status: string;
}

interface SlotResponse {
  SlotDate: string;
  SlotTimeByDuration: {
    [key: string]: TimeSlot[];
  };
}

interface DatePickerProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  astrologerId: string;
  duration?: number;
  setSlotsError : (slots : string | null)=> void;
}

// Custom hook for detecting clicks outside an element
const useClickOutside = (ref: React.RefObject<HTMLElement | null>, callback: () => void) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, callback]);
};

const DatePicker: React.FC<DatePickerProps> = ({ 
  selectedDate, 
  onDateSelect, 
  astrologerId,
  duration = 30 ,
  setSlotsError
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Properly typed refs
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close calendar when clicking outside
  useClickOutside(calendarRef, () => {
    if (showCalendar) {
      setShowCalendar(false);
    }
  });

  // Utility functions for date handling
  const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
  };

  // Fetch available slot dates
  const fetchAvailableDates = async () => {
    if (!astrologerId) return;
    const currentDate = new Date().toLocaleDateString('en-CA'); 
    const currentTime = moment().format('HH:mm'); // outputs "14:30"
    try {
      setLoadingDates(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/astrologer/get_slots_date_duration/${astrologerId}?duration=${duration}&currentDate=${currentDate}&currentTime=${currentTime}`);
      const data = await response.json();
      
      if (data.success && data.slotDates) {
        setAvailableDates(data.slotDates);
        handleDateClick(data.slotDates[0] || '', true, false); // Reset selected date if it's no longer available
        setSlotsError(null)
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
      setSlotsError('Failed to fetch available slots');
    } finally {
      setLoadingDates(false);
    }
  };


  useEffect(() => {
    fetchAvailableDates();
  }, [astrologerId,duration]);


  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateString = formatDateToLocalString(currentDate);
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPast = currentDate < today;
      const isAvailable = availableDates.includes(dateString);
      const isSelected = selectedDate === dateString;
      
      days.push({
        date: currentDate,
        dateString,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isAvailable,
        isSelected
      });
    }
    
    return days;
  };

  const handleDateClick = (dateString: string, isAvailable: boolean, isPast: boolean) => {
    if (isPast || !isAvailable) return;
    
    // Ensure we're working with local timezone
    const localDate = parseDateFromString(dateString);
    const formattedDateString = formatDateToLocalString(localDate);
    
    console.log('Selected date:', formattedDateString); // Debug log
    onDateSelect(formattedDateString);
    
    // Close calendar after date selection
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleButtonClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setShowCalendar(!showCalendar);
  };

  const getSelectedDateDisplay = () => {
    if (!selectedDate) return 'Select a date';
    
    const localDate = parseDateFromString(selectedDate);
    return localDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-3 relative">
      {/* <h4 className="font-semibold text-gray-800">Select Date & Time</h4> */}
      
      {/* Date Selection Button */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white hover:border-[#980d0d] transition-colors"
      >
        <span className={selectedDate ? 'text-gray-800' : 'text-gray-500'}>
          {getSelectedDateDisplay()}
        </span>
        <Calendar size={20} className="text-gray-400" />
      </button>

      {/* Calendar Dropdown - Positioned absolutely to prevent layout shift */}
      {showCalendar && (
        <div 
          ref={calendarRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 border border-gray-200 rounded-lg bg-white shadow-lg p-4 space-y-4" 
          style={{ maxWidth: '320px' }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={loadingDates}
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-semibold text-gray-800">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={loadingDates}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Loading state for dates */}
          {loadingDates && (
            <div className="text-center py-4 text-sm text-gray-500">
              Loading available dates...
            </div>
          )}

          {/* Calendar grid */}
          {!loadingDates && (
            <>
              {/* Week day headers */}
              <div 
                className="text-center text-xs font-medium text-gray-500 mb-2"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '4px' 
                }}
              >
                {weekDays.map(day => (
                  <div key={day} className="p-2">{day}</div>
                ))}
              </div>

              {/* Calendar days */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '4px' 
                }}
              >
                {calendarDays.map((dayInfo, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateClick(dayInfo.dateString, dayInfo.isAvailable, dayInfo.isPast)}
                    disabled={dayInfo.isPast || !dayInfo.isAvailable}
                    className={`
                      relative p-2 text-sm rounded-md transition-colors flex items-center justify-center
                      ${!dayInfo.isCurrentMonth 
                        ? 'text-gray-300 cursor-default' 
                        : dayInfo.isPast 
                          ? 'text-gray-400 cursor-not-allowed'
                          : dayInfo.isAvailable
                            ? dayInfo.isSelected
                              ? 'bg-[#980d0d] text-white font-semibold'
                              : 'bg-green-200 text-gray-800 hover:bg-green-300 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                      }
                    `}
                    style={{ minHeight: '36px', width: '36px' }}
                  >
                    {dayInfo.day}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 pt-2 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-300 rounded border"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#980d0d] rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
