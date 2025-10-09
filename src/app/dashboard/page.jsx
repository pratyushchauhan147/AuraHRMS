// src/app/dashboard/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as jose from "jose";

import AdminDashboard from "@/components/Dashboards/AdminDashboard";
import HRDashboard from "@/components/Dashboards/HRDashboard";
import EmployeeDashboard from "@/components/Dashboards/EmployeeDashboard";
import ManagerDashboard from "@/components/Dashboards/ManagerDashboard";
import ClockInOutButton from "@/components/Attendance/ClockInOutButton";
import RecruitmentNavButton from "@/components/RecruitmentNavButton"; // 👈 new client component
import PayrollNavButton from "@/components/PayrollNavButton"; // 👈 new client component
async function getUserSession() {
  const token = cookies().get("session-token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload; // { id, email, role, iat, exp }
  } catch (error) {
    return null;
  }
}

export default async function DashboardPage() {
  const user = await getUserSession();

  if (!user) redirect("/login");

  const DashboardContent = () => {
    switch (user.role) {
      case "ADMIN":
        return <AdminDashboard user={user} />;
      case "SENIOR_MANAGER":
        return <ManagerDashboard user={user} />;
      case "HR_RECRUITER":
        return <HRDashboard />;
      case "EMPLOYEE":
        return <EmployeeDashboard user={user} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header with ClockInOutButton on the right */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p>
            Welcome, <span className="font-semibold">{user.email}</span>!
          </p>
          <p>
            Role:{" "}
            <span className="px-2 py-1 text-sm font-medium bg-gray-200 text-gray-800 rounded-md">
              {user.role}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Show ClockInOutButton only for employees */}
          {user.role !== "ADMIN" && (
            <ClockInOutButton userId={user.id} />
          )}

          {/* Show recruitment button for HR or Admin */}
          {(user.role === "HR_RECRUITER" || user.role === "ADMIN") && (
            <RecruitmentNavButton />
          )}
          <PayrollNavButton user={user} />
        </div>
      </header>

      {/* Main dashboard content */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <DashboardContent />
      </div>
    </div>
  );
}
