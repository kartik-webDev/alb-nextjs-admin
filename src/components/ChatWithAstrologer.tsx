// components/ChatWithAstrologer.tsx
'use client';

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// TypeScript interfaces
interface ConsultationPrice {
  price: number;
  duration: {
    slotDuration: number;
  };
  _id: string;
}

interface MainExpertise {
  _id: string;
  mainExpertise: string;
  description: string;
  image: string;
}

interface NextAvailableSlot {
  date: string | null;
  fromTime: string | null;
  toTime?: string | null;
}

interface AstrologerData {
  _id: string;
  id: string;
  isOnline : string;
  avg_rating : number;
  astrologerName: string;
  profileImage: string;
  tagLine: string;
  rating: number;
  ratingCount: number;
  experience: string;
  mainExpertise: MainExpertise[];
  language: string[];
  consultationPrices: ConsultationPrice[];
  nextAvailableSlot: NextAvailableSlot | null;
}

interface ApiResponse {
  success: boolean;
  message: string;
  results: AstrologerData[];
  totalPages: number;
}

interface ChatWithAstrologerProps {
  searchText?: string;
  expertiseId?: string;
  onCountChange?: (count: number) => void;
}

const ChatWithAstrologer: React.FC<ChatWithAstrologerProps> = ({ 
  searchText = '', 
  expertiseId = '',
  onCountChange 
}) => {
  const router = useRouter();
  const [astrologerData, setAstrologerData] = useState<AstrologerData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [isFetched, setIsFetched] = useState<boolean>(false);

  // Add this helper function inside the component
const prioritizeAstrologer = (astrologers: AstrologerData[], priorityName: string): AstrologerData[] => {
  const priorityAstrologer = astrologers.find(
    (a) => a.astrologerName === priorityName
  );
  
  if (priorityAstrologer) {
    const others = astrologers.filter(
      (a) => a.astrologerName !== priorityName
    );
    return [priorityAstrologer, ...others];
  }
  
  return astrologers;
};

const fetchAstrologers = async (pageNum: number = 1, reset: boolean = false): Promise<void> => {
  try {
    setLoading(true);
    if (reset) {
      setAstrologerData([]);
      setIsFetched(false);
    }
    
    // Build params object
    const paramsObj: Record<string, string> = {
      page: pageNum.toString(),
      limit: '100',
      astrologerName: searchText,
      hasAvailableSlots: 'true',
    };

    // Only add mainExpertise if expertiseId is provided and not empty
    if (expertiseId && expertiseId !== '') {
      paramsObj.mainExpertise = expertiseId;
    }

    const params = new URLSearchParams(paramsObj);

    const { data }: { data: ApiResponse } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/astrologer/astrologer_filter`,
      { params }
    );

    // Filter out astrologers with empty consultationPrices array
    const filteredResults = data.results.filter(astrologer => {
      const prices = astrologer?.consultationPrices;
      return prices && prices.length > 0 && prices[0]?.price !== 9999;
    });

    // Prioritize "Acharya Lavbhushan" to appear first
    const prioritizedResults = prioritizeAstrologer(filteredResults, "Acharya Lavbhushan");

    if (reset) {
      setAstrologerData(prioritizedResults);
    } else {
      setAstrologerData(prev => [...prev, ...prioritizedResults]);
    }
    
    setTotalPage(data.totalPages);
    
    // Update count in parent component
    if (onCountChange) {
      onCountChange(reset ? prioritizedResults.length : astrologerData.length + prioritizedResults.length);
    }
  } catch (error) {
    console.error("Error fetching astrologer data:", error);
    if (onCountChange) {
      onCountChange(0);
    }
  } finally {
    setLoading(false);
    setIsFetched(true);
  }
};

  // Reset and fetch when search text or expertise changes
  useEffect(() => {
    setPage(1);
    fetchAstrologers(1, true);
  }, [searchText, expertiseId]);

  // Fetch more when page changes (but not on initial load)
  useEffect(() => {
    if (page > 1) {
      fetchAstrologers(page, false);
    }
  }, [page]);

useEffect(() => {
  const handleScroll = (): void => {
    if (loading) return;

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    
    // Increased threshold to 500-800px to trigger before reaching footer
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 800;

    if (isNearBottom && page < totalPage) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [loading, page, totalPage]);

  const handleCardClick = (astrologer: AstrologerData): void => {
    const slug = astrologer?.astrologerName?.split(' ')?.join('-')?.toLowerCase();
    router.push(`/astrologer/details?name=${slug}&id=${astrologer?._id}`);
  };

  const renderStars = (rating: number): React.ReactNode => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="text-yellow-400 text-sm">★</span>
        ))}
      </div>
    );
  };
  const getFilteredExpertise = (expertiseList: MainExpertise[]): MainExpertise[] => {
    return expertiseList.filter(exp => 
      exp.mainExpertise.toLowerCase() !== 'ask any prashna'
    );
  };

  const getMinPrice = (astrologer : any) => {
    let minPrice = Infinity;
    if ( astrologer?.consultationPrices) {
      astrologer?.consultationPrices.map((price:any) => {
        if(price.price !== 5)
        minPrice = Math.min(price.price , minPrice)
      })
    }    
    if(minPrice !== Infinity)
    return minPrice;
  return 1000;
  }

  return (
    <section className='px-4 pb-6 min-h-screen'>
      <article className='max-w-7xl mx-auto space-y-6'>
        {/* Consultants grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-1 md:gap-4 pt-2'>
  {astrologerData?.map((astrologer, value) => {
  return (
    <Link 
      prefetch={true}
      key={value}
      href={`/astrologer/details?name=${astrologer.astrologerName}&id=${astrologer._id}`}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Golden Background Section with Profile Image */}
      <div className="relative flex items-center justify-center w-full bg-gradient-to-b from-yellow-200 via-amber-100 to-white pt-6 pb-4">
        <div className="relative w-32 h-32">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <img
              src={`${process.env.NEXT_PUBLIC_PREFIX_IMAGE_URL}${astrologer.profileImage}`}
              alt={astrologer.astrologerName}
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Content Area - White Background */}
      <div className="flex flex-col items-start gap-1 w-full flex-1 p-4 pt-3">
        {/* Name */}
        <h3 className="text-sm sm:text-base font-bold text-gray-900 capitalize truncate w-full flex-shrink-0">
          {astrologer.astrologerName}
        </h3>

        {/* Rating and Experience */}
        <div className="flex items-center justify-between w-full flex-shrink-0">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
          </div>
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {astrologer.experience}+ yrs
          </span>
        </div>

        {/* Consultations Count */}
        <div className="flex items-center gap-1.5 w-full flex-shrink-0">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-xs text-gray-500">
            2500+ Consultations
          </span>
        </div>

        {/* Language */}
        <div className="flex items-center gap-1.5 text-gray-400 w-full flex-shrink-0">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
          </svg>
          <span className="text-xs truncate">
            {astrologer.language?.slice(0, 2).join(', ') || 'English'}
          </span>
          {astrologer.language?.length > 2 && (
            <span className="text-gray-400 text-xs">+{astrologer.language.length - 2}</span>
          )}
        </div>

        {/* Spacer - Pushes price to bottom */}
        <div className="flex-1"></div>

        {/* Price and Book Now - Responsive layout */}
        <div className="flex items-center justify-between gap-3 pt-2 mt-1 border-t border-gray-100 w-full flex-shrink-0">
          {/* Price - Only visible on sm and above */}
          <span className="hidden sm:block text-xl font-bold text-red-700 whitespace-nowrap">
            ₹{getMinPrice(astrologer).toLocaleString('en-IN') || '9,999'}
          </span>
          
          {/* Book Now Button - Full width on mobile, auto on desktop */}
          <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors duration-200 shadow-sm whitespace-nowrap w-full sm:w-auto">
            {/* Mobile: Show "Pay ₹price" */}
            <span className="sm:hidden">
              Pay ₹{getMinPrice(astrologer).toLocaleString('en-IN') || '9,999'}
            </span>
            {/* Desktop: Show "Book Now" */}
            <span className="hidden sm:inline">
              Book Now
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
})}



        </div>

        {/* Loading States */}
        {loading && !isFetched && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-40 sm:h-48"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {isFetched && astrologerData?.length <= 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-md text-center py-12 px-6">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No consultants available right now
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                All our consultants are currently busy. Please try again later.
              </p>
              <button 
                onClick={() => fetchAstrologers(1, true)}
                className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 shadow-md text-sm"
              >
                Refresh Availability
              </button>
            </div>
          </div>
        )}

        {/* Load More Loading */}
        {loading && isFetched && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading more consultants...</p>
            </div>
          </div>
        )}
      </article>
    </section>
  );
};

export default ChatWithAstrologer;


