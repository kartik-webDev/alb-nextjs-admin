'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { TableColumn } from 'react-data-table-component';
import MainDatatable from '@/components/common/MainDatatable';
import DatatableHeading from '@/components/datatable/DatatableHeading';
import { base_url } from '@/lib/api-routes';
import { SwitchOnSvg, SwitchOffSvg } from '@/components/svgs/page';
import Swal from 'sweetalert2';

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
interface SlotDuration {
  _id: string;
  slotDuration: number;
  active: boolean;
  createdAt?: string;
}

interface CSVRow {
  [key: string]: string | number | boolean | undefined;
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
const SlotManagement: React.FC = () => {
  const router = useRouter();

  const [slotDurations, setSlotDurations] = useState<SlotDuration[]>([]);
  const [filteredData, setFilteredData] = useState<SlotDuration[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingSlotId, setUpdatingSlotId] = useState<string | null>(null);





  //* Fetch Slot Durations
  const fetchSlotDurations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base_url}api/admin/get_slots_duration`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch slot durations');

      const data = await res.json();
      console.log('API Response:', data); // Debug log
      
      const slots = data?.slots || [];

      // Sort in ascending order by slotDuration
      const sortedSlots = slots.sort(
        (a: SlotDuration, b: SlotDuration) => a.slotDuration - b.slotDuration
      );

      setSlotDurations(sortedSlots);
      setFilteredData(sortedSlots);
    } catch (err) {
      console.error('Error fetching slot durations:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to fetch slot durations.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  //* Update Slot Status - FIXED VERSION
  const updateSlotStatus = async (slotId: string) => {
    // Prevent multiple simultaneous updates
    if (updatingSlotId) {
      console.log('Already updating a slot, please wait...');
      return;
    }

    try {
      setUpdatingSlotId(slotId);

      // Optimistic update - update UI immediately
      setSlotDurations((prevData) =>
        prevData.map((slot) =>
          slot._id === slotId
            ? { ...slot, active: !slot.active }
            : slot
        )
      );
      setFilteredData((prevData) =>
        prevData.map((slot) =>
          slot._id === slotId
            ? { ...slot, active: !slot.active }
            : slot
        )
      );

      console.log('Updating slot status for ID:', slotId);
      
      const res = await fetch(`${base_url}api/admin/update_slots_duration_status/${slotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', res.status);

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const data = await res.json();
      console.log('Status update response:', data);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      // Success - fetch fresh data to ensure consistency
      await fetchSlotDurations();

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Slot status updated successfully!',
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error('Error updating slot status:', error);
      
      // Revert optimistic update on error
      await fetchSlotDurations();

      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to update slot status.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setUpdatingSlotId(null);
    }
  };

  //* Search filtering
  useEffect(() => {
    setFilteredData(deepSearch(slotDurations, searchText));
  }, [searchText, slotDurations]);

  //* Initial Load
  useEffect(() => {
    fetchSlotDurations();
  }, []);

  //* CSV Data (Transformed for Export)
  const csvData: CSVRow[] = useMemo(() => {
    return filteredData.map((slot, index) => ({
      'S.No.': index + 1,
      'Slot Duration (mins)': slot.slotDuration,
      'Status': slot.active ? 'Active' : 'Inactive',
      'Created At': slot.createdAt
        ? moment(slot.createdAt).format('DD MMM YYYY @ hh:mm a')
        : '-',
    }));
  }, [filteredData]);

  //* Datatable Columns
  const columns = useMemo(
    () => [
      {
        name: 'S.No.',
        selector: (_row: any, index?: number) => (index !== undefined ? index + 1 : 0),
        width: '80px',
      },
      {
        name: 'Slot Duration (mins)',
        selector: (row: any) => row?.slotDuration ?? '-',
      },
      {
        name: 'Status',
        cell: (row: any) => (
          <div
            style={{ 
              cursor: updatingSlotId === row._id ? 'wait' : 'pointer',
              opacity: updatingSlotId === row._id ? 0.6 : 1,
            }}
            onClick={() => updateSlotStatus(row._id)}
          >
            {row?.active ? <SwitchOnSvg /> : <SwitchOffSvg />}
          </div>
        ),
        width: '140px',
        center: true,
      },
    ],
    [updatingSlotId]
  );

  //* Render
  return (
    <>
     

    
        <MainDatatable
          columns={columns}
          data={filteredData}
          title="Slot Management"
          url="/master/slot-management/add-slot"
          isLoading={loading}
        />

    </>
  );
};

export default SlotManagement;