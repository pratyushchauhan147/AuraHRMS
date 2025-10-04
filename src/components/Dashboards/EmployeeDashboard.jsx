// in src/components/EmployeeDashboard.jsx
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

// Helper to apply colors to the status badges
const getStatusVariant = (status) => {
  switch (status) {
    case "APPROVED":
      return "default";
    case "DENIED":
      return "destructive";
    case "PENDING":
    default:
      return "secondary";
  }
};

export default async function EmployeeDashboard({ user }) {
  // Fetch the employee's detailed profile and their leave requests in one query
  const employee = await prisma.employee.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      manager: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      leaveRequests: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!employee) {
    return <div>Could not find employee profile. Please contact HR.</div>;
  }

  const managerName = employee.manager
    ? `${employee.manager.firstName} ${employee.manager.lastName}`
    : "N/A";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">My Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome, {employee.firstName}!</p>
      </div>

      {/* Profile Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">My Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Full Name</p>
            <p className="font-medium text-gray-800">{employee.firstName} {employee.lastName}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-800">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Position</p>
            <p className="font-medium text-gray-800">{employee.position}</p>
          </div>
          <div>
            <p className="text-gray-500">Manager</p>
            <p className="font-medium text-gray-800">{managerName}</p>
          </div>
        </div>
      </div>

      {/* Leave Requests Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-xl font-semibold">My Leave Requests</h3>
            {/* We will add the button to open the request form here later */}
        </div>
        
        {employee.leaveRequests.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Start Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">End Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {employee.leaveRequests.map(req => (
                <tr key={req.id}>
                  <td className="py-2 px-3 text-sm text-gray-800">{new Date(req.startDate).toLocaleDateString()}</td>
                  <td className="py-2 px-3 text-sm text-gray-800">{new Date(req.endDate).toLocaleDateString()}</td>
                  <td className="py-2 px-3"><Badge variant={getStatusVariant(req.status)}>{req.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">You have not submitted any leave requests.</p>
        )}
      </div>
    </div>
  );
}