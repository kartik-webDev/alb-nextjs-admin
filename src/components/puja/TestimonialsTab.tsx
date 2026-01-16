'use client';

import React from 'react';
import { MessageSquare, Plus, Trash2, Star, Verified } from 'lucide-react';

interface Props {
  testimonials: any[];
  setTestimonials: (data: any[]) => void;
  addItem: any;
  updateItem: any;
  removeItem: any;
  fieldErrors?: Record<string, string>;
}

const TestimonialsTab: React.FC<Props> = ({
  testimonials,
  setTestimonials,
  addItem,
  updateItem,
  removeItem,
  fieldErrors = {}
}) => {
  const generateStars = (rating: number = 5) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  // Sample template - only one now
  const sampleTemplate = {
    highlight: "Life-changing experience!",
    quote: "After performing this puja, I noticed significant positive changes in my life. My career took a new turn and family harmony improved dramatically.",
    name: "Priya Sharma",
    location: "Delhi"
  };

  const addTemplateAsFirst = () => {
    // Check if first testimonial is empty
    const firstIsEmpty = testimonials.length === 1 && 
                        !testimonials[0].highlight && 
                        !testimonials[0].quote && 
                        !testimonials[0].name && 
                        !testimonials[0].location;
    
    if (firstIsEmpty) {
      // Replace first empty testimonial
      const updated = [{
        id: testimonials[0].id,
        ...sampleTemplate,
        rating: 5,
        verified: true,
        date: new Date().toISOString().split('T')[0]
      }];
      setTestimonials(updated);
    } else {
      // Add as new testimonial at the END (last mein)
      const newId = testimonials.length > 0 ? Math.max(...testimonials.map(item => item.id)) + 1 : 1;
      setTestimonials([...testimonials, {
        id: newId,
        ...sampleTemplate,
        rating: 5,
        verified: true,
        date: new Date().toISOString().split('T')[0]
      }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Customer Testimonials</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add authentic testimonials to build trust and credibility (Optional)
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const newTestimonial = { 
              highlight: '', 
              quote: '', 
              name: '', 
              location: '',
              rating: 5,
              verified: true,
              date: new Date().toISOString().split('T')[0]
            };
            // Last mein add karega (end of array)
            const updatedTestimonials = [...testimonials, {
              ...newTestimonial,
              id: testimonials.length > 0 ? Math.max(...testimonials.map(item => item.id)) + 1 : 1
            }];
            setTestimonials(updatedTestimonials);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* General error for testimonials array */}
      {fieldErrors['testimonials'] && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-red-600 text-sm">{fieldErrors['testimonials']}</p>
        </div>
      )}

      <div className="space-y-6">
        {testimonials.map((testimonial, index) => {
          const highlightError = fieldErrors[`testimonials.${index}.highlight`];
          const quoteError = fieldErrors[`testimonials.${index}.quote`];
          const nameError = fieldErrors[`testimonials.${index}.name`];
          const locationError = fieldErrors[`testimonials.${index}.location`];

          return (
            <div key={testimonial.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Testimonial #{testimonial.id}</h3>
                    <p className="text-xs text-gray-500">Customer feedback</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {testimonial.verified && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <Verified className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(testimonials, setTestimonials, testimonial.id)}
                    disabled={testimonials.length <= 1}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Highlight Quote */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highlight Quote
                    <span className="text-xs text-gray-500 ml-2">(Short impactful quote)</span>
                  </label>
                  <input
                    type="text"
                    value={testimonial.highlight}
                    onChange={(e) => updateItem(testimonials, setTestimonials, testimonial.id, 'highlight', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-medium transition-all ${
                      highlightError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                    }`}
                    placeholder="e.g., 'This puja changed my life completely!'"
                  />
                  {highlightError && (
                    <p className="text-red-500 text-xs mt-1.5">{highlightError}</p>
                  )}
                </div>

                {/* Full Testimonial */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Testimonial <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Detailed experience)</span>
                  </label>
                  <textarea
                    value={testimonial.quote}
                    onChange={(e) => updateItem(testimonials, setTestimonials, testimonial.id, 'quote', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[120px] transition-all ${
                      quoteError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                    }`}
                    placeholder="Share the full experience in their own words..."
                    required
                  />
                  {quoteError && (
                    <p className="text-red-500 text-xs mt-1.5">{quoteError}</p>
                  )}
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => updateItem(testimonials, setTestimonials, testimonial.id, 'name', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                      nameError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                    }`}
                    placeholder="e.g., Rajesh Kumar"
                    required
                  />
                  {nameError && (
                    <p className="text-red-500 text-xs mt-1.5">{nameError}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={testimonial.location}
                    onChange={(e) => updateItem(testimonials, setTestimonials, testimonial.id, 'location', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                      locationError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                    }`}
                    placeholder="e.g., Mumbai, India"
                    required
                  />
                  {locationError && (
                    <p className="text-red-500 text-xs mt-1.5">{locationError}</p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5 stars)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {generateStars(testimonial.rating || 5)}
                    </div>
                    <select
                      value={testimonial.rating || 5}
                      onChange={(e) => updateItem(testimonials, setTestimonials, testimonial.id, 'rating', parseInt(e.target.value))}
                      className="ml-2 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} stars</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Verified & Date */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testimonial.verified !== false}
                      onChange={(e) => updateItem(testimonials, setTestimonials, testimonial.id, 'verified', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as Verified</span>
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={testimonial.date || new Date().toISOString().split('T')[0]}
                      onChange={(e) => updateItem(testimonials, setTestimonials, testimonial.id, 'date', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Sample Template */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Sample Testimonial Template</h3>
        <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 cursor-pointer bg-gradient-to-br from-white to-red-50"
          onClick={addTemplateAsFirst}>
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {generateStars(5)}
                </div>
                <span className="text-xs text-green-600 font-medium">✓ Verified</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2 text-lg">"{sampleTemplate.highlight}"</h4>
              <p className="text-sm text-gray-600 mb-3">{sampleTemplate.quote}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">{sampleTemplate.name}</span>
              <span className="mx-2">•</span>
              <span>{sampleTemplate.location}</span>
            </div>
            <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
              <Plus className="w-4 h-4" />
              Click to add
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsTab;