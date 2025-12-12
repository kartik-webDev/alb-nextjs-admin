// 'use client';
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { EditSvg, DeleteSvg } from "@/components/svgs/page";
// import MainDatatable from "@/components/common/MainDatatable";
// import moment from "moment";
// import Swal from "sweetalert2";

// interface Review {
//   _id: string;
//   customerName: string;
//   astrologerName: string;
//   rating: number;
//   type: string;
//   reviewText: string;
//   createdAt: string;
//   is_verified?: boolean;
//   reviewId?: string;
// }

// interface ApiResponse<T> {
// reviews: Review[];  success: boolean;
//   data: T;
//   message?: string;
// }

// const Review = () => {
//   const router = useRouter();
//   const [astrologersReviews, setAstrologersReviews] = useState<Review[]>([]);
//   const [loading, setLoading] = useState(true);

//   // API call functions
//   const getAstrologersReviews = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/get-all-review`);
//       const data: ApiResponse<Review[]> = await response.json();
      
//       if (data.success) {
       
//         setAstrologersReviews(data.reviews || []);
//       } else {
//         console.error('Failed to fetch reviews:', data.message);
//       }
//     } catch (error) {
//       console.error('Error fetching reviews:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteAstrologerReview = async (reviewId: string) => {
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: "You want to delete this review!",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#d1d5db',
//       confirmButtonText: 'Delete',
//       cancelButtonText: 'Cancel',
//       reverseButtons: true
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/review/delete_review`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ reviewId }),
//         });
        
//         const data = await response.json();
        
//         if (data.success) {
//           Swal.fire(
//             'Deleted!',
//             'Review has been deleted successfully.',
//             'success'
//           );
//           getAstrologersReviews();
//         } else {
//           Swal.fire(
//             'Error!',
//             data.message || 'Failed to delete review.',
//             'error'
//           );
//         }
//       } catch (error) {
//         Swal.fire(
//           'Error!',
//           'Something went wrong while deleting review.',
//           'error'
//         );
//         console.error('Error deleting review:', error);
//       }
//     }
//   };

//   const updateAstrologerReviewStatus = async (reviewId: string, status: boolean) => {
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/review/update_review_status`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           reviewId, 
//           status: status ? "Verified" : "Unverified" 
//         }),
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         Swal.fire(
//           'Updated!',
//           'Review status updated successfully.',
//           'success'
//         );
//         getAstrologersReviews();
//       } else {
//         Swal.fire(
//           'Error!',
//           data.message || 'Failed to update review status.',
//           'error'
//         );
//       }
//     } catch (error) {
//       Swal.fire(
//         'Error!',
//         'Something went wrong while updating review status.',
//         'error'
//       );
//       console.error('Error updating review status:', error);
//     }
//   };

//   const openTextModal = (title: string, text: string) => {
//     Swal.fire({
//       title: title,
//       html: `<div class="text-left max-h-96 overflow-y-auto">${text}</div>`,
//       showCloseButton: true,
//       showConfirmButton: false,
//       width: '600px',
//       customClass: {
//         popup: 'rounded-lg',
//         htmlContainer: 'text-left'
//       }
//     });
//   };

//   // DataTable Columns
//   const columns = [
//     { 
//       name: 'S.No.', 
//       selector: (row: Review, index?: number) => (index || 0) + 1, 
//       style: { paddingLeft: "20px" }, 
//       width: "80px" 
//     },
//     { 
//       name: 'Customer', 
//       selector: (row: Review) => row?.customerName || 'N/A'
//     },
//     { 
//       name: 'Astrologer', 
//       selector: (row: Review) => row?.astrologerName || 'N/A'
//     },
//     { 
//       name: 'Rating', 
//       selector: (row: Review) => (
//         <div className="flex items-center">
//           <span className="text-yellow-500"></span>
//           <span className="ml-1">{row.rating || 0}</span>
//         </div>
//       )
//     },
//     { 
//       name: 'Service', 
//       selector: (row: Review) => (
//         <div className="capitalize">{row?.type?.toLowerCase() || 'N/A'}</div>
//       )
//     },
//     { 
//       name: 'Comment', 
//       cell: (row: Review) => (
//         <div 
//           onClick={() => openTextModal('Comment', row?.reviewText || '')}
//           className="cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
//         >
//           {row?.reviewText 
//             ? row.reviewText.length > 50 
//               ? row.reviewText.substring(0, 50) + '...' 
//               : row.reviewText
//             : 'N/A'
//           }
//         </div>
//       )
//     },
//     { 
//       name: 'Date', 
//       selector: (row: Review) => moment(row.createdAt).format('DD MMM YYYY') 
//     },
//     // Uncomment if you have switch functionality
//     // { 
//     //   name: 'Status', 
//     //   cell: (row: Review) => (
//     //     <div 
//     //       onClick={() => updateAstrologerReviewStatus(row._id, !row.is_verified)}
//     //       className="cursor-pointer"
//     //     >
//     //       {row?.is_verified ? <SwitchOnSvg /> : <SwitchOffSvg />}
//     //     </div>
//     //   ), 
//     //   width: "140px" 
//     // },
//     {
//       name: 'Action',
//       cell: (row: Review) => (
//         <div className="flex gap-5 items-center">
//           <div 
//             onClick={() => router.push(`/review/add-review?edit=true&id=${row._id}`)} 
//             className="cursor-pointer hover:opacity-70 transition-opacity"
//           >
//             <EditSvg />
//           </div>
//           <div 
//             onClick={() => deleteAstrologerReview(row._id)} 
//             className="cursor-pointer hover:opacity-70 transition-opacity"
//           >
//             <DeleteSvg />
//           </div>
//         </div>
//       ),
//       width: "180px"
//     },
//   ];

//   useEffect(() => {
//     getAstrologersReviews();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <MainDatatable 
//         data={astrologersReviews} 
//         columns={columns} 
//         title={'Review'} 
//         url={'/review/add-review'}
//         isLoading={loading}
//         //  defaultSortFieldId={7} // Index of Date column
// //   defaultSortAsc={false} // false = descending (newest first)
//       />
//     </div>
//   );
// };

// export default Review;

import React from 'react'

const page = () => {
  return (
    <div className='p-20'>
      Review under progress...........
    </div>
  )
}

export default page
