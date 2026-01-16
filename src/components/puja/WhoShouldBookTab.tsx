'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  whoShouldBook: string[];
  setWhoShouldBook: (data: string[]) => void;
  fieldErrors?: Record<string, string>;
}

const WhoShouldBookTab: React.FC<Props> = ({
  whoShouldBook,
  setWhoShouldBook,
  fieldErrors = {}
}) => {
  const handleAdd = () => {
    if (whoShouldBook.length < 10) {
      setWhoShouldBook([...whoShouldBook, '']);
    }
  };

  const handleUpdate = (index: number, value: string) => {
    const updated = [...whoShouldBook];
    updated[index] = value;
    setWhoShouldBook(updated);
  };

  const handleRemove = (index: number) => {
    if (whoShouldBook.length > 1) {
      const filtered = whoShouldBook.filter((_, i) => i !== index);
      setWhoShouldBook(filtered);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Who Should Book This Puja</h2>
          <p className="text-sm text-gray-600 mt-1">
            Specify target audience who will benefit most from this puja (Max 10)
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={whoShouldBook.length >= 10}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Category ({whoShouldBook.length}/10)
        </button>
      </div>

      {/* General error for whoShouldBook array */}
      {fieldErrors['whoShouldBook'] && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-red-600 text-sm">{fieldErrors['whoShouldBook']}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {whoShouldBook.map((description, index) => {
          const errorKey = `whoShouldBook.${index}`;
          const hasError = fieldErrors[errorKey];
          
          return (
            <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category {index + 1} <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500">{index + 1}/{whoShouldBook.length}</span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => handleUpdate(index, e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[100px] transition-all ${
                      hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                    }`}
                    placeholder="Example: Students, Business owners, New couples, etc."
                    required
                  />
                  {hasError && (
                    <p className="text-red-500 text-xs mt-1.5">{hasError}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={whoShouldBook.length <= 1}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mt-7"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhoShouldBookTab;