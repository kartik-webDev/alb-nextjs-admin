"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import SlotBlockingManagement from './TimeBlocker';
import TimeRangeBlocking from './TimeRangeBlock';

export default function BlockingManagement() {
  const [isTimeRangeMode, setIsTimeRangeMode] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 pt-8">
        {/* Header Card with Toggle */}
        <Card className="mb-6 p-6 bg-[#EF4444] text-white border-none shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {isTimeRangeMode ? 'Time Range Blocking' : 'Slot-Level Blocking'}
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                {isTimeRangeMode 
                  ? 'Block full days or specific time ranges for astrologers'
                  : 'Block individual 20-minute consultation slots for specific reports and astrologers'
                }
              </p>
            </div>
            
            {/* Toggle Switch */}
            {/* <div className="flex items-center space-x-3 ml-6">
              <div className="flex flex-col items-end">
                <span className={`text-sm font-medium mb-1 ${!isTimeRangeMode ? 'text-white' : 'text-white/60'}`}>
                  Slot-Level
                </span>
                <span className={`text-xs ${!isTimeRangeMode ? 'text-white/90' : 'text-white/50'}`}>
                  20-min slots
                </span>
              </div>
              
              <div className="relative">
                <Checkbox
                  id="blockingMode"
                  checked={isTimeRangeMode}
                  onCheckedChange={(checked) => setIsTimeRangeMode(checked as boolean)}
                  className="w-5 h-5 data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-[#EF4444]"
                />
              </div>
              
              <div className="flex flex-col items-start">
                <span className={`text-sm font-medium mb-1 ${isTimeRangeMode ? 'text-white' : 'text-white/60'}`}>
                  Time Range
                </span>
                <span className={`text-xs ${isTimeRangeMode ? 'text-white/90' : 'text-white/50'}`}>
                  Full day/Custom
                </span>
              </div>
            </div> */}
          </div>
        </Card>
      </div>

      {/* Render Active Component */}
      {isTimeRangeMode ? <TimeRangeBlocking /> : <SlotBlockingManagement />}
    </div>
  );
}
