"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";

interface PujaFormData {
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
  overview: string;
  whyPerform: string;
  benefits: string[];
  whoShouldBook: string[];
  pujaDetails: string;
  
  // Why Perform Reasons
  whyPerformReasons: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  
  // Pricing Packages
  pricingPackages: Array<{
    title: string;
    price: number;
    isPopular: boolean;
    features: string[];
  }>;
  
  // Testimonials
  testimonials: Array<{
    highlight: string;
    quote: string;
    name: string;
    location: string;
  }>;
  
  // FAQs
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  
  // Trust CTA
  trustCTA: {
    badge: string;
    title: string;
    description: string;
    phone: string;
    email: string;
    ctaText: string;
    footerNote: string;
    image: string;
  };
  
  isActive: boolean;
}

const CreateEditPuja = () => {
  const router = useRouter();
  const params = useParams();
  const isEditMode = !!params.id;
  
  const [formData, setFormData] = useState<PujaFormData>({
    title: "",
    slug: "",
    price: 0,
    imageUrl: "",
    overview: "",
    whyPerform: "",
    benefits: [""],
    whoShouldBook: [""],
    pujaDetails: "",
    whyPerformReasons: [
      { title: "", description: "", icon: "Moon" },
      { title: "", description: "", icon: "Shield" },
    ],
    pricingPackages: [
      { title: "", price: 0, isPopular: true, features: [""] },
      { title: "", price: 0, isPopular: false, features: [""] },
    ],
    testimonials: [
      { highlight: "", quote: "", name: "", location: "" },
    ],
    faqs: [
      { question: "", answer: "" },
    ],
    trustCTA: {
      badge: "24*7 SUPPORT",
      title: "",
      description: "",
      phone: "",
      email: "",
      ctaText: "Book Now",
      footerNote: "",
      image: "",
    },
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Icons available for selection
  const availableIcons = [
    "Moon", "Shield", "Heart", "Brain", "Sparkles", 
    "Star", "Sun", "Droplet", "Flame", "Leaf",
    "Zap", "Globe", "Users", "Target", "Award"
  ];

  // Fetch puja data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchPujaData();
    }
  }, [isEditMode]);

  const fetchPujaData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/puja-new/get_puja_by/${params.id}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch puja");
      
      const data = await response.json();
      if (data.success) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error("Error fetching puja:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load puja data",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle nested object changes
  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof PujaFormData] as any),
        [field]: value
      }
    }));
  };

  // Handle array field changes (benefits, whoShouldBook)
  const handleArrayChange = (arrayName: "benefits" | "whoShouldBook", index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  // Add new item to array
  const addArrayItem = (arrayName: "benefits" | "whoShouldBook") => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], ""]
    }));
  };

  // Remove item from array
  const removeArrayItem = (arrayName: "benefits" | "whoShouldBook", index: number) => {
    if (formData[arrayName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index)
      }));
    }
  };

  // Handle whyPerformReasons changes
  const handleReasonChange = (index: number, field: "title" | "description" | "icon", value: string) => {
    setFormData(prev => {
      const newReasons = [...prev.whyPerformReasons];
      newReasons[index] = { ...newReasons[index], [field]: value };
      return { ...prev, whyPerformReasons: newReasons };
    });
  };

  // Add/Remove reason
  const addReason = () => {
    setFormData(prev => ({
      ...prev,
      whyPerformReasons: [...prev.whyPerformReasons, { title: "", description: "", icon: "Moon" }]
    }));
  };

  const removeReason = (index: number) => {
    if (formData.whyPerformReasons.length > 1) {
      setFormData(prev => ({
        ...prev,
        whyPerformReasons: prev.whyPerformReasons.filter((_, i) => i !== index)
      }));
    }
  };

  // Handle pricing packages
  const handlePackageChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newPackages = [...prev.pricingPackages];
      newPackages[index] = { 
        ...newPackages[index], 
        [field]: field === "price" ? parseFloat(value) || 0 : 
                field === "isPopular" ? value === "true" : value 
      };
      return { ...prev, pricingPackages: newPackages };
    });
  };

  const handlePackageFeatureChange = (packageIndex: number, featureIndex: number, value: string) => {
    setFormData(prev => {
      const newPackages = [...prev.pricingPackages];
      const newFeatures = [...newPackages[packageIndex].features];
      newFeatures[featureIndex] = value;
      newPackages[packageIndex] = { ...newPackages[packageIndex], features: newFeatures };
      return { ...prev, pricingPackages: newPackages };
    });
  };

  const addPackageFeature = (packageIndex: number) => {
    setFormData(prev => {
      const newPackages = [...prev.pricingPackages];
      newPackages[packageIndex].features.push("");
      return { ...prev, pricingPackages: newPackages };
    });
  };

  const removePackageFeature = (packageIndex: number, featureIndex: number) => {
    setFormData(prev => {
      const newPackages = [...prev.pricingPackages];
      const newFeatures = newPackages[packageIndex].features.filter((_, i) => i !== featureIndex);
      newPackages[packageIndex] = { ...newPackages[packageIndex], features: newFeatures };
      return { ...prev, pricingPackages: newPackages };
    });
  };

  // Handle testimonials
  const handleTestimonialChange = (index: number, field: keyof typeof formData.testimonials[0], value: string) => {
    setFormData(prev => {
      const newTestimonials = [...prev.testimonials];
      newTestimonials[index] = { ...newTestimonials[index], [field]: value };
      return { ...prev, testimonials: newTestimonials };
    });
  };

  // Handle FAQs
  const handleFAQChange = (index: number, field: "question" | "answer", value: string) => {
    setFormData(prev => {
      const newFaqs = [...prev.faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return { ...prev, faqs: newFaqs };
    });
  };

  // Auto-generate slug from title
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    setFormData(prev => ({ ...prev, slug }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
    if (!formData.imageUrl.trim()) newErrors.imageUrl = "Image URL is required";
    if (!formData.overview.trim()) newErrors.overview = "Overview is required";
    
    // Check if all reasons have titles
    formData.whyPerformReasons.forEach((reason, index) => {
      if (!reason.title.trim()) {
        newErrors[`reasonTitle_${index}`] = "Reason title is required";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save/Update puja
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields",
      });
      return;
    }

    try {
      setSaving(true);
      
      const url = isEditMode 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/puja-new/create_puja_by/${params.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/puja-new/create_Puja`;
      
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Puja ${isEditMode ? "updated" : "created"} successfully`,
        }).then(() => {
          router.push("/admin/pujas");
        });
      } else {
        throw new Error(data.message || "Failed to save puja");
      }
    } catch (error) {
      console.error("Error saving puja:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to save puja",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? "Edit Puja" : "Create New Puja"}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? "Update puja details" : "Add a new puja to the website"}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/pujas")}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Back to List
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Chandra (Moon) Grah Pooja"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Generate from Title
                </button>
              </div>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.slug ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., chandra-moon-grah-pooja"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="15000"
                min="0"
                step="100"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.imageUrl ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://example.com/image.webp"
              />
              {errors.imageUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
              )}
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overview Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overview *
            </label>
            <textarea
              name="overview"
              value={formData.overview}
              onChange={handleInputChange}
              rows={10}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y ${
                errors.overview ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter detailed overview of the puja..."
            />
            {errors.overview && (
              <p className="mt-1 text-sm text-red-600">{errors.overview}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Tip: You can use simple HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;u&gt; for formatting
            </p>
          </div>
        </div>

        {/* Why Perform */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Why Perform This Puja</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="whyPerform"
              value={formData.whyPerform}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              placeholder="Explain why someone should perform this puja..."
            />
          </div>
        </div>

        {/* Benefits Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Benefits</h2>
            <button
              type="button"
              onClick={() => addArrayItem("benefits")}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              + Add Benefit
            </button>
          </div>
          
          {formData.benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                value={benefit}
                onChange={(e) => handleArrayChange("benefits", index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., Promotes emotional balance and inner calm"
              />
              {formData.benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem("benefits", index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Who Should Book Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Who Should Book</h2>
            <button
              type="button"
              onClick={() => addArrayItem("whoShouldBook")}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              + Add Point
            </button>
          </div>
          
          {formData.whoShouldBook.map((item, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange("whoShouldBook", index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., Those experiencing emotional instability or stress"
              />
              {formData.whoShouldBook.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem("whoShouldBook", index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Puja Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Puja Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Procedure
            </label>
            <textarea
              name="pujaDetails"
              value={formData.pujaDetails}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              placeholder="Describe the puja procedure in detail..."
            />
          </div>
        </div>

        {/* Why Perform Reasons Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Why Perform Reasons</h2>
            <button
              type="button"
              onClick={addReason}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              + Add Reason
            </button>
          </div>
          
          {formData.whyPerformReasons.map((reason, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Reason {index + 1}</h3>
                {formData.whyPerformReasons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReason(index)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={reason.title}
                    onChange={(e) => handleReasonChange(index, "title", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors[`reasonTitle_${index}`] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Emotional Balance & Inner Peace"
                  />
                  {errors[`reasonTitle_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`reasonTitle_${index}`]}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={reason.description}
                    onChange={(e) => handleReasonChange(index, "description", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                    placeholder="Description of this reason..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <select
                  value={reason.icon}
                  onChange={(e) => handleReasonChange(index, "icon", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {availableIcons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Packages Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pricing Packages</h2>
          
          {formData.pricingPackages.map((pkg, pkgIndex) => (
            <div key={pkgIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">
                  Package {pkgIndex + 1} {pkg.isPopular && "(Popular)"}
                </h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pkg.isPopular}
                      onChange={(e) => handlePackageChange(pkgIndex, "isPopular", e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Mark as Popular</span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Title
                  </label>
                  <input
                    type="text"
                    value={pkg.title}
                    onChange={(e) => handlePackageChange(pkgIndex, "title", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., Personalized Package"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={pkg.price}
                    onChange={(e) => handlePackageChange(pkgIndex, "price", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="15000"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Features
                  </label>
                  <button
                    type="button"
                    onClick={() => addPackageFeature(pkgIndex)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    + Add Feature
                  </button>
                </div>
                
                {pkg.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handlePackageFeatureChange(pkgIndex, featureIndex, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g., Personalized Sankalp with your name and gotra"
                    />
                    {pkg.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePackageFeature(pkgIndex, featureIndex)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Testimonials</h2>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                testimonials: [...prev.testimonials, { highlight: "", quote: "", name: "", location: "" }]
              }))}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              + Add Testimonial
            </button>
          </div>
          
          {formData.testimonials.map((testimonial, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Testimonial {index + 1}</h3>
                {formData.testimonials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      testimonials: prev.testimonials.filter((_, i) => i !== index)
                    }))}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => handleTestimonialChange(index, "name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., Rajesh Kumar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={testimonial.location}
                    onChange={(e) => handleTestimonialChange(index, "location", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., Delhi, India"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highlight Quote
                </label>
                <input
                  type="text"
                  value={testimonial.highlight}
                  onChange={(e) => handleTestimonialChange(index, "highlight", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Short highlight quote (appears in bold)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Quote/Testimonial
                </label>
                <textarea
                  value={testimonial.quote}
                  onChange={(e) => handleTestimonialChange(index, "quote", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                  placeholder="Full testimonial text..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* FAQs Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Frequently Asked Questions</h2>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                faqs: [...prev.faqs, { question: "", answer: "" }]
              }))}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              + Add FAQ
            </button>
          </div>
          
          {formData.faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">FAQ {index + 1}</h3>
                {formData.faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      faqs: prev.faqs.filter((_, i) => i !== index)
                    }))}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleFAQChange(index, "question", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., How long does this puja take to complete?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => handleFAQChange(index, "answer", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                  placeholder="Detailed answer to the question..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Trust CTA Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Trust CTA Section</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.trustCTA).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                {key === "description" || key === "footerNote" ? (
                  <textarea
                    value={value as string}
                    onChange={(e) => handleNestedChange("trustCTA", key, e.target.value)}
                    rows={key === "description" ? 4 : 2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <input
                    type={key === "email" ? "email" : "text"}
                    value={value as string}
                    onChange={(e) => handleNestedChange("trustCTA", key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Active (Visible on website)</span>
            </label>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/pujas")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {isEditMode ? "Update Puja" : "Create Puja"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditPuja;