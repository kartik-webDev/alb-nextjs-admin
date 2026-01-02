'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  faqs: any[];
  setFaqs: (data: any[]) => void;
  addItem: any;
  updateItem: any;
  removeItem: any;
  fieldErrors?: Record<string, string>;
}

const FAQsTab: React.FC<Props> = ({
  faqs,
  setFaqs,
  addItem,
  updateItem,
  removeItem,
  fieldErrors = {}
}) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Auto-expand when new FAQ is added or if question/answer is empty
  useEffect(() => {
    const lastFAQ = faqs[faqs.length - 1];
    if (lastFAQ && (!lastFAQ.question || !lastFAQ.answer)) {
      setExpandedFAQ(lastFAQ.id);
    }
  }, [faqs]);

  const commonFAQs = [
    {
      question: "How long does the puja take?",
      answer: "The puja typically takes 2-3 hours, including preparation time. The exact duration may vary based on specific rituals and customization."
    },
    {
      question: "What materials are needed for the puja?",
      answer: "All essential materials are provided by our pandits. You only need to arrange basic items like flowers, fruits, and incense as per your convenience. A detailed list will be shared before the puja."
    },
    {
      question: "Can the puja be performed remotely?",
      answer: "Yes, we offer both in-person and remote puja options. For remote pujas, our pandit will guide you through the process via video call and perform rituals on your behalf."
    },
    {
      question: "Is a pandit included in the package?",
      answer: "Yes, an experienced pandit is included in all our packages. They bring all necessary materials and guide you through the entire process."
    }
  ];

  const applyFAQTemplate = (faq: any) => {
    const newId = faqs.length > 0 ? Math.max(...faqs.map(item => item.id)) + 1 : 1;
    const newFAQ = {
      id: newId,
      question: faq.question,
      answer: faq.answer
    };
    setFaqs([...faqs, newFAQ]);
    setExpandedFAQ(newId); // Auto-expand the new FAQ
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Frequently Asked Questions</h2>
          {/* <p className="text-sm text-gray-600 mt-1">
            Address common questions to help devotees make informed decisions (Optional)
          </p> */}
        </div>
        <div className="flex items-center gap-3">
          {/* <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            {showTemplates ? 'Hide Templates' : 'Show Templates'}
          </button> */}
          <button
            type="button"
            onClick={() => {
              addItem(faqs, setFaqs, { 
                question: '', 
                answer: '' 
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>
      </div>

      {/* General error for faqs array */}
      {fieldErrors['faqs'] && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-red-600 text-sm">{fieldErrors['faqs']}</p>
        </div>
      )}

      {/* Common FAQ Templates */}
      {showTemplates && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Common FAQ Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonFAQs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => applyFAQTemplate(faq)}>
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{faq.answer}</p>
                    <div className="mt-3 text-sm text-red-600 font-medium">Click to add</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const questionError = fieldErrors[`faqs.${index}.question`];
          const answerError = fieldErrors[`faqs.${index}.answer`];
          const isExpanded = expandedFAQ === faq.id;

          return (
            <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* FAQ Header */}
              <div className="bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-red-600">Q{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateItem(faqs, setFaqs, faq.id, 'question', e.target.value)}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-medium transition-all ${
                            questionError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                          }`}
                          placeholder="Enter the question..."
                          required
                        />
                        {questionError && (
                          <p className="text-red-500 text-xs mt-1.5">{questionError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(faqs, setFaqs, faq.id)}
                      disabled={faqs.length <= 1}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Answer Section */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Provide detailed, helpful response)</span>
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateItem(faqs, setFaqs, faq.id, 'answer', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[120px] transition-all ${
                      answerError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                    }`}
                    placeholder="Provide a clear, detailed answer to the question..."
                    required
                  />
                  {answerError && (
                    <p className="text-red-500 text-xs mt-1.5">{answerError}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQsTab;