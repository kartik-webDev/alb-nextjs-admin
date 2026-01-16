'use client';

import React from 'react';
import { Shield, Phone, Mail, Clock, Target, Users } from 'lucide-react';

interface Props {
  trustCTA: any;
  setTrustCTA: (data: any) => void;
}

const TrustCTATab: React.FC<Props> = ({ trustCTA, setTrustCTA }) => {
  const handleInputChange = (field: string, value: string) => {
    setTrustCTA((prev: any) => ({ ...prev, [field]: value }));
  };

  const trustElements = [
    {
      title: "5000+ Devotees Trusted",
      description: "Join our growing community of satisfied devotees",
      icon: <Users className="w-5 h-5" />
    },
    {
      title: "24/7 Support",
      description: "Our team is always here to help you",
      icon: <Clock className="w-5 h-5" />
    },
    {
      title: "Verified Pandits",
      description: "All pandits are thoroughly verified and experienced",
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: "Personalized Guidance",
      description: "Get solutions tailored to your situation",
      icon: <Target className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Trust & Call-to-Action Section</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure the trust-building section that appears at the bottom of the puja page
        </p>
      </div>

      {/* Trust Elements */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Trust Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {trustElements.map((element, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="text-red-600">
                    {element.icon}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{element.title}</div>
                  <div className="text-xs text-gray-500">{element.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Configuration */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Call-to-Action Configuration</h3>
          <p className="text-sm text-gray-600 mb-6">
            This section encourages devotees to take action and get personalized guidance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trust Badge Text
            </label>
            <input
              type="text"
              value={trustCTA.badge}
              onChange={(e) => handleInputChange('badge', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="e.g., TRUSTED BY 5000+ DEVOTEES"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTA Title
            </label>
            <input
              type="text"
              value={trustCTA.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="e.g., Need Personal Guidance?"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={trustCTA.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none min-h-[80px]"
              placeholder="Brief description of what they'll get by contacting"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="text"
              value={trustCTA.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="+91 9876543210"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={trustCTA.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="support@example.com"
            />
          </div>

          {/* CTA Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={trustCTA.ctaText}
              onChange={(e) => handleInputChange('ctaText', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="e.g., Book a Call Now"
            />
          </div>

          {/* Footer Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Note
            </label>
            <input
              type="text"
              value={trustCTA.footerNote}
              onChange={(e) => handleInputChange('footerNote', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="e.g., Mon-Sun, 9 AM - 9 PM"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Live Preview</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gradient-to-br from-red-50 to-pink-50">
          <div className="max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-block mb-6">
              <div className="px-4 py-2 bg-white border border-red-200 rounded-full">
                <span className="text-sm font-semibold text-red-700">{trustCTA.badge}</span>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{trustCTA.title}</h2>
              <p className="text-lg text-gray-700 mb-6">{trustCTA.description}</p>
              
              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-600" />
                  <span className="text-lg font-semibold text-gray-800">{trustCTA.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-600" />
                  <span className="text-lg font-semibold text-gray-800">{trustCTA.email}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="px-8 py-3 bg-red-600 text-white text-lg font-semibold rounded-full hover:bg-red-700 transition-colors shadow-lg">
                {trustCTA.ctaText}
              </button>
              
              {/* Footer */}
              <div className="mt-6 text-sm text-gray-600">
                {trustCTA.footerNote}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Urgent Help",
              badge: "URGENT GUIDANCE AVAILABLE",
              title: "Need Immediate Help?",
              description: "Talk to our expert acharya now for urgent solutions",
              phone: "+91 9998887777",
              ctaText: "Get Help Now"
            },
            {
              name: "General Inquiry",
              badge: "EXPERTS AVAILABLE",
              title: "Have Questions?",
              description: "Our team is ready to answer all your queries",
              phone: "+91 9876543210",
              ctaText: "Ask Questions"
            },
            {
              name: "Booking Assistance",
              badge: "BOOKING SUPPORT",
              title: "Need Booking Help?",
              description: "Get personalized assistance for your booking",
              phone: "+91 9123456789",
              ctaText: "Get Assistance"
            }
          ].map((preset, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 cursor-pointer"
              onClick={() => setTrustCTA({
                ...trustCTA,
                badge: preset.badge,
                title: preset.title,
                description: preset.description,
                phone: preset.phone,
                ctaText: preset.ctaText
              })}>
              <div className="font-medium text-gray-800 mb-2">{preset.name}</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{preset.badge}</div>
                <div>{preset.title}</div>
                <div className="mt-2 text-red-600 font-medium">Click to apply</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustCTATab;