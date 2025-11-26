// app/astrologer/edit-report-astrologer/page.tsx
import ReportAstrologerForm from '@/components/AstrologerReportManagement';
import { Suspense } from 'react';
import React from 'react';

const Page = () => {
  return (
    <div>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-500"></div>
        </div>
      }>
        <ReportAstrologerForm />
      </Suspense>
    </div>
  );
};

export default Page;
