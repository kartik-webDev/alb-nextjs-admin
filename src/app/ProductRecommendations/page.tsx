'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Package, User, Star, Clock, CheckCircle, XCircle, Loader2, AlertCircle, ShoppingBag, Tag, Hash, Mail, Phone } from 'lucide-react';
import MainDatatable from '@/components/LogsDataTable';

// Types
interface Customer {
  _id: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
}

interface Astrologer {
  _id: string;
  astrologerName: string;
  email: string;
  phoneNumber: string;
  country_code: string;
}

interface Product {
  _id: string;
  productName: string;
}

interface RecommendationLog {
  _id: string;
  customer: Customer;
  astrologer: Astrologer;
  channelName: string;
  products: Product[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  results: RecommendationLog[];
  message?: string;
}

const ProductRecommendationsPage = () => {
  const [allData, setAllData] = useState<RecommendationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(() => getTodayDate());
  const [endDate, setEndDate] = useState(() => getTodayDate());

  const getStatusDisplay = (log: RecommendationLog) => {
    const status = log.status;
    
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case 'sent':
        return {
          label: 'Sent',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          icon: <CheckCircle className="w-3.5 h-3.5" />
        };
      case 'accepted':
        return {
          label: 'Accepted',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          icon: <CheckCircle className="w-3.5 h-3.5" />
        };
      case 'rejected':
        return {
          label: 'Rejected',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          icon: <XCircle className="w-3.5 h-3.5" />
        };
      default:
        return {
          label: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: <Clock className="w-3.5 h-3.5" />
        };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (startDate) params.append('fromDate', startDate);
        if (endDate) params.append('toDate', endDate);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/astrologer/view-product-recommendations${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const result: ApiResponse = await response.json();
        
        if (result.success && result.results) {
          setAllData(result.results);
        } else {
          throw new Error(result.message || 'Invalid data format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, statusFilter]);

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    if (newStartDate > endDate) setEndDate(newStartDate);
  };

  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);
    if (newEndDate < startDate) setStartDate(newEndDate);
  };

  const filteredLogs = useMemo(() => {
    return allData.filter(log => statusFilter === 'all' || log.status === statusFilter);
  }, [statusFilter, allData]);

  const statusCounts = useMemo(() => {
    const counts = { all: allData.length, draft: 0, sent: 0, accepted: 0, rejected: 0 };
    allData.forEach(log => {
      const status = log.status;
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  }, [allData]);

  const statusFilters = [
    { label: 'All', value: 'all', count: statusCounts.all },
    { label: 'Draft', value: 'draft', count: statusCounts.draft },
    { label: 'Sent', value: 'sent', count: statusCounts.sent },
    { label: 'Accepted', value: 'accepted', count: statusCounts.accepted },
    { label: 'Rejected', value: 'rejected', count: statusCounts.rejected }
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Simplified Columns - Only essential info
  const columns = useMemo(() => [
    {
      name: 'Products',
      selector: (row: RecommendationLog) => row.products.length,
      cell: (row: RecommendationLog) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              {row.products.length} Product{row.products.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {row.products.map((product, idx) => (
              <span key={idx} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {product.productName}
              </span>
            ))}
          </div>
        </div>
      ),
      sortable: true,
      width: '300px',
    },
    {
      name: 'Customer',
      selector: (row: RecommendationLog) => row.customer?.customerName || 'N/A',
      cell: (row: RecommendationLog) => {
        const customer = row.customer;
        return (
          <div className="py-2">
            <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              {customer?.customerName || 'Unknown'}
            </div>
            {customer?.email && customer.email !== ' ' && (
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" />
                {customer.email}
              </div>
            )}
            {customer?.phoneNumber && (
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" />
                {customer.countryCode || '+91'} {customer.phoneNumber}
              </div>
            )}
          </div>
        );
      },
      sortable: true,
      width: '280px',
    },
    {
      name: 'Astrologer',
      selector: (row: RecommendationLog) => row.astrologer?.astrologerName || 'N/A',
      cell: (row: RecommendationLog) => {
        const astrologer = row.astrologer;
        return (
          <div className="py-2">
            <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              {astrologer?.astrologerName || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3" />
              {astrologer?.email || 'No Email'}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <Phone className="w-3 h-3" />
              {astrologer?.country_code || '+91'} {astrologer?.phoneNumber || 'N/A'}
            </div>
          </div>
        );
      },
      sortable: true,
      width: '280px',
    },
    {
      name: 'Status',
      selector: (row: RecommendationLog) => row.status,
      cell: (row: RecommendationLog) => {
        const statusDisplay = getStatusDisplay(row);
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
            {statusDisplay.icon}
            {statusDisplay.label}
          </span>
        );
      },
      sortable: true,
      width: '130px',
    },
    {
      name: 'Created',
      selector: (row: RecommendationLog) => row.createdAt,
      cell: (row: RecommendationLog) => (
        <div className="text-sm text-gray-900">
          {formatDate(row.createdAt)}
          <div className="text-xs text-gray-400">{formatTime(row.createdAt)}</div>
        </div>
      ),
      sortable: true,
      width: '120px',
    },
  ], []);

  // Simplified Expandable component - Shows products prominently
  const ExpandedComponent = ({ data }: { data: RecommendationLog }) => {
    const statusDisplay = getStatusDisplay(data);
    const customer = data.customer;
    const astrologer = data.astrologer;
    
    return (
      <div className="px-6 py-6 bg-gray-50">
        <div className="grid grid-cols-1 gap-6">
          
          {/* PRODUCTS SECTION - at the top as requested */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Recommended Products ({data.products.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.products.map((product, idx) => (
                <div key={product._id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                    <div className="text-xs text-gray-400 font-mono">ID: {product._id.slice(-8)}</div>
                  </div>
                </div>
              ))}
              {data.products.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4 col-span-full">No products recommended</p>
              )}
            </div>
          </div>

          {/* Customer and Astrologer Details - Minimal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info - Minimal */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Customer Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-24">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{customer?.customerName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-24">Email:</span>
                  <span className="text-sm text-gray-700">{customer?.email && customer.email !== ' ' ? customer.email : 'Not Provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-24">Phone:</span>
                  <span className="text-sm text-gray-700">{customer?.countryCode || '+91'} {customer?.phoneNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Astrologer Info - Minimal */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                Astrologer Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-24">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{astrologer?.astrologerName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-24">Email:</span>
                  <span className="text-sm text-gray-700">{astrologer?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-24">Phone:</span>
                  <span className="text-sm text-gray-700">{astrologer?.country_code || '+91'} {astrologer?.phoneNumber || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Metadata - Minimal */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              Recommendation Info
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className={`text-sm font-medium ${statusDisplay.textColor} flex items-center gap-1 mt-1`}>
                  {statusDisplay.icon}
                  {statusDisplay.label}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Channel</div>
                <div className="text-sm font-medium text-gray-900 mt-1">{data.channelName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Created</div>
                <div className="text-sm font-medium text-gray-900 mt-1">{formatDate(data.createdAt)}</div>
                <div className="text-xs text-gray-400">{formatTime(data.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Last Updated</div>
                <div className="text-sm font-medium text-gray-900 mt-1">{formatDate(data.updatedAt)}</div>
                <div className="text-xs text-gray-400">{formatTime(data.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const dateFiltersComponent = (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={startDate}
        max={getTodayDate()}
        onChange={(e) => handleStartDateChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <span className="text-gray-500 text-sm">to</span>
      <input
        type="date"
        value={endDate}
        max={getTodayDate()}
        min={startDate}
        onChange={(e) => handleEndDateChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Error loading data</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto">
        <MainDatatable
          data={filteredLogs}
          columns={columns}
          title="Product Recommendations"
          isLoading={loading}
          showSearch={true}
          expandableRows={true}
          expandableRowsComponent={ExpandedComponent}
          statusFilters={statusFilters}
          onStatusFilterChange={setStatusFilter}
          selectedStatus={statusFilter}
          dateFilters={dateFiltersComponent}
          addButtonActive={false}
        />
      </div>
    </div>
  );
};

export default ProductRecommendationsPage;