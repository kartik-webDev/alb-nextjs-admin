"use client";

import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import "moment-timezone";
import Swal from "sweetalert2";
import MainDatatable from "@/components/common/MainDatatable";
import { ViewSvg, EditSvg } from "@/components/svgs/page";

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
interface Order {
  _id: string;
  name: string;
  email: string;
  whatsapp: string;
  gender: string | null;
  reportLanguage: string;
  dateOfBirth: string;
  timeOfBirth: string | null;
  placeOfBirth: string | null;
  placeOfBirthPincode: string | null;
  paymentTxnId: string;
  amount: string;
  paymentAt: string;
  planName: string;
  astroConsultation: boolean;
  consultationDate: string | null;
  consultationTime: string | null;
  problemType: string | null;
  partnerName: string | null;
  partnerDateOfBirth: string | null;
  partnerTimeOfBirth: string | null;
  partnerPlaceOfBirth: string | null;
  partnerPlaceOfBirthPincode: string | null;
  expressDelivery: boolean;
  questionOne: string | null;
  questionTwo: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  orderFingerprint: string;
  attemptCount: number;
  lastAttemptAt: string;
  deletedAt: string | null;
  status: "pending" | "paid" | "processing" | "delivered";
  createdAt: string;
  updatedAt: string;
  orderID: string;
  __v: number;
  expiresAt: string;
  razorpayOrderId: string;
}

interface ApiResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: Order[];
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

interface Filters {
  q: string;
  from: string;
  to: string;
  dateRange: string;
  language: string;
  planName: string;
  status: string;
  astroConsultation: string;
  expressDelivery: string;
  includeDeleted: boolean;
  sortBy: string;
  sortOrder: "asc" | "desc";
  limit: number;
}

interface EditPayload {
  planName?: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  gender?: string;
  reportLanguage?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  placeOfBirthPincode?: string;
  astroConsultation?: boolean;
  consultationDate?: string;
  consultationTime?: string;
  problemType?: string;
  partnerDateOfBirth?: string;
  partnerTimeOfBirth?: string;
  partnerPlaceOfBirth?: string;
  partnerPlaceOfBirthPincode?: string;
  expressDelivery?: boolean;
  questionOne?: string;
  questionTwo?: string;
  status?: "pending" | "paid" | "processing" | "delivered";
}

