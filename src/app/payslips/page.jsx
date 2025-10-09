"use client";

import { useState } from "react";
import useSWR from "swr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function EmployeePayslips({ user }) {
  const { data: payslips, mutate } = useSWR(`/api/payslip/${user.employeeId}`, fetcher);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  if (!payslips) return <p>Loading payslips...</p>;
  if (payslips.error) return <p className="text-red-500">{payslips.error}</p>;

  return (
    <div className="p-6">
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
                <Button size="sm" onClick={() => setSelectedPayslip(p)}>
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payslip Details Dialog */}
      {selectedPayslip && (
        <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payslip Details: {selectedPayslip.payroll.month}/{selectedPayslip.payroll.year}</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              <p><strong>Base Salary:</strong> ₹{selectedPayslip.baseSalary}</p>
              <p><strong>Overtime:</strong> ₹{selectedPayslip.overtimePay}</p>
              <p><strong>Deductions:</strong> ₹{selectedPayslip.deductions}</p>
              <p><strong>Taxes:</strong> ₹{selectedPayslip.taxes}</p>
              <p><strong>Bonuses:</strong> ₹{selectedPayslip.bonuses}</p>
              <p className="font-bold"><strong>Net Pay:</strong> ₹{selectedPayslip.netPay}</p>
              {selectedPayslip.remarks && <p><strong>Remarks:</strong> {selectedPayslip.remarks}</p>}
            </div>

            <DialogFooter className="mt-4">
              <Button onClick={() => setSelectedPayslip(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
