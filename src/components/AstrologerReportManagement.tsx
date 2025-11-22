'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

interface ReportAstrologerFormData {
  isDealInReport: boolean;
}

export default function ReportAstrologerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const astrologerId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [astrologerName, setAstrologerName] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [form, setForm] = useState<ReportAstrologerFormData>({
    isDealInReport: false
  });
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (astrologerId) {
      fetchAstrologerData();
    }
  }, [astrologerId]);

  const fetchAstrologerData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologer_details_by_id`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ astrologerId })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const astro = data.results;
        setAstrologerName(astro.astrologerName || astro.displayName || 'Unknown');
        setIsVerified(astro.isVerified || false);
        setForm({
          isDealInReport: astro.isDealInReport || false
        });
        setSelectedReportTypes(astro.reportTypes || []);
      } else {
        Swal.fire('Error', 'Failed to load astrologer data', 'error');
      }
    } catch (error) {
      console.error('Error fetching astrologer:', error);
      Swal.fire('Error', 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (form.isDealInReport && selectedReportTypes.length === 0) {
      newErrors.reportTypes = 'Select at least one report type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Check if enabling report dealing on verified astrologer
    if (form.isDealInReport && isVerified) {
      const result = await Swal.fire({
        title: 'Warning!',
        text: 'This astrologer is currently verified for consultations. Enabling report dealing will remove their verification status. Continue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/update-report-astrologer`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            astrologerId,
            isDealInReport: form.isDealInReport,
            reportTypes: selectedReportTypes
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        await Swal.fire('Success!', result.message || 'Settings updated successfully', 'success');
        router.push('/astrologer'); // Redirect to astrologer list
      } else {
        Swal.fire('Error', result.message || 'Failed to update', 'error');
      }
    } catch (error) {
      console.error('Error updating:', error);
      Swal.fire('Error', 'Network error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF4444] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Report Astrologer Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure report writing capabilities for {astrologerName}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          {isVerified && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Note:</strong> This astrologer is currently verified for consultations. 
                Enabling report dealing will remove their verification status, as an astrologer 
                can either handle consultations OR reports, not both.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Enable Report Dealing */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDealInReport}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, isDealInReport: e.target.checked }));
                    if (!e.target.checked) {
                      setSelectedReportTypes([]);
                    }
                  }}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#EF4444] focus:ring-[#EF4444]"
                />
                <div>
                  <span className="text-base font-semibold text-gray-800 block">
                    Enable Report Writing
                  </span>
                  <span className="text-sm text-gray-600">
                    Allow this astrologer to write and deliver reports
                  </span>
                </div>
              </label>
            </div>

            {/* Report Types Selection */}
            {form.isDealInReport && (
              <div className="mb-6 p-4  bg-white">
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Assignable Report Types <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Select which report types this astrologer can handle
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {['#LJR-', '#LCR-', '#LR-', '#KM-'].map(reportType => (
                    <label 
                      key={reportType} 
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedReportTypes.includes(reportType)
                          ? 'border-[#EF4444] bg-red-50'
                          : 'border-gray-300 hover:border-[#EF4444]/50 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedReportTypes.includes(reportType)}
                        onChange={() => {
                          setSelectedReportTypes(prev =>
                            prev.includes(reportType)
                              ? prev.filter(r => r !== reportType)
                              : [...prev, reportType]
                          );
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-[#EF4444] focus:ring-[#EF4444]"
                      />
                      <div>
                        <span className="font-semibold text-gray-800 block">{reportType}</span>
                        <span className="text-xs text-gray-500">
                          {reportType === '#LJR-' && 'Life Journey Report'}
                          {reportType === '#LCR-' && 'Life Changing Report'}
                          {reportType === '#LR-' && 'Love Report'}
                          {reportType === '#KM-' && 'Kundli Matching'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                {errors.reportTypes && (
                  <p className="text-red-600 text-sm mt-2">{errors.reportTypes}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-[#EF4444] text-white rounded-md hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
