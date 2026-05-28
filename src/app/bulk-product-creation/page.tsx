"use client";

import { useState, useRef } from "react";

/* ======================
   TYPES
====================== */
type ThirdPartyProduct = {
  product_id: number;
  product_name: string;
  product_sku: string;
  category_name: string;
  certifications_name: string | null;
  certifications_number: string | null;
  stock: number;
  mrp: string;
  price: string;
  weight_in_carat: string | null;
  color: string | null;
  origin: string | null;
  shape: string | null;
  transparency: string | null;
  treatment: string | null;
  image_url: string | null;
  images: string[];
  video_url: string | null;
  certificate_url: string | null;
  dimension: string | null;
};

type LogEntry = {
  id: number;
  sku: string;
  title: string;
  status: "success" | "failed" | "pending";
  message: string;
  time: string;
};

type RunStatus = "idle" | "fetching" | "creating" | "done" | "error";

/* ======================
   HELPERS
====================== */
function parseRupees(val: string | null | undefined): number {
  if (!val) return 0;
  const cleaned = String(val).replace(/[^\d.]/g, "");
  return parseFloat(cleaned) || 0;
}

const CONCURRENCY = 20;
const BATCH_DELAY_MS = 300;
const API_ENDPOINT = "/api/brahmagems"; // ← apna endpoint yahan daalo

