"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function EmployeePayslips({ user }) {
  const { data: payslips } = useSWR(`/api/payslip/${user.employeeId}`, fetcher);
  const [selected, setSelected] = useState(null);

  if (!payslips) return <p>Loading payslips...</p>;
  if (payslips.error) return <p className="text-red-500">{payslips.error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Payslips</h1>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Month/Year</th>
            <th className="border px-4 py-2">Net Pay</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payslips.map((p) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.payroll.month}/{p.payroll.year}</td>
              <td className="border px-4 py-2">₹{p.netPay}</td>
              <td className="border px-4 py-2">{p.status}</td>
              <td className="border px-4 py-2">
                <Button onClick={() => setSelected(p)}>View</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payslip Details ({selected.payroll.month}/{selected.payroll.year})</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              <p><strong>Base Salary:</strong> ₹{selected.baseSalary}</p>
              <p><strong>Overtime:</strong> ₹{selected.overtimePay}</p>
              <p><strong>Deductions:</strong> ₹{selected.deductions}</p>
              <p><strong>Taxes:</strong> ₹{selected.taxes}</p>
              <p><strong>Bonuses:</strong> ₹{selected.bonuses}</p>
              <p className="font-bold"><strong>Net Pay:</strong> ₹{selected.netPay}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
