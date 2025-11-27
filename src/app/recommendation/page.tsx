"use client";

import React, { useEffect, useState, useMemo } from "react";
import moment from "moment";
import Swal from "sweetalert2";
import DataTable, { TableColumn, TableProps } from 'react-data-table-component';
import { useRouter } from 'next/navigation';
import { CSVLink } from 'react-csv';
import DownloadIcon from '@mui/icons-material/Download';
import { base_url } from "@/lib/api-routes";

// Updated Types with _id instead of id

interface Product {
  _id: string;  // Changed from id
  productTitle: string;
  productPrice: string;
  productUrl: string;
  productImageUrl: string | null;
  commissionRate: string;
  potentialCommission: string;
}

interface Recommendation {
  _id: string;  // Changed from id
  astrologerId: string;
  astrologerName: string;
  astrologerEmail: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  messageText: string;
  productCount: number;
  products: Product[];
  createdAt: string;
  totalPotentialCommission: string;
  status: 'SENT' | 'PENDING' | 'FAILED' | 'PURCHASED';
}

// Commission request payload
interface CreateCommissionRequest {
  recommendationId: string;
  recommendationProductId: string;
  astrologerId: string;
  customerId: string;
  purchaseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  purchasedAt?: string;
  externalOrderId?: string;
}

// Status Badge Component
const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    SENT: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    FAILED: "bg-red-100 text-red-800",
  };
  const badgeClass = colors[status] || "bg-gray-100 text-gray-800";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
      {status}
    </span>
  );
};

// Deep search across all values
const DeepSearchSpace = (data: any[], searchText: string): any[] => {
  if (!searchText) return data;
  const lower = searchText.toLowerCase();
  return data.filter(item =>
    Object.values(item).some(val =>
      val !== null && val !== undefined && String(val).toLowerCase().includes(lower)
    )
  );
};

// Custom styles (consistent across app)
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

// Updated Props with full expandable row support
interface MainDatatableProps<T = any> extends Partial<TableProps<T>> {
  data: T[];
  columns: TableColumn<T>[];
  url?: string;
  title?: string;
  addButtonActive?: boolean;
  buttonMessage?: string;
  isLoading?: boolean;
  showSearch?: boolean;
}