// ---------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------
const ReportOrders: React.FC = () => {
  const getTodayDate = () => moment().format("YYYY-MM-DD");

  const getDateRange = (range: string) => {
    const today = moment();
    switch (range) {
      case "today":
        return { from: today.format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
      case "weekly":
        return { from: today.subtract(7, 'days').format("YYYY-MM-DD"), to: moment().format("YYYY-MM-DD") };
      case "monthly":
        return { from: today.subtract(30, 'days').format("YYYY-MM-DD"), to: moment().format("YYYY-MM-DD") };
      default:
        return { from: "", to: "" };
    }
  };

  const [filters, setFilters] = useState<Filters>({
    q: "",
    from: "",
    to: "",
    dateRange: "",
    language: "",
    planName: "",
    status: "paid",
    astroConsultation: "",
    expressDelivery: "",
    includeDeleted: false,
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 100,
  });

  const [rows, setRows] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [activeRow, setActiveRow] = useState<Order | null>(null);
  const [editPayload, setEditPayload] = useState<EditPayload>({});

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const filteredRows = useMemo(() => {
    if (!filters.planName.trim()) return rows;
    const searchLower = filters.planName.toLowerCase().trim();
    return rows.filter(row => row.planName?.toLowerCase().includes(searchLower));
  }, [rows, filters.planName]);

  const fetchList = async () => {
    setLoading(true);
    try {
      let allItems: Order[] = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        const qs = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (k === "planName") return;
          if (v !== "" && v !== null && v !== undefined && k !== "dateRange") {
            if (k === "from" && filters.from && !filters.to) {
              qs.set("from", filters.from);
              qs.set("to", filters.from);
            } else {
              qs.set(k, String(v));
            }
          }
        });
        qs.set("page", String(currentPage));
        qs.set("limit", "100");

        if (filters.astroConsultation === "") qs.delete("astroConsultation");
        if (filters.expressDelivery === "") qs.delete("expressDelivery");
        if (!filters.includeDeleted) qs.delete("includeDeleted");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/life-journey-orders?${qs.toString()}`,
          { headers: getAuthHeaders() }
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        const data: ApiResponse = result.data || result;

        allItems = [...allItems, ...(data?.items || [])];
        totalPages = data.pages;
        currentPage++;
      }

      setRows(allItems);
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Failed to load orders", timer: 2000, showConfirmButton: false });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const qs = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined && k !== "dateRange") {
          qs.set(k, String(v));
        }
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/life-journey-orders/stats?${qs.toString()}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) return;
      const result = await response.json();
      const data: Stats = result.data || result;
      setStats(data || null);
    } catch (e) {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchStats();
    fetchList();
  }, [
    filters.q,
    filters.includeDeleted,
    filters.language,
    filters.status,
    filters.astroConsultation,
    filters.expressDelivery,
    filters.sortBy,
    filters.sortOrder,
    filters.from,
    filters.to,
    filters.limit,
  ]);

  const onChangeFilter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    if (name === "dateRange") {
      const range = getDateRange(value);
      setFilters(f => ({ ...f, dateRange: value, from: range.from, to: range.to }));
      return;
    }

    if (name === "from" || name === "to") {
      setFilters(f => ({ ...f, dateRange: "", [name]: value }));
      return;
    }

    const v = type === "checkbox" ? checked : name === "limit" ? Number(value) : value;
    setFilters(f => ({ ...f, [name]: v }));
  };

  const onView = (row: Order) => {
    setActiveRow(row);
    setViewOpen(true);
  };

  const onEdit = (row: Order) => {
    setActiveRow(row);
    setEditPayload({
      planName: row?.planName || "",
      name: row?.name || "",
      email: row?.email || "",
      whatsapp: row?.whatsapp || "",
      gender: row?.gender || "",
      reportLanguage: row?.reportLanguage || "",
      dateOfBirth: row?.dateOfBirth || "",
      timeOfBirth: row?.timeOfBirth || "",
      placeOfBirth: row?.placeOfBirth || "",
      placeOfBirthPincode: row?.placeOfBirthPincode || "",
      astroConsultation: row?.astroConsultation || false,
      consultationDate: row?.consultationDate || "",
      consultationTime: row?.consultationTime || "",
      problemType: row?.problemType || "",
      partnerDateOfBirth: row?.partnerDateOfBirth || "",
      partnerTimeOfBirth: row?.partnerTimeOfBirth || "",
      partnerPlaceOfBirth: row?.partnerPlaceOfBirth || "",
      partnerPlaceOfBirthPincode: row?.partnerPlaceOfBirthPincode || "",
      expressDelivery: row?.expressDelivery || false,
      questionOne: row?.questionOne || "",
      questionTwo: row?.questionTwo || "",
      status: row?.status || "pending",
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    try {
      const idOrOrder = activeRow?._id || activeRow?.orderID;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/life-journey-orders/${idOrOrder}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(editPayload),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      Swal.fire({ icon: "success", title: "Order updated", timer: 1200, showConfirmButton: false });
      setEditOpen(false);
      fetchList();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Update failed", timer: 2000, showConfirmButton: false });
    }
  };

  const onDelete = async (row: Order) => {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Soft delete this order?",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (!ask.isConfirmed) return;

    try {
      const idOrOrder = row?._id || row?.orderID;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/life-journey-orders/${idOrOrder}`,
        { method: "DELETE", headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error("Delete failed");

      Swal.fire({ icon: "success", title: "Order deleted", timer: 1200, showConfirmButton: false });
      fetchList();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Delete failed", timer: 2000, showConfirmButton: false });
    }
  };

  const onRestore = async (row: Order) => {
    try {
      const idOrOrder = row?._id || row?.orderID;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/life-journey-orders/${idOrOrder}/restore`,
        { method: "POST", headers: getAuthHeaders(), body: JSON.stringify({}) }
      );

      if (!response.ok) throw new Error("Restore failed");

      Swal.fire({ icon: "success", title: "Order restored", timer: 1200, showConfirmButton: false });
      fetchList();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Restore failed", timer: 2000, showConfirmButton: false });
    }
  };

  const downloadCSV = () => {
    const headers = [
      "_id", "orderID", "planName", "name", "email", "whatsapp", "gender", "reportLanguage", "amount", "status",
      "paymentTxnId", "razorpayOrderId", "paymentAt", "astroConsultation", "consultationDate", "consultationTime",
      "expressDelivery", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "createdAt", "deletedAt"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredRows.map(r => [
        r._id, r.orderID, r.planName, r.name, r.email, r.whatsapp, r.gender || "",
        r.reportLanguage, r.amount, r.status, r.paymentTxnId, r.razorpayOrderId,
        r.paymentAt ? moment.tz(r.paymentAt, "Asia/Kolkata").format("YYYY-MM-DD hh:mm a") : "",
        r.astroConsultation ? "Yes" : "No", r.consultationDate || "", r.consultationTime || "",
        r.expressDelivery ? "Yes" : "No", r.utm_source || "", r.utm_medium || "", r.utm_campaign || "",
        r.utm_term || "", r.utm_content || "",
        r.createdAt ? moment.tz(r.createdAt, "Asia/Kolkata").format("YYYY-MM-DD hh:mm a") : "",
        r.deletedAt ? moment.tz(r.deletedAt, "Asia/Kolkata").format("YYYY-MM-DD hh:mm a") : ""
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "life_journey_orders.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadServerCSV = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const qs = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined && k !== "dateRange") {
          qs.set(k, String(v));
        }
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/life-journey-orders/export?${qs.toString()}`,
        { method: "POST", headers: { Authorization: "Bearer " + token } }
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "life_journey_orders.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      Swal.fire({ icon: "error", title: "CSV export failed", timer: 2000, showConfirmButton: false });
    }
  };

  const columns = useMemo(() => [
    { name: "", selector: (_: Order, idx?: number) => (idx || 0) + 1, width: "70px" },
    { name: "Order ID", selector: (row: Order) => row?.orderID || "—", width: "110px" },
    { name: "Plan", selector: (row: Order) => row?.planName || "—", width: "200px" },
    { name: "Amount", selector: (row: Order) => row?.amount || "—", width: "120px" },
    { name: "Status", selector: (row: Order) => row?.status || "—", cell: (row: Order) => <span className="capitalize">{row?.status || "—"}</span>, width: "80px" },
    { name: "Lang", selector: (row: Order) => row?.reportLanguage || "—", width: "90px" },
    { name: "Name", selector: (row: Order) => row?.name || "—", width: "180px" },
    { name: "WhatsApp", selector: (row: Order) => row?.whatsapp || "—", width: "120px" },
    { name: "Email", selector: (row: Order) => row?.email || "—", width: "240px" },
    { name: "Astro", selector: (row: Order) => (row?.astroConsultation ? "Yes" : "No"), width: "90px" },
    { name: "Express", selector: (row: Order) => (row?.expressDelivery ? "Yes" : "No"), width: "90px" },
    { name: "Paid At", selector: (row: Order) => row?.paymentAt ? moment.tz(row.paymentAt, "Asia/Kolkata").format("DD/MM/YYYY hh:mm a") : "—", width: "170px" },
    { name: "Created", selector: (row: Order) => row?.createdAt ? moment.tz(row.createdAt, "Asia/Kolkata").format("DD/MM/YYYY hh:mm a") : "—", width: "170px" },
    {
      name: "Action",
      cell: (row: Order) => (
        <div className="flex gap-3 items-center">
          <div className="cursor-pointer" onClick={() => onView(row)}><ViewSvg /></div>
          <div className="cursor-pointer" onClick={() => onEdit(row)}><EditSvg /></div>
        </div>
      ),
      width: "100px"
    }
  ], []);

  return (
    <>
      <div className="p-5 bg-white rounded-xl shadow-sm mb-5">
        {/* Header + Stats */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
          <div>
            {stats && (
              <>
                <div className="text-lg font-semibold text-gray-900">
                  Life Journey Orders
                </div>
                <div className="text-sm text-gray-700">
                  Total Order: <strong>{stats.totalOrders}</strong> • Total Revenue: <strong>₹{Number(stats.totalRevenue || 0).toFixed(2)}</strong>
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1">
                  Today: <strong>{stats.todayOrders}</strong> • Revenue: <strong>₹{Number(stats.todayRevenue || 0).toFixed(2)}</strong>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={downloadCSV} className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              CSV (Current)
            </button>
            <button onClick={downloadServerCSV} className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              CSV (All)
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={onChangeFilter}
            className="min-w-[150px] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
          </select>

          <input
            type="date"
            name="from"
            value={filters.from}
            onChange={onChangeFilter}
            max={getTodayDate()}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="to"
            value={filters.to}
            onChange={onChangeFilter}
            max={getTodayDate()}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="language"
            value={filters.language}
            onChange={onChangeFilter}
            className="min-w-[150px] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={onChangeFilter}
            className="min-w-[130px] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
          </select>

          <input
            type="text"
            placeholder="Plan name"
            name="planName"
            value={filters.planName}
            onChange={onChangeFilter}
            className="min-w-[150px] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="astroConsultation"
            value={filters.astroConsultation}
            onChange={onChangeFilter}
            className="min-w-[110px] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <select
            name="expressDelivery"
            value={filters.expressDelivery}
            onChange={onChangeFilter}
            className="min-w-[110px] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={onChangeFilter}
            className="min-w-[150px] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">createdAt</option>
            <option value="paymentAt">paymentAt</option>
            <option value="planName">planName</option>
            <option value="reportLanguage">reportLanguage</option>
          </select>

          <select
            name="sortOrder"
            value={filters.sortOrder}
            onChange={onChangeFilter}
            className="min-w-[100px] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">desc</option>
            <option value="asc">asc</option>
          </select>

          <button
            onClick={() => fetchList()}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setFilters({
                ...filters,
                q: "", from: "", to: "", dateRange: "", language: "", planName: "", status: "",
                astroConsultation: "", expressDelivery: "",
              });
            }}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <MainDatatable
            data={filteredRows}
            columns={columns}
            isLoading={loading}
            showSearch={false}
          />
        </div>
      </div>

      {/* VIEW Modal */}
      {viewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeRow && Object.entries(activeRow).map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs text-gray-600">{k}</div>
                  <div className="font-medium text-gray-900">{String(v ?? "")}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Order</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["planName", "Plan Name"],
                ["name", "Name"],
                ["email", "Email"],
                ["whatsapp", "WhatsApp"],
                ["gender", "Gender"],
                ["reportLanguage", "Report Language"],
                ["dateOfBirth", "DOB (YYYY-MM-DD)"],
                ["timeOfBirth", "TOB (HH:mm)"],
                ["placeOfBirth", "Place of Birth"],
                ["placeOfBirthPincode", "POB Pincode"],
                ["consultationDate", "Consultation Date"],
                ["consultationTime", "Consultation Time"],
                ["problemType", "Problem Type"],
                ["partnerDateOfBirth", "Partner DOB"],
                ["partnerTimeOfBirth", "Partner TOB"],
                ["partnerPlaceOfBirth", "Partner POB"],
                ["partnerPlaceOfBirthPincode", "Partner POB Pincode"],
                ["questionOne", "Question One"],
                ["questionTwo", "Question Two"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={(editPayload as any)[key] ?? ""}
                    onChange={(e) => setEditPayload(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editPayload.status || ""}
                  onChange={(e) => setEditPayload({ ...editPayload, status: e.target.value as any })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  checked={!!editPayload.astroConsultation}
                  onChange={(e) => setEditPayload(p => ({ ...p, astroConsultation: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Astro Consultation</label>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  checked={!!editPayload.expressDelivery}
                  onChange={(e) => setEditPayload(p => ({ ...p, expressDelivery: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Express Delivery</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportOrders;