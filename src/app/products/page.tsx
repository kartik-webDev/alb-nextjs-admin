// app/admin/products/page.jsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Edit,
  Save,
  X,
  Filter,
  Package,
  DollarSign,
  Percent,
  ToggleLeft,
  ToggleRight,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Types
type Product = {
  _id: string;
  productTitle: string;
  productHandle?: string;
  productImageUrl?: string;
  productCategory?: string;
  productPrice: number;
  commissionType: "percentage" | "flat";
  commissionRate: number;
  flatCommission: number;
  isActive: boolean;
};

type EditForm = {
  commissionType: "percentage" | "flat";
  commissionRate: number;
  flatCommission: number;
  isActive: boolean;
};

type Stats = {
  total: number;
  active: number;
  withCommission: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    commissionType: "percentage",
    commissionRate: 0,
    flatCommission: 0,
    isActive: true,
  });
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    withCommission: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  // Fetch products with pagination
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(
        `${API_BASE}/api/products/admin/products?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        calculateStats(data.data.products);
        
        // Update pagination info if available from API
        if (data.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: data.data.pagination.total,
            totalPages: data.data.pagination.totalPages,
          }));
        } else {
          // Fallback calculation
          setPagination(prev => ({
            ...prev,
            total: data.data.products.length,
            totalPages: Math.ceil(data.data.products.length / prev.limit),
          }));
        }
      } else {
        throw new Error(data.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch products";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, searchQuery, selectedCategory, pagination.page, pagination.limit]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/products/admin/products/categories`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCategories(data.data.categories);
      } else {
        throw new Error(data.error || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Don't show error for categories as it's not critical
    }
  }, [API_BASE]);

  // Calculate statistics
  const calculateStats = useCallback((products: Product[]) => {
    const total = products.length;
    const active = products.filter(p => p.isActive).length;
    const withCommission = products.filter(
      p => p.commissionRate > 0 || p.flatCommission > 0
    ).length;

    setStats({ total, active, withCommission });
  }, []);

  // Sync from Shopify
  const syncFromShopify = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE}/api/products/admin/products/sync`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchProducts();
        await fetchCategories();
        setSuccess(`✅ ${data.data.message}`);
        clearMessages();
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (error) {
      console.error("Sync error:", error);
      const errorMessage = error instanceof Error ? error.message : "Sync failed";
      setError(`❌ ${errorMessage}`);
      clearMessages();
    } finally {
      setSyncing(false);
    }
  };

  // Update product commission
  const updateProductCommission = async (productId: string) => {
    try {
      setError(null);
      
      // Validation
      if (editForm.commissionType === "percentage" && editForm.commissionRate > 100) {
        setError("Commission rate cannot exceed 100%");
        clearMessages();
        return;
      }

      if (editForm.commissionType === "percentage" && editForm.commissionRate < 0) {
        setError("Commission rate cannot be negative");
        clearMessages();
        return;
      }

      if (editForm.commissionType === "flat" && editForm.flatCommission < 0) {
        setError("Flat commission cannot be negative");
        clearMessages();
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/products/admin/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setEditingProduct(null);
        await fetchProducts();
        setSuccess("✅ Commission updated successfully!");
        clearMessages();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage = error instanceof Error ? error.message : "Update failed";
      setError(`❌ ${errorMessage}`);
      clearMessages();
    }
  };

  // Bulk update status
  const bulkUpdateStatus = async (isActive: boolean) => {
    if (products.length === 0) {
      setError("No products to update");
      clearMessages();
      return;
    }

    try {
      setError(null);
      
      const productsToUpdate = products.map((product) => ({
        id: product._id,
        commissionType: product.commissionType,
        commissionRate: product.commissionRate,
        flatCommission: product.flatCommission,
        isActive: isActive,
      }));

      const response = await fetch(
        `${API_BASE}/api/products/admin/products/bulk`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ products: productsToUpdate }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchProducts();
        setSuccess(
          `✅ ${data.data.updated} products ${
            isActive ? "activated" : "deactivated"
          } successfully!`
        );
        clearMessages();
      } else {
        throw new Error(data.error || "Bulk update failed");
      }
    } catch (error) {
      console.error("Bulk update error:", error);
      const errorMessage = error instanceof Error ? error.message : "Bulk update failed";
      setError(`❌ ${errorMessage}`);
      clearMessages();
    }
  };

  // Start editing a product
  const startEditing = (product: Product) => {
    setEditingProduct(product._id);
    setEditForm({
      commissionType: product.commissionType,
      commissionRate: product.commissionRate,
      flatCommission: product.flatCommission,
      isActive: product.isActive,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProduct(null);
    setEditForm({
      commissionType: "percentage",
      commissionRate: 0,
      flatCommission: 0,
      isActive: true,
    });
  };

  // Calculate potential commission
  const calculateCommission = (product: Product) => {
    if (product.commissionType === "percentage") {
      return (product.productPrice * product.commissionRate) / 100;
    } else {
      return product.flatCommission;
    }
  };

  // Export products to CSV
  const exportToCSV = () => {
    if (products.length === 0) {
      setError("No products to export");
      clearMessages();
      return;
    }

    try {
      const headers = [
        "Product Title",
        "Category",
        "Price",
        "Commission Type",
        "Commission Rate",
        "Potential Commission",
        "Status",
      ];
      const csvData = products.map((product) => [
        product.productTitle,
        product.productCategory || "Uncategorized",
        `₹${product.productPrice}`,
        product.commissionType,
        product.commissionType === "percentage"
          ? `${product.commissionRate}%`
          : `₹${product.flatCommission}`,
        `₹${calculateCommission(product).toFixed(2)}`,
        product.isActive ? "Active" : "Inactive",
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSuccess("✅ CSV exported successfully!");
      clearMessages();
    } catch (error) {
      console.error("Export error:", error);
      setError("❌ Failed to export CSV");
      clearMessages();
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search/filter
      fetchProducts();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories, pagination.page]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notifications */}
      {(error || success) && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2 flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-2 flex items-start gap-3 shadow-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 text-sm font-medium">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Products Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage Shopify products and astrologer commissions
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={products.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={syncFromShopify}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync from Shopify"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ToggleRight className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Products
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                With Commission
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.withCommission}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => bulkUpdateStatus(true)}
              disabled={products.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <ToggleRight className="w-4 h-4" />
              Activate All
            </button>
            <button
              onClick={() => bulkUpdateStatus(false)}
              disabled={products.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <ToggleLeft className="w-4 h-4" />
              Deactivate All
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Rate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Potential Commission
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.productImageUrl ? (
                            <img
                              src={product.productImageUrl}
                              alt={product.productTitle}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/48?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {product.productTitle}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.productHandle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.productCategory || "Uncategorized"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{product.productPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingProduct === product._id ? (
                          <select
                            value={editForm.commissionType}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) =>
                              setEditForm({
                                ...editForm,
                                commissionType: e.target.value as
                                  | "percentage"
                                  | "flat",
                              })
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="flat">Flat</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.commissionType === "percentage"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {product.commissionType === "percentage" ? (
                              <Percent className="w-3 h-3 mr-1" />
                            ) : (
                              <DollarSign className="w-3 h-3 mr-1" />
                            )}
                            {product.commissionType}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingProduct === product._id ? (
                          editForm.commissionType === "percentage" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={
                                  editForm.commissionRate === 0
                                    ? ""
                                    : editForm.commissionRate
                                }
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numericValue =
                                    value === "" ? 0 : parseFloat(value);
                                  setEditForm({
                                    ...editForm,
                                    commissionRate: numericValue,
                                  });
                                }}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                              <span className="text-gray-500">%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">₹</span>
                              <input
                                type="number"
                                value={
                                  editForm.flatCommission === 0
                                    ? ""
                                    : editForm.flatCommission
                                }
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numericValue =
                                    value === "" ? 0 : parseFloat(value);
                                  setEditForm({
                                    ...editForm,
                                    flatCommission: numericValue,
                                  });
                                }}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          )
                        ) : product.commissionType === "percentage" ? (
                          <span className="font-medium">
                            {product.commissionRate}%
                          </span>
                        ) : (
                          <span className="font-medium">
                            ₹{product.flatCommission}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ₹{calculateCommission(product).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProduct === product._id ? (
                          <select
                            value={editForm.isActive ? "true" : "false"}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                isActive: e.target.value === "true",
                              })
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingProduct === product._id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                updateProductCommission(product._id)
                              }
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(product)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit Commission"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  {searchQuery || selectedCategory
                    ? "Try adjusting your search or filters"
                    : "No products available. Sync from Shopify to get started."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    products
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={prevPage}
                      disabled={pagination.page === 1}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === pagination.totalPages ||
                            Math.abs(page - pagination.page) <= 1
                        )
                        .map((page, index, array) => {
                          const showEllipsis =
                            index < array.length - 1 &&
                            array[index + 1] - page > 1;
                          
                          return (
                            <React.Fragment key={page}>
                              <button
                                onClick={() => goToPage(page)}
                                className={`px-3 py-1 border text-sm font-medium rounded-md transition-colors ${
                                  pagination.page === page
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                              {showEllipsis && (
                                <span className="px-2 py-1 text-gray-500">...</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </div>
                    <button
                      onClick={nextPage}
                      disabled={pagination.page === pagination.totalPages}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sync Status */}
      {syncing && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Syncing products from Shopify...
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;