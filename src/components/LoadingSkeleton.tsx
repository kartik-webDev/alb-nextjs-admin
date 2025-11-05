'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="p-5 space-y-4">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton height={40} width={300} className="mb-2" />
          <Skeleton height={20} width={200} />
        </div>

        {/* Main Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex max-md:flex-col gap-5">
              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <Skeleton height={30} width={250} className="mb-2" />
                  <Skeleton height={16} width={180} />
                </div>
                
                <div>
                  <Skeleton height={20} width={100} className="mb-2" />
                  <Skeleton height={16} width="100%" />
                  <Skeleton height={16} width="80%" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <Skeleton height={20} width={80} className="mb-2" />
                    <Skeleton height={16} width={120} />
                  </div>
                  <div>
                    <Skeleton height={20} width={80} className="mb-2" />
                    <Skeleton height={16} width={150} />
                  </div>
                </div>

                <div>
                  <Skeleton height={20} width={60} className="mb-2" />
                  <Skeleton height={16} width="100%" />
                </div>

                <div>
                  <Skeleton height={20} width={80} className="mb-2" />
                  <div className="flex gap-2 flex-wrap">
                    <Skeleton height={32} width={100} className="rounded-xl" />
                    <Skeleton height={32} width={120} className="rounded-xl" />
                    <Skeleton height={32} width={90} className="rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Profile Image */}
              <div className="text-center">
                <Skeleton height={240} width={240} className="rounded-md" />
              </div>
            </div>

            {/* Long Bio */}
            <div className="space-y-2">
              <Skeleton height={16} width="100%" />
              <Skeleton height={16} width="100%" />
              <Skeleton height={16} width="100%" />
              <Skeleton height={16} width="75%" />
              <Skeleton height={16} width="60%" />
            </div>
          </div>

          {/* Right Column - Booking Section */}
          <div className="lg:col-span-4 space-y-4">
            <div className="border rounded-md p-4 space-y-5">
              {/* Session Type */}
              <div>
                <Skeleton height={20} width={200} className="mb-3" />
                <div className="flex gap-3">
                  <Skeleton height={56} width={56} className="rounded-md" />
                  <Skeleton height={56} width={56} className="rounded-md" />
                  <Skeleton height={56} width={56} className="rounded-md" />
                </div>
              </div>

              {/* Duration */}
              <div>
                <Skeleton height={20} width={150} className="mb-3" />
                <div className="flex gap-3">
                  <Skeleton height={60} width={90} className="rounded-md" />
                  <Skeleton height={60} width={90} className="rounded-md" />
                  <Skeleton height={60} width={90} className="rounded-md" />
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <Skeleton height={20} width={120} className="mb-3" />
                <Skeleton height={48} width="100%" className="rounded-md" />
              </div>

              {/* Time Slots */}
              <div>
                <Skeleton height={20} width={140} className="mb-3" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton height={36} className="rounded-md" />
                  <Skeleton height={36} className="rounded-md" />
                  <Skeleton height={36} className="rounded-md" />
                  <Skeleton height={36} className="rounded-md" />
                  <Skeleton height={36} className="rounded-md" />
                  <Skeleton height={36} className="rounded-md" />
                </div>
              </div>

              {/* Book Button */}
              <div className="pt-4 border-t">
                <Skeleton height={48} width="100%" className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 space-y-4">
          <Skeleton height={24} width={200} className="mb-6" />
          
          {/* Review Cards */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton height={48} width={48} className="rounded-full" />
                <div className="flex-1">
                  <Skeleton height={20} width={150} className="mb-1" />
                  <Skeleton height={14} width={100} />
                </div>
              </div>
              
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Skeleton key={starIdx} height={16} width={16} />
                ))}
              </div>
              
              <div className="space-y-2">
                <Skeleton height={16} width="100%" />
                <Skeleton height={16} width="90%" />
                <Skeleton height={16} width="70%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
