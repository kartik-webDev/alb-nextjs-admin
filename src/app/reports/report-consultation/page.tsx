'use client';

import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DeepSearchSpace } from '@/utils/common-function/index';
import MainDatatable from '@/components/common/MainDatatable';
import { ViewSvg } from '@/components/svgs/page';
import Swal from 'sweetalert2';
import { Tooltip } from '@mui/material';
import { X } from 'lucide-react';


const reportPrefixes = [
  { value: '#LJR-', label: 'Life Journey Report' },
  { value: '#LCR-', label: 'Life Changing Report' },
  { value: '#KM-', label: 'Kundli Matching Report' },
  { value: '#LR-', label: 'Love Report' },
  { value: '#NNR-', label: 'Name & Number Report' },
  { value: '#VR-', label: 'Varshphal Report' },
  // { value: '#BNR-', label: 'Baby Name Report' },
  // { value: '#CR-', label: 'Career Report' },
];

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

// Types
// ---------------------------------------------------------------------
interface FieldConfig {
  label: string;
  truncate?: boolean;
  formatter?: (value: any) => string;
}
interface Order {
  orderID: string;
  name: string;
  email: string;
  whatsapp: string;
  dateOfBirth: string
  placeOfBirth: string
  timeOfBirth: string
  partnerName: string
  partnerDateOfBirth: string
  partnerPlaceOfBirth: string
  partnerTimeOfBirth: string
  consultationTime: string;
  consultationDate: string;
  status: string;
  planName: string;
}
interface ConsultationSlot {
  orderID: string;
  name: string;
  email: string;
  whatsapp: string;
  dateOfBirth: string
  placeOfBirth: string
  timeOfBirth: string
  partnerName: string
  partnerDateOfBirth: string
  partnerPlaceOfBirth: string
  partnerTimeOfBirth: string
  consultationTime: string;
  consultationDate: string;
  status: string;
  planName: string;
}

interface SlotsByDate {
  [date: string]: Omit<ConsultationSlot, 'date'>[];
}

interface DateRange {
  from: string;
  to: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  startDate: string;
  endDate: string;
  prefix: string;
  totalBookings: number;
  dateRange: DateRange;
  slotsByDate: SlotsByDate;
  allSlots: ConsultationSlot[];
}

