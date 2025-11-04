// // app/consultation/page.tsx
// 'use client';

// import moment from 'moment';
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   Dialog,
//   DialogContent,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
// } from '@mui/material';
// import DatatableHeading from '@/components/common/dataTable';
// import MainDatatable from '@/components/common/MainDatatable';

// // Define types for better TypeScript support
// interface PaymentDetails {
//   paymentAmount?: string;
//   paymentMethod?: string;
// }

// interface Slot {
//   fromTime?: string;
//   toTime?: string;
// }

// interface Customer {
//   email?: string;
// }

// interface Astrologer {
//   astrologerName?: string;
// }

// interface Consultation {
//   _id: string;
//   astrologerId?: Astrologer;
//   fullName?: string;
//   customerId?: Customer;
//   mobileNumber?: string;
//   dateOfBirth?: string;
//   timeOfBirth?: string;
//   placeOfBirth?: string;
//   date?: string;
//   slotId?: Slot;
//   consultationType?: string;
//   consultationTopic?: string;
//   paymentDetails?: PaymentDetails;
//   status?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface ApiResponse {
//   success: boolean;
//   bookings?: Consultation[];
//   totalPages?: number;
//   currentPage?: number;
// }

// interface Filters {
//   status: string;
//   customerName: string;
//   astrologerName: string;
//   startDate: string;
//   endDate: string;
// }

// export default function Consultation() {
//   const router = useRouter();

//   // State
//   const [consultationData, setConsultationData] = useState<Consultation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState<Filters>({
//     status: '',
//     customerName: '',
//     astrologerName: '',
//     startDate: '',
//     endDate: ''
//   });

//   const [pagination, setPagination] = useState({
//     totalPages: 1,
//     currentPage: 1,
//     limit: 10
//   });

//   // Fetch data on mount and when filters change
//   useEffect(() => {
//     const fetchConsultations = async () => {
//       try {
//         setLoading(true);
//         const query = new URLSearchParams({
//           ...filters,
//           page: pagination.currentPage.toString(),
//           limit: pagination.limit.toString()
//         });

//         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/all_consultations_booking?status=&customerName=&astrologerName=&startDate=&endDate=&page=1&limit=10`);
//         const data: ApiResponse = await res.json();

//         if (data.success && Array.isArray(data.bookings)) {
//           setConsultationData(data.bookings);
//           setPagination(prev => ({
//             ...prev,
//             totalPages: data?.totalPages || 1,
//             currentPage: data?.currentPage || 1
//           }));
//         } else {
//           console.error('Invalid API response structure');
//           setConsultationData([]);
//         }
//       } catch (error) {
//         console.error('Failed to fetch consultation data:', error);
//         setConsultationData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConsultations();
//   }, [filters, pagination.currentPage]);

//   const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//     setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when filters change
//   };

//   const handlePageChange = (page: number) => {
//     setPagination(prev => ({ ...prev, currentPage: page }));
//   };

