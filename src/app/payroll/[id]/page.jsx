"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function PayrollView({ user }) {
  const { id } = useParams();
  const { data: payroll } = useSWR(`/api/payroll/${id}`, fetcher);

  if (!payroll) return <p>Loading...</p>;
  if (payroll.error) return <p className="text-red-500">{payroll.error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll: {payroll.month}/{payroll.year}</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Employee</th>
            <th className="border px-4 py-2">Base Salary</th>
            <th className="border px-4 py-2">Overtime</th>
            <th className="border px-4 py-2">Deductions</th>
            <th className="border px-4 py-2">Taxes</th>
            <th className="border px-4 py-2">Bonuses</th>
            <th className="border px-4 py-2">Net Pay</th>
          </tr>
        </thead>
        <tbody>
          {payroll.payslips.map((ps) => (
            <tr key={ps.id}>
              <td className="border px-4 py-2">{ps.employee.firstName} {ps.employee.lastName}</td>
              <td className="border px-4 py-2">₹{ps.baseSalary}</td>
              <td className="border px-4 py-2">₹{ps.overtimePay}</td>
              <td className="border px-4 py-2">₹{ps.deductions}</td>
              <td className="border px-4 py-2">₹{ps.taxes}</td>
              <td className="border px-4 py-2">₹{ps.bonuses}</td>
              <td className="border px-4 py-2 font-bold">₹{ps.netPay}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
