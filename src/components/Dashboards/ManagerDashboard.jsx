import prisma from "@/lib/prisma";
import LeaveApprovalDashboard from "../LeaveApprovalDashboard";
import ReviewGenerator from "../GenerateReview"; 
import EmployeeTable from "../EmployeeTable"; // <-- Import our new Client Component
// Assuming you have a Tabs component available in your project, e.g., from shadcn/ui
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 


export default async function ManagerDashboard({ user }) {
  // Find the manager's own employee profile to get their ID
  const managerProfile = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
     
        manager: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

  let pendingRequests = [];
  if (managerProfile) {
    // Fetch pending leave requests ONLY for employees whose managerId matches this manager
    pendingRequests = await prisma.leaveRequest.findMany({
      where: {
        status: 'PENDING',
        employee: {
          managerId: managerProfile.id,
        },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      }
    });
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Manager Dashboard</h2>

      {/* Adopt the Tabs structure for organizing manager tasks */}
      <Tabs defaultValue="approvals" className="w-full">
        {/* Tabs List for Navigation */}
        <TabsList className="grid w-full grid-cols-3"> 
          <TabsTrigger value="approvals">Leave Approvals</TabsTrigger>
          <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Content for Leave Approvals Tab */}
        <TabsContent value="approvals" className="mt-4">
            {/* The LeaveApprovalDashboard will use the data fetched specific to this manager */}
            <LeaveApprovalDashboard initialRequests={pendingRequests} />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
         <EmployeeTable initialEmployees={employees} managerIdFilter={managerProfile.id} />
            
        </TabsContent>

        {/* Content for Performance Reviews Tab */}
        <TabsContent value="reviews" className="mt-4">
            {/* Wrap the generator in a card-like structure for consistency, similar to the Admin's Resume Screener */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <ReviewGenerator />
            </div>
        </TabsContent>

        {/* Attrition Intelligence widget can be added as a third tab here later */}
      </Tabs>
    </div>
  );
}