//   // Table Columns
//   const columns = [
//     { 
//   name: 'S.No.', 
//   selector: (row: Consultation) => consultationData.indexOf(row) + 1, 
//   width: '80px' 
// },
//     {
//       name: 'Astrologer',
//       selector: (row: Consultation) => row?.astrologerId?.astrologerName || 'N/A',
//       width: '200px'
//     },
//     {
//       name: 'Customer Name',
//       selector: (row: Consultation) => row?.fullName || 'N/A',
//       width: '200px'
//     },
//     {
//       name: 'Customer Email',
//       selector: (row: Consultation) => row?.customerId?.email || 'N/A',
//       width: '250px'
//     },
//     {
//       name: 'Mobile',
//       selector: (row: Consultation) => row?.mobileNumber || 'N/A',
//       width: '150px'
//     },
//     {
//       name: 'DOB / TOB',
//       selector: (row: Consultation) => `${row?.dateOfBirth || 'N/A'} / ${row?.timeOfBirth || 'N/A'}`,
//       width: '180px'
//     },
//     {
//       name: 'POB',
//       selector: (row: Consultation) => row?.placeOfBirth || 'N/A',
//       width: '150px'
//     },
//     {
//       name: 'Date',
//       selector: (row: Consultation) => moment(row?.date).format('DD-MM-YYYY'),
//       width: '130px'
//     },
//     {
//       name: 'Slot',
//       selector: (row: Consultation) => `${row?.slotId?.fromTime || ''} - ${row?.slotId?.toTime || ''}`,
//       width: '150px'
//     },
//     {
//       name: 'Type',
//       selector: (row: Consultation) => row?.consultationType || 'N/A',
//       width: '150px'
//     },
//     {
//       name: 'Topic',
//       selector: (row: Consultation) => row?.consultationTopic || 'N/A',
//       width: '150px'
//     },
//     {
//       name: 'Amount',
//       selector: (row: Consultation) => row?.paymentDetails?.paymentAmount || 'N/A',
//       width: '120px'
//     },
//     {
//       name: 'Mode',
//       selector: (row: Consultation) => row?.paymentDetails?.paymentMethod || 'N/A',
//       width: '120px'
//     },
//     {
//       name: 'Status',
//       selector: (row: Consultation) => (
//         <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${row?.status === 'completed'
//             ? 'bg-green-100 text-green-800'
//             : row?.status === 'cancelled'
//               ? 'bg-red-100 text-red-800'
//               : row?.status === 'booked'
//                 ? 'bg-blue-100 text-blue-800'
//                 : 'bg-gray-100 text-gray-800'
//           }`}>
//           <span className={`w-2 h-2 rounded-full mr-2 ${row?.status === 'completed'
//               ? 'bg-green-500'
//               : row?.status === 'cancelled'
//                 ? 'bg-red-500'
//                 : row?.status === 'booked'
//                   ? 'bg-blue-500'
//                   : 'bg-gray-500'
//             }`}></span>
//           {row?.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'N/A'}
//         </div>
//       ),
//       width: '120px'
//     },
//     {
//       name: 'Action',
//       cell: (row: Consultation) => (
//         <div className="flex gap-3 justify-center items-center">
//           <div
//             onClick={() => router.push(`/consultation/view-consultation?id=${row._id}`)}
//             className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors text-sm"
//           >
//             View
//           </div>
//           <div
//             onClick={() => router.push(`/consultation/edit-consultation?id=${row._id}`)}
//             className="cursor-pointer text-green-600 hover:text-green-800 transition-colors text-sm"
//           >
//             Edit
//           </div>
//         </div>
//       ),
//       width: "120px"
//     },
//   ];

//   return (
//     <>
//       <div className="p-5 bg-white mb-5 rounded-lg border border-gray-200">
//         <DatatableHeading
//           title="Consultation Bookings"
//           data={consultationData}
//         />

//         {/* Filter Section */}
//         <div className="flex flex-wrap gap-3 mb-5 bg-white">
//           <select
//             name="status"
//             value={filters.status}
//             onChange={handleFilterChange}
//             className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
//           >
//             <option value="">All Status</option>
//             <option value="booked">Upcoming</option>
//             <option value="completed">Completed</option>
//             <option value="cancelled">Cancelled</option>
//             <option value="expired">Expired</option>
//           </select>

//           <input
//             type="text"
//             placeholder="Customer Name"
//             name="customerName"
//             value={filters.customerName}
//             onChange={handleFilterChange}
//             className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
//           />

//           <input
//             type="text"
//             placeholder="Astrologer Name"
//             name="astrologerName"
//             value={filters.astrologerName}
//             onChange={handleFilterChange}
//             className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
//           />

//           <input
//             type="date"
//             name="startDate"
//             value={filters.startDate}
//             onChange={handleFilterChange}
//             className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
//           />
//           <input
//             type="date"
//             name="endDate"
//             value={filters.endDate}
//             onChange={handleFilterChange}
//             className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
//           />
//         </div>

//         <MainDatatable
//           columns={columns}
//           data={consultationData}
//           isLoading={loading}
//           // pagination={{
//           //   totalPages: pagination.totalPages,
//           //   currentPage: pagination.currentPage,
//           //   onPageChange: handlePageChange
//           // }}
//         />
//         {pagination.totalPages > 1 && (
//   <div className="flex justify-center mt-5 space-x-2">
//     {Array.from({ length: pagination.totalPages }, (_, i) => (
//       <button
//         key={i}
//         onClick={() => handlePageChange(i + 1)}
//         className={`px-3 py-1 border rounded-md text-sm font-medium ${
//           pagination.currentPage === i + 1
//             ? 'bg-blue-600 text-white border-blue-600'
//             : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//         }`}
//       >
//         {i + 1}
//       </button>
//     ))}
//   </div>
// )}
//       </div>
//     </>
//   );
// }


'use client';

import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatatableHeading from '@/components/common/dataTable';
import MainDatatable from '@/components/common/MainDatatable';

interface PaymentDetails {
  paymentAmount?: string;
  paymentMethod?: string;
}

interface Slot {
  fromTime?: string;
  toTime?: string;
}

interface Customer {
  email?: string;
}

interface Astrologer {
  astrologerName?: string;
}

