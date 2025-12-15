// 'use client';

// import React, { useEffect, useState } from 'react';
// import moment from 'moment';
// import MainDatatable from '@/components/common/MainDatatable';
// import { Tooltip } from '@mui/material';

// // Types
// interface CustomerDetails {
//   _id: string;
//   customerName: string;
//   email: string;
// }

// interface AstrologerDetails {
//   _id: string;
//   astrologerName: string;
//   email?: string;
// }

// interface AdminEarningRow {
//   _id: string;
//   type: string;
//   astrologerId: string | null | AstrologerDetails;
//   customerId: CustomerDetails | null;
//   customerName: string | null | CustomerDetails
//   customerEmail: string | null | CustomerDetails
//   astrologerName: string | null | AstrologerDetails
//   transactionId: string;
//   totalPrice: string;
//   adminPrice: string;
//   partnerPrice: string;
//   duration: number;
//   chargePerMinutePrice: number;
//   startTime: string;
//   endTime: string;
//   transactionType: string;
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
// }

// interface ApiResponse {
//   success: boolean;
//   history: AdminEarningRow[];
// }

// // Utility functions
// const IndianRupee = (amount: string | number): string => {
//   const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(numAmount);
// };

// // API function to fetch admin earnings
// const getAdminEarnings = async (): Promise<AdminEarningRow[]> => {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/admin/get_admin_earnig_history`
//     );
//     if (!response.ok) {
//       throw new Error('Failed to fetch admin earnings');
//     }

//     const data: ApiResponse = await response.json();

  
//     const sortedHistory = (data.history || []).sort(
//       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );

//     return sortedHistory;
//   } catch (error) {
//     console.error('Error fetching admin earnings:', error);
//     return [];
//   }
// };

// // Helper function to get astrologer name
// const getAstrologerName = (astrologerId: string | null | AstrologerDetails): string => {
//   if (!astrologerId) return 'N/A';
//   if (typeof astrologerId === 'object' && astrologerId !== null) {
//     return (astrologerId as AstrologerDetails).astrologerName || 'N/A';
//   }
//   return 'N/A';
// };

// // Helper function to format type
// const formatType = (type: string): string => {
//   if (type === 'live_video_call') return 'Live Call';
//   return type.charAt(0).toUpperCase() + type.slice(1);
// };

// const AdminEarning: React.FC = () => {
//   const [adminEarningData, setAdminEarningData] = useState<AdminEarningRow[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true);

//   // DataTable Columns
//   const columns = [
//     {
//       name: '',
//       selector: (row: AdminEarningRow, rowIndex?: number) => (rowIndex ?? 0) + 1,
//       width: '80px',
//       omit: false, // CSV mein S.No. include hoga
//     },
//     {
//       name: 'Type',
//       selector: (row: AdminEarningRow) => formatType(row?.type),
//       cell: (row: AdminEarningRow) => (
//         <div style={{ textTransform: 'capitalize' }}>
//           {formatType(row?.type)}
//         </div>
//       ),
//       width: '120px',
//       export: true,
//     },
//     {
//       name: 'Astrologer ID',
//       selector: (row: AdminEarningRow) => {
//         if (!row?.astrologerId) return 'N/A';
//         if (typeof row.astrologerId === 'object' && row.astrologerId !== null) {
//           return (row.astrologerId as AstrologerDetails)._id || 'N/A';
//         }
//         return row.astrologerId || 'N/A';
//       },
//       omit: true, // UI mein nahi dikhega
//       export: true, // CSV mein include hoga
//     },
//     {
//       name: 'Astrologers',
//       selector: (row: AdminEarningRow) => getAstrologerName(row?.astrologerId),
//       width: '120px',
//       export: true,
//     },
//     {
//       name: 'Customer ID',
//       selector: (row: AdminEarningRow) => row?.customerId?._id || 'N/A',
//       omit: true, // UI mein nahi dikhega
//       export: true, // CSV mein include hoga
//     },
//     {
//       name: 'Customer Name',
//       selector: (row: AdminEarningRow) => row?.customerId?.customerName || 'N/A',
//       width: '140px',
//       export: true,
//     },
//     {
//       name: "Customer's Email",
//       cell: (row: AdminEarningRow) => {
//         const email = row?.customerId?.email?.trim() || "N/A";
//         return (
//           <Tooltip title={email}>
//             <span className="truncate block w-full">{email}</span>
//           </Tooltip>
//         );
//       },
//       width: "150px",
//     },
//     {
//       name: 'Total Price',
//       selector: (row: AdminEarningRow) => row?.totalPrice,
//       cell: (row: AdminEarningRow) => IndianRupee(row?.totalPrice),
//       export: true,
//       // CSV ke liye plain number format
//       format: (row: AdminEarningRow) => row?.totalPrice || '0',
//     },
//     {
//       name: 'Admin Share',
//       selector: (row: AdminEarningRow) => row?.adminPrice,
//       cell: (row: AdminEarningRow) => IndianRupee(row?.adminPrice),
//       width: '120px',
//       export: true,
//       format: (row: AdminEarningRow) => row?.adminPrice || '0',
//     },
//     {
//       name: 'Astro Share',
//       selector: (row: AdminEarningRow) => row?.partnerPrice,
//       cell: (row: AdminEarningRow) => IndianRupee(row?.partnerPrice),
//       width: '120px',
//       export: true,
//       format: (row: AdminEarningRow) => row?.partnerPrice || '0',
//     },
//     {
//       name: 'Duration (min)',
//       selector: (row: AdminEarningRow) => row?.duration || 0,
//       cell: (row: AdminEarningRow) => (row?.duration ? `${row.duration} min` : 'N/A'),
//       export: true,
//       format: (row: AdminEarningRow) => row?.duration?.toString() || '0',
//     },
//     {
//       name: 'Start Time',
//       selector: (row: AdminEarningRow) => row?.startTime || 'N/A',
//       cell: (row: AdminEarningRow) => row?.startTime || 'N/A',
//       export: true,
//     },
//     {
//       name: 'End Time',
//       selector: (row: AdminEarningRow) => row?.endTime || 'N/A',
//       cell: (row: AdminEarningRow) => row?.endTime || 'N/A',
//       export: true,
//     },
//     {
//       name: 'Date',
//       selector: (row: AdminEarningRow) => row?.createdAt || '',
//       cell: (row: AdminEarningRow) =>
//         row?.createdAt ? moment(row?.createdAt).format('DD/MM/YYYY') : 'N/A',
//       width: '120px',
//       export: true,
//       format: (row: AdminEarningRow) => 
//         row?.createdAt ? moment(row?.createdAt).format('DD/MM/YYYY') : 'N/A',
//     },
//     {
//       name: 'Transaction ID',
//       selector: (row: AdminEarningRow) => row?.transactionId || 'N/A',
//       omit: true, // Table mein nahi dikhega
//       export: true, // But CSV mein include hoga
//     },
//   ];

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       const data = await getAdminEarnings();
//       setAdminEarningData(data);
//       setIsLoading(false);
//     };

//     fetchData();
//   }, []);

//   return (
//     <>
//       <div>
//         <MainDatatable
//           data={adminEarningData}
//           columns={columns}
//           title="Admin Earning"
//           isLoading={isLoading}
//           exportHeaders={true}
//           fileName="Admin_Earnings_Report"
//         />
//       </div>
//     </>
//   );
// };

// export default AdminEarning;

import React from 'react'

const page = () => {
  return (
    <div>
      Admin Earning in progress.........
    </div>
  )
}

export default page
