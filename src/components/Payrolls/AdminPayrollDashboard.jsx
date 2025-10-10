"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminPayrollDashboard() {
  const { data: payrolls, mutate } = useSWR("/api/payroll", fetcher);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("HOUR"); // "HOUR" or "DAY"

  if (!payrolls) return <p>Loading payrolls...</p>;
  if (payrolls.error) return <p className="text-red-500">{payrolls.error}</p>;

  const handlePreview = async () => {
    setLoading(true);
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    let url = mode === "DAY" ? "/api/payroll/preview/daywise" : "/api/payroll/preview";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year }),
    });
    const data = await res.json();
    setPreview(data);
    setLoading(false);
    setOpen(true);
  };

  const handleGenerate = async () => {
    if (!preview) return;
    let url = mode === "DAY" ? "/api/payroll/generate/daywise" : "/api/payroll/generate";
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: preview.month, year: preview.year }),
    });
    setOpen(false);
    mutate();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payroll Dashboard</h1>

      <div className="mb-4 flex items-center gap-4">
        <div>
          <label className="mr-2 font-semibold">Select Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="HOUR">Hour-based</option>
            <option value="DAY">Day-based</option>
          </select>
        </div>
        <Button onClick={handlePreview} disabled={loading}>
          {loading ? "Preparing preview..." : "Generate Payroll for Current Month"}
        </Button>
      </div>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Month/Year</th>
            <th className="border px-4 py-2">Employees</th>
            <th className="border px-4 py-2">Total Payout</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((p) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.month}/{p.year}</td>
              <td className="border px-4 py-2">{p?._count?.payslips ?? 0}</td>
              <td className="border px-4 py-2">₹{p.totalPayout ?? 0}</td>
              <td className="border px-4 py-2">{p.status}</td>
              <td className="border px-4 py-2">
                <Button onClick={() => (window.location.href = `/payroll/${p.id}`)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payroll Generation</DialogTitle>
            <DialogDescription>
              Review the payroll details before confirming generation.
            </DialogDescription>
          </DialogHeader>

          {preview ? (
            <div className="space-y-3 text-sm">
              <p>
                <strong>Month/Year:</strong> {preview.month}/{preview.year}
              </p>
              <p>
                <strong>Mode:</strong> {mode === "DAY" ? "Day-based" : "Hour-based"}
              </p>
              <p>
                <strong>Employees Included:</strong> {preview.totalEmployees}
              </p>
              <p>
                <strong>Estimated Total Payout:</strong> ₹{preview.totalPayout}
              </p>
            </div>
          ) : (
            <p>Loading preview...</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={!preview}>
              Confirm Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
