'use client';
import React, { Suspense, useEffect, useState } from 'react';
import moment from 'moment';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowBack } from '@mui/icons-material';

// Types
interface Astrologer {
  _id: string;
  astrologerName: string;
}

interface Puja {
  _id: string;
  pujaName: string;
}

interface PujaItem {
  pujaId: Puja;
  price: number;
  quantity: number;
  pujaDate: string;
  pujaTime: string;
  bookingDate: string;
  assignedAstro?: Astrologer;
  notes?: string;
  status: string;
  _id: string;
}

interface PujaOrderData {
  _id: string;
  pujas: PujaItem[];
}

interface AstrologerRegistered {
  astrologerId: Astrologer;
  _id: string;
}

// Utility Functions
const formatIndianRupee = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// API Functions
const getPujaOrderId = async (orderId: string): Promise<PujaOrderData | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/puja/get_puja_order_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }), // Send in body
    });
    const data = await response.json();
    return data.success ? data.results : null;
  } catch (error) {
    console.error('Error fetching puja order:', error);
    return null;
  }
};

const getAstrologerRegisteredPuja = async (pujaId: string): Promise<AstrologerRegistered[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/puja/get_astrologers_registered/${pujaId}`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching astrologers:', error);
    return [];
  }
};

const updateAstrologerAssignStatus = async (payload: any): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/puja/update_assign_status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error updating status:', error);
    return false;
  }
};

const updateAstrologerPujaAssign = async (payload: any): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/puja/assign_astrologer`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error assigning astrologer:', error);
    return false;
  }
};

function PujaBookedDetailfunction(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [pujaOrderData, setPujaOrderData] = useState<PujaOrderData | null>(null);
  const [astrologersRegisteredPuja, setAstrologersRegisteredPuja] = useState<AstrologerRegistered[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignedDialog, setOpenAssignedDialog] = useState(false);

  // Form states
  const [inputFieldDetail, setInputFieldDetail] = useState({
    status: '',
    note: '',
    pujaId: '',
  });
  const [assignedAstrologerDetail, setAssignedAstrologerDetail] = useState('');

  // Handle input changes
  const handleInputField = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setInputFieldDetail({
      ...inputFieldDetail,
      [event.target.name]: event.target.value,
    });
  };

  // Status button handler
  const handleStatusButton = (status: string, pujaId: string) => {
    setInputFieldDetail({ ...inputFieldDetail, status, pujaId });
    setOpenDialog(true);
  };

  // Submit status
  const handleSubmitStatus = async () => {
    if (!pujaOrderData) return;

    const payload = {
      status: inputFieldDetail.status,
      note: inputFieldDetail.note,
      pujaId: inputFieldDetail.pujaId,
      bookingId: pujaOrderData._id,
      orderId,
    };

    const success = await updateAstrologerAssignStatus(payload);
    if (success) {
      setOpenDialog(false);
      // Refresh data
      fetchPujaOrderData();
    }
  };

  // Assign astrologer handler
  const handleAssignedClick = async (pujaId: string) => {
    setInputFieldDetail({ ...inputFieldDetail, pujaId });
    const astrologers = await getAstrologerRegisteredPuja(pujaId);
    setAstrologersRegisteredPuja(astrologers);
    setOpenAssignedDialog(true);
  };

  // Submit assigned astrologer
  const handleSubmitAssignedAstrologer = async () => {
    if (!pujaOrderData) return;

    const payload = {
      astrologerId: assignedAstrologerDetail,
      pujaId: inputFieldDetail.pujaId,
      bookingId: pujaOrderData._id,
    };

    const success = await updateAstrologerPujaAssign(payload);
    if (success) {
      setOpenAssignedDialog(false);
      // Refresh data
      fetchPujaOrderData();
    }
  };

  // Fetch puja order data
  const fetchPujaOrderData = async () => {
    if (!orderId) return;
    
    setLoading(true);
    const data = await getPujaOrderId(orderId);
    setPujaOrderData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPujaOrderData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="mb-6 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowBack />
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Puja Booking Details</h1>

      {pujaOrderData && pujaOrderData.pujas.map((value, index) => (
        <div 
          key={index} 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            {/* Puja Details */}
            <div className="flex-1 space-y-3">
              <h3 className="text-xl font-semibold text-gray-800">
                {value.pujaId?.pujaName || ''}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Price:</span>
                  <span className="text-gray-600">{formatIndianRupee(value.price || 0)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <span className="text-gray-600">{value.quantity}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Puja Date:</span>
                  <span className="text-gray-600">
                    {moment(value.pujaDate).format('DD/MM/YYYY')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Puja Time:</span>
                  <span className="text-gray-600">
                    {moment(value.pujaTime, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('hh:mm a')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Booking Date:</span>
                  <span className="text-gray-600">
                    {moment(value.bookingDate).format('DD/MM/YYYY')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Assigned Astrologer:</span>
                  <span className="text-gray-600">
                    {value.assignedAstro?.astrologerName || ''}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-700">Notes:</span>
                <span className="text-gray-600">{value.notes || ''}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleStatusButton(value.status, value.pujaId._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg cursor-pointer font-medium transition-colors duration-200 text-sm"
              >
                {value.status}
              </button>
              
              <button 
                onClick={() => handleAssignedClick(value.pujaId._id)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg cursor-pointer font-medium transition-colors duration-200 text-sm"
              >
                Assign Astrologer
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Status Change Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Change Status</h2>
              <button 
                onClick={() => setOpenDialog(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={inputFieldDetail.status}
                  onChange={handleInputField}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="note"
                  value={inputFieldDetail.note}
                  onChange={handleInputField}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter note..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitStatus}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg cursor-pointer font-medium transition-colors duration-200"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Astrologer Dialog */}
      {openAssignedDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Assign Astrologer</h2>
              <button 
                onClick={() => setOpenAssignedDialog(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Astrologer
                </label>
                <select
                  value={assignedAstrologerDetail}
                  onChange={(e) => setAssignedAstrologerDetail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select astrologer</option>
                  {astrologersRegisteredPuja.map((option, index) => (
                    <option key={index} value={option.astrologerId._id}>
                      {option.astrologerId.astrologerName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAssignedAstrologer}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg cursor-pointer font-medium transition-colors duration-200"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const PoojaBookedDetail = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-xl text-gray-600">Loading...</div></div>}>
      <PujaBookedDetailfunction/>
    </Suspense>
  );
};
export default PoojaBookedDetail;