// 'use client'
// import React, { useState, useEffect } from 'react';
// import StaticPageEditor from '@/components/StaticPageEditor';
// import { base_url } from '@/lib/api-routes';

// const AboutUsPage: React.FC = () => {
//   const [content, setContent] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);

//   const getEndpoint = `${base_url}api/admin/get-about-us`;
//   const createEndpoint = `${base_url}api/admin/add-about-us`;

//   // Fetch data on mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(getEndpoint, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             // Add auth token if needed
//             // 'Authorization': `Bearer ${token}`
//           },
//         });

//         if (!response.ok) throw new Error('Failed to fetch data');

//         const data = await response.json();
//         setContent(data?.about?.description || '');
//       } catch (error) {
//         console.error('Error fetching about us:', error);
//         setContent('');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <StaticPageEditor
//       title="About Us"
//       initialContent={content}
//       createEndpoint={createEndpoint}
//       hasTypeSelector={false}
//       loading={loading}
//     />
//   );
// };

// export default AboutUsPage;

import React from 'react'

const page = () => {
  return (
    <div className='p-20'>
      About us under progress...........
    </div>
  )
}

export default page