/* ======================
   PAGE
====================== */
export default function BulkCreatePage() {
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(133);
  const [errorMessage, setErrorMessage] = useState("");
  const logIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  function addLog(entry: Omit<LogEntry, "id" | "time">) {
    const id = ++logIdRef.current;
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setLogs((prev) => {
      const next = [...prev, { ...entry, id, time }];
      return next.slice(-500); // max 500 logs in memory
    });
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function updateLog(id: number, update: Partial<LogEntry>) {
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...update } : l))
    );
  }

  /* ======================
     FETCH ALL PAGES
  ====================== */
 async function fetchAllProducts(): Promise<ThirdPartyProduct[]> {
  const res = await fetch(API_ENDPOINT);
  const data = await res.json();
  return data?.data?.products ?? [];
}

  /* ======================
     MAIN RUN
  ====================== */
  async function handleRun() {
    try {
      abortRef.current = false;
      setLogs([]);
      setProcessed(0);
      setSuccessCount(0);
      setFailCount(0);
      setErrorMessage("");
      setRunStatus("fetching");

      addLog({
        sku: "—",
        title: `Fetching pages ${startPage}–${endPage} from API...`,
        status: "pending",
        message: "",
      });

      const products = await fetchAllProducts();
      setTotalProducts(products.length);

      addLog({
        sku: "—",
        title: `✅ Fetched ${products.length} products. Starting creation...`,
        status: "success",
        message: "",
      });

      setRunStatus("creating");

      let successTotal = 0;
      let failTotal = 0;

      for (let i = 0; i < products.length; i += CONCURRENCY) {
        if (abortRef.current) {
          addLog({ sku: "—", title: "⛔ Aborted by user.", status: "failed", message: "" });
          break;
        }

        const batch = products.slice(i, i + CONCURRENCY);

        // Add pending logs for this batch
        const batchLogIds: number[] = [];
        for (const p of batch) {
          const logId = ++logIdRef.current;
          batchLogIds.push(logId);
          const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
          setLogs((prev) => [
            ...prev.slice(-500),
            { id: logId, sku: p.product_sku, title: p.product_name, status: "pending", message: "Creating...", time },
          ]);
        }

        const results = await Promise.allSettled(
          batch.map(async (p, idx) => {
            const basePrice = parseRupees(p.price);
            const sellingPrice = Math.round(basePrice * 2);
            const mrpPrice = parseRupees(p.mrp);

            const res = await fetch("/api/shopify/create-product", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product_name: p.product_name,
                sku: p.product_sku,
                price: sellingPrice,
                mrp: mrpPrice || null,
                image_url: p.image_url ?? null,
                images: Array.isArray(p.images) ? p.images : [],
                video_url: p.video_url ?? null,
                certificate_url: p.certificate_url ?? null,
                category_name: p.category_name,
                color: p.color,
                origin: p.origin,
                shape: p.shape,
                transparency: p.transparency,
                treatment: p.treatment,
                weight_in_carat: p.weight_in_carat,
                dimension: p.dimension,
                certifications_name: p.certifications_name,
                certifications_number: p.certifications_number,
              }),
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData?.error || `HTTP ${res.status}`);
            }

            return { idx, price: sellingPrice };
          })
        );

        // Update logs based on results
        let batchSuccess = 0;
        let batchFail = 0;

        results.forEach((result, idx) => {
          const logId = batchLogIds[idx];
          if (result.status === "fulfilled") {
            updateLog(logId, {
              status: "success",
              message: `₹${result.value.price.toLocaleString("en-IN")}`,
            });
            batchSuccess++;
          } else {
            updateLog(logId, {
              status: "failed",
              message: result.reason?.message || "Unknown error",
            });
            batchFail++;
          }
        });

        successTotal += batchSuccess;
        failTotal += batchFail;
        setSuccessCount(successTotal);
        setFailCount(failTotal);
        setProcessed(Math.min(i + CONCURRENCY, products.length));

        if (i + CONCURRENCY < products.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      }

      setRunStatus("done");
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setRunStatus("error");
    }
  }

  function handleAbort() {
    abortRef.current = true;
  }

  const progress = totalProducts > 0 ? Math.round((processed / totalProducts) * 100) : 0;
  const isRunning = runStatus === "fetching" || runStatus === "creating";

  /* ======================
     UI
  ====================== */
  return (
    <div
      style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}
      className="min-h-screen bg-zinc-950 text-zinc-100 p-8"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isRunning
                ? "bg-amber-400 animate-pulse"
                : runStatus === "done"
                ? "bg-emerald-400"
                : runStatus === "error"
                ? "bg-red-400"
                : "bg-zinc-600"
            }`}
          />
          <h1 className="text-xl font-medium tracking-tight text-zinc-100">
            Bulk Product Creator
          </h1>
        </div>
        <p className="text-zinc-500 text-sm ml-5">
          Fetch → 2x price → Push to Shopify
        </p>
      </div>

      {/* Config */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
          Configuration
        </div>
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">
              Start Page
            </label>
            <input
              type="number"
              value={startPage}
              onChange={(e) => setStartPage(Number(e.target.value))}
              disabled={isRunning}
              className="bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2 rounded-lg w-24 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">
              End Page
            </label>
            <input
              type="number"
              value={endPage}
              onChange={(e) => setEndPage(Number(e.target.value))}
              disabled={isRunning}
              className="bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2 rounded-lg w-24 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div className="text-xs text-zinc-500 pb-2">
            ~{endPage - startPage + 1} pages · {CONCURRENCY} parallel · 2× price
          </div>
          <div className="ml-auto flex gap-2">
            {isRunning ? (
              <button
                onClick={handleAbort}
                className="bg-red-900 hover:bg-red-800 text-red-200 px-5 py-2 rounded-lg text-sm transition-colors"
              >
                ⛔ Abort
              </button>
            ) : (
              <button
                onClick={handleRun}
                className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium px-6 py-2 rounded-lg text-sm transition-colors"
              >
                ▶ Run
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {(isRunning || runStatus === "done" || runStatus === "error") && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: totalProducts, color: "text-zinc-300" },
            { label: "Processed", value: processed, color: "text-blue-400" },
            { label: "Success", value: successCount, color: "text-emerald-400" },
            { label: "Failed", value: failCount, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <div className={`text-2xl font-medium ${color}`}>{value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {(isRunning || runStatus === "done") && totalProducts > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>
              {runStatus === "fetching" ? "Fetching from API..." : `Creating products`}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          ❌ {errorMessage}
        </div>
      )}

      {/* Done banner */}
      {runStatus === "done" && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-lg mb-4 text-sm">
          ✅ Done — {successCount} created, {failCount} failed
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">
              Live Logs
            </span>
            <span className="text-xs text-zinc-600">{logs.length} entries</span>
          </div>
          <div className="h-96 overflow-y-auto p-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-800/50 text-xs"
              >
                <span className="text-zinc-600 shrink-0 w-16">{log.time}</span>
                <span
                  className={`shrink-0 w-4 text-center ${
                    log.status === "success"
                      ? "text-emerald-400"
                      : log.status === "failed"
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                >
                  {log.status === "success"
                    ? "✓"
                    : log.status === "failed"
                    ? "✗"
                    : "·"}
                </span>
                <span className="text-zinc-500 shrink-0 w-20 truncate">
                  {log.sku}
                </span>
                <span className="text-zinc-300 flex-1 truncate">{log.title}</span>
                <span
                  className={`shrink-0 ${
                    log.status === "success"
                      ? "text-emerald-500"
                      : log.status === "failed"
                      ? "text-red-500"
                      : "text-zinc-600"
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}