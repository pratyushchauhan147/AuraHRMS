// in src/app/dashboard/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as jose from "jose";
import AdminDashboard from "@/components/Dashboards/AdminDashboard";
import HRDashboard from "@/components/Dashboards/HRDashboard";
import EmployeeDashboard from "@/components/Dashboards/EmployeeDashboard";
async function getUserSession() {
  const token = cookies().get("session-token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload; // Returns { id, email, role, iat, exp }
  } catch (error) {
    return null;
  }
}

// This is the main Dashboard page component
export default async function DashboardPage() {
  const user = await getUserSession();

  // This is a second layer of protection. 
  // If for some reason the middleware fails or is disabled, this will redirect.
  if (!user) {
    redirect("/login");
  }

  // A simple component to render content based on role
  const DashboardContent = () => {
    switch (user.role) {
      case "ADMIN":
        return <AdminDashboard />;
      case "SENIOR_MANAGER":
        return <div>Senior Manager Dashboard Content</div>;
      case "HR_RECRUITER":
        return <HRDashboard />;
      case "EMPLOYEE":
        return <EmployeeDashboard user={user} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-2">
        Welcome, <span className="font-semibold">{user.email}</span>!
      </p>
      <p className="mb-6">
        Your role is: <span className="px-2 py-1 text-sm font-medium bg-gray-200 text-gray-800 rounded-md">{user.role}</span>
      </p>
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Your View:</h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <DashboardContent />
        </div>
      </div>
    </div>
  );
}