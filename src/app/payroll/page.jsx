// src/app/payrolls/page.jsx
import { getUserSession } from "@/lib/session";
import AdminPayrollDashboard from "@/components/Payrolls/AdminPayrollDashboard";
import EmployeePayslips from "@/components/Payrolls/EmployeePayslips";

export default async function PayrollsPage() {
  const user = await getUserSession(); // Server-side fetch

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-red-500 font-bold">
          You must be logged in to view payrolls.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role) ? (
        <AdminPayrollDashboard user={user} />
      ) : (
        <EmployeePayslips user={user} />
      )}
    </div>
  );
}
