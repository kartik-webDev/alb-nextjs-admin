/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import moment from "moment";
import { Order } from "../types";
import { ViewSvg } from "@/components/svgs/page";
import MainDatatable from "@/components/common/MainDatatable";
import { SendHorizonal, Mail, MailX, Loader2, Pencil, X } from "lucide-react";
import { EditSvg } from "../../../../../public/assets/svg";

interface Props {
  data: Order[];
  loading: boolean;
  page: number;
  limit: number;
  selectedIds: string[];
  onToggleRow: (orderId: string) => void;
  onToggleAll: () => void;
  onView: (row: Order) => void;
  onResendNotification: (orderId: string, driveUrl: string) => Promise<void>;
}

// ✅ Dialog Component
const SendDialog: React.FC<{
  order: Order;
  onClose: () => void;
  onSend: (orderId: string, url: string) => Promise<void>;
}> = ({ order, onClose, onSend }) => {
  const [url, setUrl] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!url.trim()) return;
    setSending(true);
    try {
      await onSend(order._id!, url.trim());
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      {/* Dialog Box */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Send Report</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {/* Name - read only */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Name</label>
            <input
              type="text"
              value={order.name || "—"}
              readOnly
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* WhatsApp - read only */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">WhatsApp Number</label>
            <input
              type="text"
              value={order.whatsapp || "—"}
              readOnly
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Drive URL - editable */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Drive URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Google Drive URL..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              autoFocus
              disabled={sending}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!url.trim() || sending}
            className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <SendHorizonal className="w-3.5 h-3.5" /> Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const OrdersTable: React.FC<Props> = ({
  data,
  loading,
  page,
  limit,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onView,
  onResendNotification,
}) => {
  const [dialogOrder, setDialogOrder] = useState<Order | null>(null);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());

  const handleSend = async (orderId: string, url: string) => {
    setSendingIds((prev) => new Set(prev).add(orderId));
    try {
      await onResendNotification(orderId, url);
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: "S.No.",
        selector: (_: Order, idx?: number) =>
          (page - 1) * limit + (idx || 0) + 1,
        width: "70px",
      },
      {
        name: "Plan",
        selector: (row: Order) => row?.planName || "—",
        width: "180px",
      },
      {
        name: "Amount",
        selector: (row: Order) => `₹${row?.amount?.split(" ")[0] || "0"}`,
        width: "100px",
      },
      {
        name: "Payment",
        cell: (row: Order) => (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              row?.status === "paid"
                ? "bg-green-100 text-green-700"
                : row?.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {row?.status === "paid" ? "Paid" : row?.status || "—"}
          </span>
        ),
        width: "90px",
      },
      {
        name: "Report Status",
        cell: (row: Order) => {
          const isSending = sendingIds.has(row._id || "");
          if (isSending)
            return (
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Processing
              </span>
            );

          const s = row?.reportDeliveryStatus;
          if (!s || s === "pending")
            return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
          if (s === "processing")
            return <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium">Processing</span>;
          if (s === "delivered")
            return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Delivered</span>;
          if (s === "failed")
            return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Failed</span>;
          return <span className="text-gray-400 text-xs">—</span>;
        },
        width: "130px",
      },
      {
        name: "Email",
        cell: (row: Order) => {
          if (row?.emailDelivered === true)
            return (
              <div className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-green-700">Sent</span>
              </div>
            );
          if (row?.emailDelivered === false)
            return (
              <div className="flex items-center gap-1">
                <MailX className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs text-red-600">Failed</span>
              </div>
            );
          return <span className="text-xs text-gray-400">Pending</span>;
        },
        width: "90px",
      },
      {
        name: "Name",
        selector: (row: Order) => row?.name || "—",
        width: "140px",
      },
      {
        name: "WhatsApp",
        selector: (row: Order) => row?.whatsapp || "—",
        width: "120px",
      },
      {
        name: "Language",
        selector: (row: Order) => row?.reportLanguage || "—",
        width: "90px",
      },
      {
        name: "Created",
        selector: (row: Order) =>
          row?.formattedCreatedAt ||
          (row?.createdAt
            ? moment(row.createdAt).format("DD/MM/YY hh:mm A")
            : "—"),
        width: "130px",
      },
      {
        name: "Actions",
        cell: (row: Order) => {
          const isSending = sendingIds.has(row._id || "");
          const isDelivered = row.reportDeliveryStatus === "delivered";

          return (
            <div className="flex items-center gap-2">
              {/* View */}
              <button
                onClick={() => onView(row)}
                className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
                title="View Details"
              >
                <ViewSvg />
              </button>

              {/* ✅ Pencil — sirf tab dikhao jab delivered nahi hai */}
              {!isDelivered && row._id && (
                <button
                  onClick={() => setDialogOrder(row)}
                  disabled={isSending}
                  className="p-1 hover:bg-yellow-50 rounded transition-colors shrink-0 disabled:opacity-40"
                  title="Send Report"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  ) : (
                    <EditSvg/>
                  )}
                </button>
              )}
            </div>
          );
        },
        width: "120px",
      },
    ];
  }, [page, limit, sendingIds, onView]);

  return (
    <>
      {/* ✅ Dialog */}
      {dialogOrder && (
        <SendDialog
          order={dialogOrder}
          onClose={() => setDialogOrder(null)}
          onSend={async (orderId, url) => {
            await handleSend(orderId, url);
            setDialogOrder(null);
          }}
        />
      )}

      <div className="mb-4">
        {data.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            No orders found with the current filters.
          </div>
        ) : (
          <MainDatatable
            data={data}
            columns={columns.map((col) => ({
              ...col,
              minwidth: col.width,
              width: undefined,
            }))}
            isLoading={loading}
            showSearch={false}
          />
        )}
      </div>
    </>
  );
};