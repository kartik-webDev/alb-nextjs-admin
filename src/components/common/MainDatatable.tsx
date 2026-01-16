'use client';
import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { useRouter } from 'next/navigation';
import { CSVLink } from 'react-csv';
import DownloadIcon from '@mui/icons-material/Download';
import Swal from "sweetalert2";
import { DownloadSvg } from '../svgs/page';

interface Column {
  name: string;
  selector?: (row: any, index?: number) => any;
  cell?: (row: any, index?: number) => React.ReactNode;
  width?: string;
  sortable?: boolean;
  export?: boolean;  // CSV mein include karna hai ya nahi
  omit?: boolean;    // UI se hide karna hai ya nahi
  format?: (row: any) => any;  // CSV ke liye custom formatting
}

interface MainDatatableProps {
  data: any[];
  columns: Column[];
  url?: string;
  title?: string;
  addButtonActive?: boolean;
  buttonMessage?: string;
  isLoading?: boolean;
  showSearch?: boolean;
  exportHeaders?: boolean;  // Custom headers ke saath export karna hai ya nahi
  fileName?: string;  // Custom filename for CSV
}

// Deep search function
const DeepSearchSpace = (data: any[], searchText: string): any[] => {
  if (!searchText) return data;
  
  const searchLower = searchText.toLowerCase();
  return data.filter(item => 
    Object.values(item).some(val => 
      val && String(val).toLowerCase().includes(searchLower)
    )
  );
};

// Custom styles for DataTable
const DataTableCustomStyles = {
  headCells: {
    style: {
      backgroundColor: '#ef4444',
      fontWeight: 'bold',
      fontSize: '14px',
      color: '#ffffff',
    },
  },
  cells: {
    style: {
      fontSize: '14px',
    },
  },
};

const MainDatatable: React.FC<MainDatatableProps> = ({ 
  data = [], 
  columns, 
  url, 
  title = '', 
  addButtonActive = true, 
  buttonMessage = '',
  isLoading = false,
  showSearch = true,
  exportHeaders = false,  // Default: false (raw data export)
  fileName = 'data'  // Default filename
}) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  const filteredData = DeepSearchSpace(data, searchText);

  // Calculate paginated data - jo screen par visible hai
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  // Prepare CSV data based on exportHeaders prop
  const csvData = useMemo(() => {
    // Use paginated data (jo screen par visible hai) instead of full data
    const dataToExport = paginatedData;
    
    if (!Array.isArray(dataToExport) || dataToExport.length === 0) return [];

    if (!exportHeaders) {
      // Raw data export (original behavior)
      return dataToExport;
    }

    // Custom headers export with formatted data
    return dataToExport.map((row, index) => {
      const formattedRow: any = {};
      
      columns.forEach(column => {
        // Skip columns with export: false
        if (column.export === false) return;
        
        const columnName = column.name || 'Column';
        let value;

        // Use format function if provided
        if (column.format) {
          value = column.format(row);
        }
        // Use selector function
        else if (column.selector) {
          value = column.selector(row, index);
        }
        // Fallback to empty
        else {
          value = '';
        }

        formattedRow[columnName] = value ?? 'N/A';
      });

      return formattedRow;
    });
  }, [paginatedData, columns, exportHeaders]);

  // Prepare CSV headers (only if exportHeaders is true)
  const csvHeaders = useMemo(() => {
    if (!exportHeaders) return undefined;

    return columns
      .filter(column => column.export !== false)
      .map(column => ({
        label: column.name || 'Column',
        key: column.name || 'Column'
      }));
  }, [columns, exportHeaders]);

  const onClickAdd = () => {
    if (addButtonActive && url) {
      router.push(url);
    } else {
      Swal.fire({ 
        icon: "error", 
        title: "Sorry can't add more", 
        text: "Maximum 10 banners are allowed.", 
        showConfirmButton: false, 
        timer: 2000, 
      });
    }
  };

  return (
    <div className={`${title ? 'p-5 shadow-sm border border-gray-200 rounded-lg mb-5' : ''} bg-white`}>
      {isLoading ? (
        <div className="text-black text-center min-h-[400px] flex items-center justify-center text-base">
          <div className="animate-spin w-16 h-16 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Header Section - Only show if title is provided */}
          {title && (
            <div className="flex justify-between items-center mb-5 bg-white">
              <div className="text-xl font-semibold text-gray-800">
                {title}
              </div>
   
              <div className="flex gap-3 items-center">
                {showSearch && (
                  <div className="flex justify-end rounded-sm">
                    <input
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full max-w-xs text-sm"
                      type='search'
                      value={searchText}
                      onChange={handleSearch}
                      placeholder='Search'
                    />
                  </div>
                )}
                
                {/* Only show CSVLink if there's data to export */}
                {csvData.length > 0 ? (
                  <CSVLink 
                    filename={`${fileName || title || 'export'}.csv`}
                    data={csvData}
                    headers={csvHeaders}  // Custom headers (only if exportHeaders is true)
                    className="text-gray-800 text-base no-underline flex items-center gap-2 cursor-pointer hover:text-gray-600 transition-colors"
                  >
                    <div className="text-base font-medium text-gray-600">
                      <DownloadIcon />
                    </div>
                  </CSVLink>
                ) : (
                  <div className="text-gray-400 text-base flex items-center gap-2 cursor-not-allowed opacity-50">
                    <div className="text-base font-medium">
                      <DownloadIcon />
                    </div>
                    <DownloadSvg />
                  </div>
                )}

                {url && addButtonActive && (
                  <button 
                    onClick={onClickAdd}
                    className="font-medium bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-2xl flex items-center gap-2 cursor-pointer transition-colors duration-200 text-sm border-none"
                  >
                    <span>Add</span>
                    <span className="font-bold text-lg">+</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search Section - Show only if no title AND showSearch is true */}
          {!title && showSearch && (
            <div className="flex justify-end mb-4">
              <input 
                className="px-4 py-2 border border-red-500 text-red-500 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full max-w-xs text-sm"
                type='search' 
                value={searchText} 
                onChange={handleSearch} 
                placeholder='Search' 
              />
            </div>
          )}

          {/* DataTable with built-in pagination */}
          <DataTable
            columns={columns}
            data={showSearch ? filteredData : data}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100, 200]}
            paginationComponentOptions={{ 
              rowsPerPageText: 'Rows Per Page:',
              rangeSeparatorText: 'of',
            }}
            onChangePage={(page) => setCurrentPage(page)}
            onChangeRowsPerPage={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setCurrentPage(1);
            }}
            customStyles={DataTableCustomStyles}
            fixedHeader
            // fixedHeaderScrollHeight="600px"
            highlightOnHover
            pointerOnHover
            responsive
            noDataComponent={
              <div className="text-center py-10 text-gray-500">
                No records found
              </div>
            }
          />
        </>
      )}
    </div>
  );
};

export default MainDatatable;