// ---------------------------------------------------------------------
// Status Badge Component
// ---------------------------------------------------------------------
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ---------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------
export default function ConsultationSlots() {
  const router = useRouter();

  // State
  const [slotsData, setSlotsData] = useState<ConsultationSlot[]>([]);
  console.log("consult ka data", slotsData)
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const filteredData = DeepSearchSpace(slotsData, searchText);
    const [activeRow, setActiveRow] = useState<Order | null>(null);
    const [viewOpen, setViewOpen] = useState<boolean>(false);
  

  // Filter State
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().add(7, 'days').format('YYYY-MM-DD'));
  const [prefix, setPrefix] = useState('#LJR-');
  const [dateRangeType, setDateRangeType] = useState('today');

  // Fetch Consultation Slots
  useEffect(() => {
    fetchSlots();
  }, [startDate, endDate, prefix]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate,
        endDate,
        prefix
      });
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/life-journey-report/consultation-booked-slots?${params.toString()}`
      );
      const data: ApiResponse = await res.json();

      if (data.success && Array.isArray(data.allSlots)) {
        setSlotsData(data.allSlots);
      } else {
        console.error('Invalid API response structure');
        setSlotsData([]);
      }
    } catch (error) {
      console.error('Failed to fetch consultation slots:', error);
      setSlotsData([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch consultation slots'
      });
    } finally {
      setLoading(false);
    }
  };

    const onView = (row: Order) => {
    setActiveRow(row);
    setViewOpen(true);
  };

  // Handle Date Range Type Change
  // const handleDateRangeChange = (rangeType: string) => {
  //   setDateRangeType(rangeType);
    
  //   const today = moment().format('YYYY-MM-DD');
    
  //   switch (rangeType) {
  //     case 'today':
  //       setStartDate(today);
  //       setEndDate(today);
  //       break;
  //     case 'last7days':
  //       setStartDate(moment().subtract(6, 'days').format('YYYY-MM-DD'));
  //       setEndDate(today);
  //       break;
  //     case 'last30days':
  //       setStartDate(moment().subtract(29, 'days').format('YYYY-MM-DD'));
  //       setEndDate(today);
  //       break;
  //     case 'custom':
  //       // Keep current dates as is for custom
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // Handle Manual Date Change
  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
    if (moment(newDate).isAfter(moment(endDate))) {
      setEndDate(newDate);
    }
    // setDateRangeType('custom'); // Switch to custom when manually changed
  };
// Helper function to format order details with custom labels and filtering
const formatOrderDetails = (order: any): Array<{ label: string; value: string; fullValue: string; isLong: boolean }> => {
  const fieldMap: Record<string, FieldConfig> = {
    // Essential customer info
    name: { label: 'Customer Name' },
    email: { label: 'Email', truncate: true },
    whatsapp: { label: 'WhatsApp', truncate: true },
    gender: { label: 'Gender' },
    
    // Birth details
    dateOfBirth: { 
      label: 'Date of Birth', 
      formatter: (v: string) => moment(v).format('DD/MM/YYYY')
    },
    timeOfBirth: { label: "Time of Birth" },
    placeOfBirth: { label: 'Place of Birth', truncate: true },
    placeOfBirthPincode: { label: 'Pincode' },
    
    // Partner details
    partnerName: { label: "Partner's Name", truncate: true },
    partnerDateOfBirth: { 
      label: "Partner's DOB", 
      formatter: (v: string) => moment(v).format('DD/MM/YYYY')
    },
    partnerTimeOfBirth: { label: "Partner's TOB" },
    partnerPlaceOfBirth: { label: "Partner's POB", truncate: true },
    
    // Order details
    orderID: { label: 'Order ID' },
    planName: { label: 'Plan Name', truncate: true },
    paymentTxnId: { label: 'Payment ID' },
    amount: { label: 'Amount' },
    paymentAt: { 
      label: 'Payment Date', 
      formatter: (v: string) => moment(v).format('DD/MM/YYYY hh:mm A')
    },
    consultationDate: { 
      label: 'Consultation Date', 
      formatter: (v: string) => moment(v).format('DD/MM/YYYY')
    },
    consultationTime: { label: 'Consultation Time' },
    problemType: { label: 'Problem Type' },
    status: { label: 'Status' },
    createdAt: { 
      label: 'Created', 
      formatter: (v: string) => moment(v).format('DD/MM/YYYY hh:mm A')
    },
    updatedAt: { 
      label: 'Updated', 
      formatter: (v: string) => moment(v).format('DD/MM/YYYY hh:mm A')
    },
    
    reportLanguage: { label: 'Language' },
    expressDelivery: { label: 'Express Delivery' },
    astroConsultation: { label: 'Consultation' },
    assignedAstrologerId: { 
      label: 'Astrologer', 
      truncate: true,
      formatter: (v: any) => v?.astrologerName || 'N/A'
    },
    
    // ✅ Razorpay Order ID - Normal truncation (appears in grid)
    razorpayOrderId: { 
      label: 'Razorpay Order ID', 
      truncate: true 
    },
    
    // ✅ Order Fingerprint - LAST ROW with FULL TEXT (no truncation)
    orderFingerprint: { 
      label: 'Order Fingerprint', 
      truncate: false  // ✅ No truncation - shows full text
    },
  };

  const filteredEntries = Object.entries(order)
    .filter(([key]) => fieldMap[key] !== undefined)
    .filter(([_, value]) => {
      return value !== null && 
             value !== undefined && 
             typeof value !== 'object';
    })
    .map(([key, rawValue]) => {
      const config = fieldMap[key];
      let displayValue = String(rawValue);
      
      // ✅ TypeScript safe formatter check
      if (config.formatter) {
        displayValue = config.formatter(rawValue);
      }
      
      // ✅ SPECIAL CASE: Order Fingerprint shows FULL TEXT and goes LAST
      const isLong = key === 'orderFingerprint' ? false : (Boolean(config.truncate) && displayValue.length > 50);
      const truncatedValue = key === 'orderFingerprint' ? displayValue : (isLong ? `${displayValue.substring(0, 50)}...` : displayValue);
      
      return {
        label: config.label,
        value: truncatedValue,
        fullValue: displayValue,
        isLong
      };
    })
    // ✅ SORT: Move orderFingerprint to LAST position
    .sort((a, b) => {
      if (a.label === 'Order Fingerprint') return 1;
      if (b.label === 'Order Fingerprint') return -1;
      return 0;
    });

  return filteredEntries;
};

const handleEndDateChange = (newDate: string) => {
  // Add 7 days using moment
  const nextDate = moment(newDate).add(7, 'days').format('YYYY-MM-DD');
  setEndDate(newDate);
  // setDateRangeType('custom');
};

 // Table Columns
  const columns = [

    { name: "S.No.", selector: (_: ConsultationSlot, idx?: number) => (idx || 0) + 1, width: "70px" },
    {
      name: "Order ID",
      selector: (row: ConsultationSlot) => row?.orderID || '',
      width: "110px"
    },
    {
      name: "Plan Name",
      selector: (row: ConsultationSlot) => row?.planName || '',
      width: "250px"
    },
    {
      name: "Customer Name",
      selector: (row: ConsultationSlot) => row?.name || '',
      width: "150px"
    },
    {
      name: "Email",
      cell: (row: ConsultationSlot) => {
        const email = row?.email?.trim() || "N/A";
        return (
          <Tooltip title={email}>
            <span className="truncate block w-full">{email}</span>
          </Tooltip>
        );
      },
      width: "200px",
    },
    {
      name: "WhatsApp",
      selector: (row: ConsultationSlot) => row?.whatsapp || '',
      width: "120px"
    },
    {
      name: "DOB",
      selector: (row: ConsultationSlot) => 
        row?.dateOfBirth ? moment(row.dateOfBirth).format('DD/MM/YYYY') : '',
      width: "110px"
    },
    {
      name: "TOB",
      selector: (row: ConsultationSlot) => row?.timeOfBirth || '',
      width: "80px"
    },
    {
      name: "POB",
      selector: (row: ConsultationSlot) => row?.placeOfBirth || '',
      width: "110px"
    },
    {
      name: "Partner's Name",
      selector: (row: ConsultationSlot) => row?.partnerName || '',
      width: "150px"
    },
    {
      name: "Partner's DOB",
      selector: (row: ConsultationSlot) => 
        row?.partnerDateOfBirth ? moment(row.partnerDateOfBirth).format('DD/MM/YYYY') : '',
      width: "130px"
    },
    {
      name: "Partner's TOB",
      selector: (row: ConsultationSlot) => row?.partnerTimeOfBirth || '',
      width: "130px"
    },
    {
      name: "Partner's POB",
      selector: (row: ConsultationSlot) => row?.partnerPlaceOfBirth || '',
      width: "130px"
    },

    {
      name: "Time Slot",
      selector: (row: ConsultationSlot) => row?.consultationTime || '',
      width: "150px"
    },
 
    {
      name: "Booked At",
      selector: (row: ConsultationSlot) => 
        row?.consultationDate ? moment(row.consultationDate).format('DD/MM/YYYY hh:mm A') : '',
      width: "180px"
    },
   
        {
          name: "Action",
          cell: (row: Order) => (
            <div className="flex gap-3 items-center">
              <div className="cursor-pointer" onClick={() => onView(row)}><ViewSvg /></div>
              {/* <div className="cursor-pointer" onClick={() => onEdit(row)}><EditSvg /></div> */}
            </div>
          ),
          width: "100px"
        }
  ];

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Type */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range <span className="text-red-500">*</span>
            </label>
            <select
              value={dateRangeType}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div> */}

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type <span className="text-red-500">*</span>
            </label>
            <select
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {reportPrefixes.map((report) => (
                <option key={report.value} value={report.value}>
                  {report.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <MainDatatable
         columns={columns.map((col) => ({
          ...col,
          minwidth: col.width,
          width: undefined,
        }))}
        data={filteredData}
        title="Consultation Slots"
        isLoading={loading}
        url=""
      />
  {viewOpen && activeRow && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6 relative">
      {/* Close Button */}
      <button
        onClick={() => setViewOpen(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-all z-10"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>
      
      <h2 className="text-xl font-semibold mb-6">Order Details</h2>
      
      {/* Filtered & Formatted Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formatOrderDetails(activeRow).map(({ label, value, isLong }) => (
          <div key={label} className="space-y-1">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {label}
            </div>
            <div 
              className={`font-medium text-gray-900 break-words ${
                isLong ? 'text-sm max-h-12 overflow-hidden hover:overflow-visible hover:max-h-none transition-all' : 'text-base'
              }`}
              title={isLong ? value : undefined}
            >
              {value || '—'}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end mt-8">
        <button
          onClick={() => setViewOpen(false)}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}