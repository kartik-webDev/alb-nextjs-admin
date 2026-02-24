'use client';

import { Review } from '@/types';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';

interface ReviewsSectionProps {
  reviews: Review[];
  loadingReviews: boolean;
  reviewsError: string | null;
  astrologerId: string | null;
  onRetryReviews: () => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  loadingReviews,
  reviewsError,
  astrologerId,
  onRetryReviews
}) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const web_urls = process.env.NEXT_PUBLIC_PREFIX_IMAGE_URL || "https://api.acharyalavbhushan.com/";

  // Helper function to render star ratings
  const renderStars = (rating: number): React.ReactNode => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <svg
        key={idx}
        xmlns="http://www.w3.org/2000/svg"
        fill={idx < rating ? "gold" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="w-4 h-4 text-yellow-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.7.664.322.987l-4.19 3.602a.563.563 0 00-.182.557l1.287 5.385c.114.477-.398.85-.81.593l-4.725-2.885a.563.563 0 00-.586 0l-4.725 2.885c-.412.257-.924-.116-.81-.593l1.287-5.385a.563.563 0 00-.182-.557L2.542 10.384a.563.563 0 01.322-.987l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
        />
      </svg>
    ));
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.ratings, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Show limited reviews initially
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(parseFloat(averageRating)))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loadingReviews && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <Skeleton height={80} className="rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Reviews List */}
      {!loadingReviews && reviews.length > 0 && (
        <div className="space-y-4">
          {displayedReviews.map((review: Review) => (
            <div
              key={review._id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-center gap-3 mb-3">
                {review.customerImage ? (
                  <img
                    alt={review.customerName}
                    src={`${web_urls}uploads/${review.customerImage}`}
                    className="w-12 h-12 rounded-full object-cover border"
                    // onError={(e) => {
                    //   const target = e.target as HTMLImageElement;
                    //   target.src = '/default-avatar.jpg';
                    // }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full border flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-purple-500 text-white font-semibold text-lg">
                    {review.customerName[0]?.toUpperCase() || 'U'}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">
                      {review.customerName}
                    </p>
                    {review.is_verified && (
                      <span className="px-2 py-0.5 text-[10px] bg-green-100 text-green-700 rounded-full font-medium">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-3">
                {renderStars(review.ratings)}
                <span className="ml-1 text-sm text-gray-600 font-medium">
                  ({review.ratings}/5)
                </span>
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 leading-relaxed">
                {review.comments}
              </p>

              {/* Review Actions */}
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <button className="hover:text-blue-600 transition-colors">
                  Helpful
                </button>
                <span>•</span>
                <span>
                  {new Date(review.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Show More/Less Button */}
          {reviews.length > 5 && (
            <div className="text-center">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {showAllReviews 
                  ? `Show Less Reviews` 
                  : `Show All ${reviews.length} Reviews`
                }
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Reviews State */}
      {!loadingReviews && reviews.length === 0 && !reviewsError && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500">Be the first to review this astrologer</p>
        </div>
      )}

      {/* Error State */}
      {!loadingReviews && reviewsError && (
        <div className="text-center py-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-700 mb-2">Unable to Load Reviews</h3>
          <p className="text-red-600 text-sm mb-4">{reviewsError}</p>
          <button
            onClick={onRetryReviews}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
