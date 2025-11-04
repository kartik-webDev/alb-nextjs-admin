'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import MainDatatable from '@/components/common/MainDatatable';
import { base_url } from '@/lib/api-routes';
import { DeleteSvg } from '@/components/svgs/page';
import Swal from 'sweetalert2';

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
interface PlatformCharge {
  _id: string;
  platformChargeAmount: number;
  createdAt?: string;
}

// ---------------------------------------------------------------------
// Utility: Deep Search
// ---------------------------------------------------------------------
const deepSearch = <T,>(data: T[], searchText: string): T[] => {
  if (!searchText) return data;
  const lowerSearch = searchText.toLowerCase();
  return data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(lowerSearch)
  );
};

// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------
const PlatformCharges: React.FC = () => {
  const router = useRouter();

  const [platformCharges, setPlatformCharges] = useState<PlatformCharge[]>([]);
  const [filteredData, setFilteredData] = useState<PlatformCharge[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  //* Fetch Platform Charges
  const fetchPlatformCharges = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base_url}api/admin/platform-charges`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch platform charges');
      
      const data = await res.json();
      
      // Sort in descending order by createdAt (newest first)
      const sortedData = [...(data || [])].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      setPlatformCharges(sortedData);
      setFilteredData(sortedData);
    } catch (err) {
      console.error('Error fetching platform charges:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to fetch platform charges.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  //* Delete Platform Charge
  const handleDelete = async (chargeId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this platform charge!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      // Show loading
      Swal.fire({
        title: 'Deleting...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const res = await fetch(`${base_url}api/admin/del-platform-charges/${chargeId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete platform charge');

      await Swal.fire({
        title: 'Deleted!',
        text: 'Platform charge has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      await fetchPlatformCharges();
    } catch (error) {
      console.error('Error deleting platform charge:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete platform charge. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    }
  };

  //* Search filtering
  useEffect(() => {
    setFilteredData(deepSearch(platformCharges, searchText));
  }, [searchText, platformCharges]);

  //* Initial Load
  useEffect(() => {
    fetchPlatformCharges();
  }, []);

  //* Datatable Columns
  const columns = useMemo(
    () => [
      {
        name: 'S.No.',
        selector: (_row: any, index?: number) => (index !== undefined ? index + 1 : 0),
        width: '80px',
      },
      {
        name: 'Platform Charge Amount',
        selector: (row: PlatformCharge) => `₹${row?.platformChargeAmount ?? '-'}`,
      },
      {
        name: 'Created At',
        selector: (row: PlatformCharge) =>
          row?.createdAt ? moment(row.createdAt).format('DD MMM YYYY @ hh:mm a') : '-',
        sortable: true,
      },
      {
        name: 'Action',
        cell: (row: PlatformCharge) => (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div
              onClick={() => handleDelete(row._id)}
              style={{ cursor: 'pointer' }}
            >
              <DeleteSvg />
            </div>
          </div>
        ),
        width: '120px',
        center: true,
      },
    ],
    []
  );

  //* Render
  return (
    <>
      <MainDatatable
        columns={columns}
        data={filteredData}
        title="Platform Charges"
        isLoading={loading}
        url="/master/platform-charges/add-platform-charge"
      />
    </>
  );
};

export default PlatformCharges;