const MainDatatable = <T extends object>({
  data = [],
  columns,
  url,
  title = '',
  addButtonActive = true,
  buttonMessage = 'Add',
  isLoading = false,
  showSearch = true,
  ...dataTableProps
}: MainDatatableProps<T>) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const filteredData = showSearch ? DeepSearchSpace(data, searchText) : data;

  const csvData = Array.isArray(data) && data.length > 0 ? data : [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onClickAdd = () => {
    if (addButtonActive && url) {
      router.push(url);
    } else {
      Swal.fire({
        icon: "error",
        title: "Limit Reached",
        text: "Maximum items allowed.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className={`${title ? 'p-5 shadow-sm border border-gray-200 rounded-lg mb-5' : ''} bg-white`}>
      {isLoading ? (
        <div className="text-center min-h-[400px] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Header with Title, Search, CSV, Add Button */}
          {title && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

              <div className="flex flex-wrap gap-3 items-center">
                {showSearch && (
                  <input
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto"
                    type="search"
                    placeholder="Search..."
                    value={searchText}
                    onChange={handleSearch}
                  />
                )}

                {/* CSV Export */}
                {csvData.length > 0 ? (
                  <CSVLink
                    data={csvData}
                    filename={`${title.replace(/\s+/g, '_')}.csv`}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <DownloadIcon fontSize="small" />
                  </CSVLink>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 cursor-not-allowed opacity-60">
                    <DownloadIcon fontSize="small" />
                  </div>
                )}

                {/* Add Button */}
                {url && addButtonActive && (
                  <button
                    onClick={onClickAdd}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    {buttonMessage} <span className="text-lg font-bold">+</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Standalone Search (when no title) */}
          {!title && showSearch && (
            <div className="mb-4 flex justify-end">
              <input
                className="px-4 py-2 border border-red-500 text-red-500 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 max-w-xs"
                type="search"
                placeholder="Search..."
                value={searchText}
                onChange={handleSearch}
              />
            </div>
          )}

          {/* Main DataTable */}
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100, 200]}
            paginationComponentOptions={{
              rowsPerPageText: 'Rows per page:',
              rangeSeparatorText: 'of',
            }}
            customStyles={DataTableCustomStyles}
            fixedHeader
            fixedHeaderScrollHeight="600px"
            highlightOnHover
            pointerOnHover
            responsive
            noDataComponent={
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No records found</p>
              </div>
            }
            {...dataTableProps}
          />
        </>
      )}
    </div>
  );
};

// --- UPDATED EXPANDED PRODUCT ROW (RED THEME) ---
const ExpandedProductRow = ({ data }: { data: Recommendation }) => {
  const [soldProducts, setSoldProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const checkSoldProducts = async () => {
      try {
        const res = await fetch(
          `${base_url}api/astrologer/recommendations/getrecommendation/${data._id}/sold-products`  // Changed
        );
        if (res.ok) {
          const result = await res.json();
          setSoldProducts(new Set(result.soldProductIds || []));
        }
      } catch (error) {
        console.error("Error checking sold products:", error);
      }
    };
    checkSoldProducts();
  }, [data._id]);  // Changed

  const handleMarkAsSold = async (product: Product) => {
    try {
      setLoading(product._id);  // Changed

      const commissionData = {
        recommendationId: data._id,              // Changed
        recommendationProductId: product._id,     // Changed
        astrologerId: data.astrologerId,
        customerId: data.customerId,
        purchaseAmount: parseFloat(product.productPrice),
        commissionRate: parseFloat(product.commissionRate),
        commissionAmount: parseFloat(product.potentialCommission),
        purchasedAt: new Date().toISOString(),
      };

      console.log("📤 Sending commission data:", commissionData);

      const res = await fetch(`${base_url}api/astrologer/recommendations/commissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commissionData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to mark as sold");
      }

      setSoldProducts(prev => new Set(prev).add(product._id));  // Changed

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Product marked as sold and commission created",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to mark product as sold",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-orange-50 border-t border-gray-200 p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.products.map((product) => {
          const isSold = soldProducts.has(product._id);  // Changed
          const isLoading = loading === product._id;      // Changed

          return (
            <div
              key={product._id}  // Changed
              className={`bg-white border rounded-xl p-4 shadow-sm transition-all 
                ${isSold ? "border-green-400 bg-green-50" : "border-red-300"}`}
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                {product.productImageUrl ? (
                  <img
                    src={`${product.productImageUrl}`}
                    alt={product.productTitle}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/64?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg w-16 h-16 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Product Title */}
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:underline block mb-2 truncate"
                  >
                    {product.productTitle}
                  </a>

                  {/* Product Price & Info */}
                  <div className="space-y-1 text-sm">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{parseFloat(product.productPrice).toLocaleString("en-IN")}
                    </p>
                    <p className="text-red-600 font-medium">
                      Commission Rate: {product.commissionRate}%
                    </p>
                    <p className="text-green-700 font-semibold">
                      Earn: ₹
                      {parseFloat(product.potentialCommission).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Sold Button */}
                  <div className="mt-3">
                    {isSold ? (
                      <div className="bg-green-800  
                                   text-white px-2 py-2 rounded-xl text-sm font-medium flex items-center 
                                   justify-center gap-2 transition w-40">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Sold
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkAsSold(product)}
                        disabled={isLoading}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed 
                                   text-white px-2 py-2 rounded-xl text-sm font-medium flex items-center 
                                   justify-center gap-2 transition w-40"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          "Mark as Sold"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch data
  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${base_url}api/astrologer/recommendations/getrecommendation`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const sorted = (data.data?.recommendations || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecommendations(sorted);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch recommendations",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Toggle expandable row
  const toggleRow = (row: Recommendation) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(row._id)) {        // Changed
        newSet.delete(row._id);          // Changed
      } else {
        newSet.add(row._id);             // Changed
      }
      return newSet;
    });
  };

  // Columns configuration
  const columns = useMemo(
    () => [
      {
        name: "S. No.",
        selector: (_row: any, index?: number) => (index !== undefined ? index + 1 : ''),
        width: "60px",
      },
      {
        name: "Date",
        selector: (row: Recommendation) => moment(row.createdAt).format("DD/MM/YYYY"),
        width: "110px",
      },
      {
        name: "Astrologer",
        selector: (row: Recommendation) => row.astrologerName,
        width: "150px",
      },
      {
        name: "Email",
        selector: (row: Recommendation) => row.astrologerEmail,
        width: "210px",
        center: true
      },
      {
        name: "Customer",
        selector: (row: Recommendation) => row.customerName,
        width: "150px",
        center: true
      },
      {
        name: "Mobile",
        selector: (row: Recommendation) => row.customerMobile,
        width: "140px",
        center: true,
      },
      {
        name: "Products",
        cell: (row: Recommendation) => <span className="font-semibold">{row.productCount}</span>,
        width: "100px",
        center: true,
      },
      {
        name: "Commission",
        cell: (row: Recommendation) => (
          <span className="font-semibold text-green-600">
            ₹{parseFloat(row.totalPotentialCommission).toLocaleString('en-IN')}
          </span>
        ),
        width: "100px",
        center: true,
      },
      {
        name: "Status",
        cell: (row: Recommendation) => getStatusBadge(row.status),
        width: "140px",
        center: true,
      },
      {
        name: "Action",
        cell: (row: Recommendation) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRow(row);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {expandedRows.has(row._id) ? (  // Changed
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </button>
        ),
        width: "80px",
        center: true,
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [expandedRows]
  );

  return (
    <MainDatatable
      title="Product Recommendations"
      data={recommendations}
      columns={columns}
      isLoading={isLoading}
      showSearch={true}
      addButtonActive={false}
      expandableRows
      expandableRowsComponent={ExpandedProductRow}
      expandableRowExpanded={(row: Recommendation) => expandedRows.has(row._id)}  // Changed
      onRowClicked={(row: Recommendation) => toggleRow(row)}
      expandableRowsHideExpander={true}
    />
  );
}