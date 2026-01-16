'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface Props {
  inputFieldDetail: any;
  handleInputChange: (e: any) => void;
  fieldErrors?: Record<string, string>;
}

const DetailsTab: React.FC<Props> = ({ 
  inputFieldDetail, 
  handleInputChange,
  fieldErrors = {}
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-800">Puja Details & Information</h2>
      </div>

      <div className="space-y-6">
        {/* Puja Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puja Details <span className="text-red-500">*</span>
          </label>
          <textarea
            name="pujaDetails"
            value={inputFieldDetail.pujaDetails}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[150px] transition-all ${
              fieldErrors['pujaDetails'] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
            }`}
            placeholder="Step-by-step puja procedure, rituals, and materials required (minimum 20 characters)..."
            required
          />
          {fieldErrors['pujaDetails'] && (
            <p className="text-red-500 text-xs mt-1.5">{fieldErrors['pujaDetails']}</p>
          )}
        </div>

        {/* Why Perform */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Why Perform This Puja <span className="text-red-500">*</span>
          </label>
          <textarea
            name="whyPerform"
            value={inputFieldDetail.whyPerform}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[100px] transition-all ${
              fieldErrors['whyPerform'] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
            }`}
            placeholder="Explain the significance and benefits (minimum 20 characters)..."
            required
          />
          {fieldErrors['whyPerform'] && (
            <p className="text-red-500 text-xs mt-1.5">{fieldErrors['whyPerform']}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;