interface Consultation {
  _id: string;
  astrologerId?: Astrologer;
  fullName?: string;
  customerId?: Customer;
  mobileNumber?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  date?: string;
  slotId?: Slot;
  consultationType?: string;
  consultationTopic?: string;
  paymentDetails?: PaymentDetails;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  success: boolean;
  bookings?: Consultation[];
  totalPages?: number;
  currentPage?: number;
}

interface Filters {
  status: string;
  customerName: string;
  astrologerName: string;
  startDate: string;
  endDate: string;
}

export default function Consultation() {
  const router = useRouter();

  const [consultationData, setConsultationData] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    customerName: '',
    astrologerName: '',
    startDate: '',
    endDate: ''
  });

  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  const fetchConsultations = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        ...(filters.status && { status: filters.status }),
        ...(filters.customerName && { customerName: filters.customerName }),
        ...(filters.astrologerName && { astrologerName: filters.astrologerName }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/all_consultations_booking?${query.toString()}`);
      const data: ApiResponse = await res.json();

      if (data.success && Array.isArray(data.bookings)) {
        setConsultationData(data.bookings);
        setPagination(prev => ({
          ...prev,
          totalPages: data.totalPages || 1,
          currentPage: data.currentPage || 1
        }));
      } else {
        setConsultationData([]);
      }
    } catch (error) {
      console.error('Failed to fetch consultation data:', error);
      setConsultationData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [filters, pagination.currentPage]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const columns = [
    { name: 'S.No.', selector: (row: Consultation) => consultationData.indexOf(row) + 1, width: '60px' },
    { name: 'Astrologer', selector: (row: Consultation) => row?.astrologerId?.astrologerName || 'N/A', sortable: true },
    { name: 'Customer', selector: (row: Consultation) => row?.fullName || 'N/A', sortable: true },
    { name: 'Email', selector: (row: Consultation) => row?.customerId?.email || 'N/A' },
    { name: 'Mobile', selector: (row: Consultation) => row?.mobileNumber || 'N/A' },
    { name: 'DOB/TOB', selector: (row: Consultation) => `${row?.dateOfBirth || ''} / ${row?.timeOfBirth || ''}` },
    { name: 'POB', selector: (row: Consultation) => row?.placeOfBirth || 'N/A' },
    { name: 'Date', selector: (row: Consultation) => moment(row?.date).format('DD-MM-YYYY') },
    { name: 'Slot', selector: (row: Consultation) => `${row?.slotId?.fromTime || ''} - ${row?.slotId?.toTime || ''}` },
    { name: 'Type', selector: (row: Consultation) => row?.consultationType || 'N/A' },
    { name: 'Topic', selector: (row: Consultation) => row?.consultationTopic || 'N/A' },
    { name: 'Amount', selector: (row: Consultation) => row?.paymentDetails?.paymentAmount || 'N/A' },
    { name: 'Mode', selector: (row: Consultation) => row?.paymentDetails?.paymentMethod || 'N/A' },
    {
      name: 'Status',
      selector: (row: Consultation) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          row?.status === 'completed' ? 'bg-green-100 text-green-700' :
          row?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          row?.status === 'booked' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row?.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'N/A'}
        </span>
      ),
    },
    // {
    //   name: 'Action',
    //   cell: (row: Consultation) => (
    //     <div className="flex gap-3">
    //       <button onClick={() => router.push(`/consultation/view-consultation?id=${row._id}`)} className="text-blue-600 hover:underline text-sm">
    //         View
    //       </button>
    //       <button onClick={() => router.push(`/consultation/edit-consultation?id=${row._id}`)} className="text-green-600 hover:underline text-sm">
    //         Edit
    //       </button>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="p-5 bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <DatatableHeading title="Consultation Bookings" data={consultationData} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2 border rounded-md text-sm">
          <option value="">All Status</option>
          <option value="booked">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>

        <input type="text" placeholder="Customer Name" name="customerName" value={filters.customerName} onChange={handleFilterChange} className="px-3 py-2 border rounded-md text-sm" />
        <input type="text" placeholder="Astrologer Name" name="astrologerName" value={filters.astrologerName} onChange={handleFilterChange} className="px-3 py-2 border rounded-md text-sm" />
        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="px-3 py-2 border rounded-md text-sm" />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="px-3 py-2 border rounded-md text-sm" />
      </div>

      {/* Table */}
      <MainDatatable columns={columns} data={consultationData} isLoading={loading} title="Consultation Bookings" />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-5 flex-wrap gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 border rounded-md text-sm font-medium ${
                pagination.currentPage === i + 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
