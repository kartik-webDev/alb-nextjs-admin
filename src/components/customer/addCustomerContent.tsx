'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { YYYYMMDD } from '@/utils/common-function';
import Swal from 'sweetalert2';

interface CustomerDetail {
  customerName: string;
  phoneNumber: string;
  gender: string;
  wallet: string;
  dateOfBirth: string;
  timeOfBirth: string;
}

const AddCustomerContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const customerId = searchParams.get('id');
  const isEditMode = !!customerId;

  const [detail, setDetail] = useState<CustomerDetail>({
    customerName: '',
    phoneNumber: '',
    gender: '',
    wallet: '',
    dateOfBirth: '',
    timeOfBirth: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [image, setImage] = useState<{ file: string; bytes: File | null }>({
    file: '',
    bytes: null,
  });
  const [loading, setLoading] = useState(false);

  /* ---------- Fill form from URL params ---------- */
  useEffect(() => {
    if (isEditMode) {
      const customerName = searchParams.get('customerName') || '';
      const phoneNumber = searchParams.get('phoneNumber') || '';
      const gender = searchParams.get('gender') || '';
      const wallet_balance = searchParams.get('wallet_balance') || '0';
      const dateOfBirth = searchParams.get('dateOfBirth') || '';
      const timeOfBirth = searchParams.get('timeOfBirth') || '';
      const imageUrl = searchParams.get('image') || '';

      setDetail({
        customerName,
        phoneNumber,
        gender,
        wallet: wallet_balance,
        dateOfBirth: dateOfBirth ? YYYYMMDD(dateOfBirth) : '',
        timeOfBirth,
      });

      if (imageUrl) {
        setImage({ file: imageUrl, bytes: null });
      }
    }
  }, [searchParams, isEditMode]);

  /* ---------- Image handling ---------- */
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage({ file: URL.createObjectURL(file), bytes: file });
    }
    setError('image', undefined);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImage( prev => ({ ...prev, file: URL.createObjectURL(file), bytes: file }));
    }
    setError('image', undefined);
  };

  const setError = (field: string, msg: string | undefined) => {
    setErrors((prev: any) => ({ ...prev, [field]: msg }));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetail((prev) => ({ ...prev, [name]: value }));
    setError(name, undefined);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetail((prev) => ({ ...prev, [name]: value }));
    setError(name, undefined);
  };

  /* ---------- Validation ---------- */
  const validate = () => {
    let ok = true;
    const namePat = /^[a-zA-Z\s]{1,56}$/;
    const phonePat = /^[0-9]{10}$/;
    const { customerName, phoneNumber, gender, dateOfBirth, timeOfBirth } = detail;

    if (!customerName) { 
      setError('customerName', 'Enter name'); 
      ok = false; 
    } else if (customerName.length > 30) { 
      setError('customerName', 'Name ≤30 chars'); 
      ok = false; 
    } else if (!namePat.test(customerName)) { 
      setError('customerName', 'Invalid name'); 
      ok = false; 
    }

    if (!phoneNumber) { 
      setError('phoneNumber', 'Enter phone'); 
      ok = false; 
    } else if (!phonePat.test(phoneNumber)) { 
      setError('phoneNumber', 'Invalid phone'); 
      ok = false; 
    }

    if (!gender) { 
      setError('gender', 'Select gender'); 
      ok = false; 
    }
    if (!dateOfBirth) { 
      setError('dateOfBirth', 'Select DOB'); 
      ok = false; 
    }
    if (!timeOfBirth) { 
      setError('timeOfBirth', 'Select TOB'); 
      ok = false; 
    }

    return ok;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    const fd = new FormData();
    if (isEditMode && customerId) fd.append('customerId', customerId);
    fd.append('customerName', detail.customerName);
    fd.append('phoneNumber', detail.phoneNumber);
    fd.append('gender', detail.gender);
    fd.append('wallet', detail.wallet || '0');
    fd.append('dateOfBirth', detail.dateOfBirth);
    fd.append('timeOfBirth', detail.timeOfBirth);
    if (image.bytes) fd.append('image', image.bytes);

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/update-customer-data`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/customers/customer-signup`;

    try {
      const res = await fetch(url, { method: 'POST', body: fd });
      const json = await res.json();

      if (res.ok && json.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: isEditMode ? 'Customer updated successfully!' : 'Customer created successfully!',
          confirmButtonColor: '#3085d6',
        });
        
        setTimeout(() => router.push('/customer'), 1000);
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: json.message || 'Something went wrong',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to process request',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white mb-5 shadow-sm rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">
          {isEditMode ? 'Edit Customer' : 'Add Customer'}
        </h1>
        <button
          onClick={() => router.push('/customer')}
          className="bg-red-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Display
        </button>
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {image.file ? (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              htmlFor="upload-image"
              className="block cursor-pointer"
            >
              <img
                src={image.file}
                alt="Customer"
                className="w-full h-64 object-contain bg-gray-50"
              />
            </label>
          ) : (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              htmlFor="upload-image"
              className="flex flex-col items-center justify-center py-24 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <p className="text-lg font-semibold text-gray-700">Choose Image</p>
              <p className="text-base text-gray-500 mt-1">or drop here</p>
            </label>
          )}
          <input
            id="upload-image"
            type="file"
            accept="image/*"
            hidden
            onChange={handleImage}
          />
        </div>
        {errors.image && (
          <p className="text-red-600 text-sm mt-1 pl-1">{errors.image}</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={detail.customerName}
            onChange={handleInput}
            onFocus={() => setError('customerName', undefined)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
              errors.customerName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter customer name"
          />
          {errors.customerName && (
            <p className="text-red-600 text-xs mt-1 pl-1">{errors.customerName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="phoneNumber"
            value={detail.phoneNumber}
            onChange={handleInput}
            onFocus={() => setError('phoneNumber', undefined)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
              errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter 10-digit phone"
          />
          {errors.phoneNumber && (
            <p className="text-red-600 text-xs mt-1 pl-1">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={detail.gender}
            onChange={handleSelect}
            onFocus={() => setError('gender', undefined)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
              errors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="" disabled>Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-red-600 text-xs mt-1 pl-1">{errors.gender}</p>
          )}
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DOB <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={detail.dateOfBirth}
            onChange={handleInput}
            onFocus={() => setError('dateOfBirth', undefined)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="text-red-600 text-xs mt-1 pl-1">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* TOB */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TOB <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="timeOfBirth"
            value={detail.timeOfBirth}
            onChange={handleInput}
            onFocus={() => setError('timeOfBirth', undefined)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
              errors.timeOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.timeOfBirth && (
            <p className="text-red-600 text-xs mt-1 pl-1">{errors.timeOfBirth}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2.5 rounded-md text-white font-medium text-sm transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? 'Submitting...' : (isEditMode ? 'Update' : 'Submit')}
        </button>
      </div>
    </div>
  );
};

export default AddCustomerContent;