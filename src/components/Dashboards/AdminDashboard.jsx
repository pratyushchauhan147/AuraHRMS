// in src/components/AdminDashboard.jsx
import prisma from "@/lib/prisma";

import ResumeScreener from "../ResumeScreener";
import CopilotWidget from "../CopilotWidget"; // Corrected the import name
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import LeaveApprovalDashboard from "../LeaveApprovalDashboard"; 
import EmployeeTable from "../EmployeeTable"; 
import AttendanceTable from "../Attendance/AttendanceTable";
import Reports from "../Reports";
import CleanupButton from "../admin/CleanupButton";
export default async function AdminDashboard() {
  // 1. Fetch the initial data on the server
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
  const allPendingRequests = await prisma.leaveRequest.findMany({
    where: { status: 'PENDING' },
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'asc' }
  });


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-4"> {/* Changed grid-cols-2 to 3 */}
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="screener">AI Resume Screener</TabsTrigger>
          <TabsTrigger value="approvals">Leave Approvals</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger> 
          <TabsTrigger value="attendance">Attendance</TabsTrigger> 
           <TabsTrigger value="tools">Admin Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="mt-4">
          <LeaveApprovalDashboard initialRequests={allPendingRequests} />
        </TabsContent>

  
       

        <TabsContent value="employees" className="mt-4">
          {/* 2. Pass the server-fetched data as a prop to the Client Component */}
          <EmployeeTable initialEmployees={employees} />
        </TabsContent>

        <TabsContent value="screener" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ResumeScreener />
          </div>
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
         <div className="h-fit"> <Reports/>
         </div>
           
        </TabsContent>

      <TabsContent value="attendance" className="mt-4">
  <div className="flex justify-end mb-4">
   
    <a
      href="/attendance"
     
    >
       <Button >Go To Attendance</Button>
    </a>
  </div>
  <div className="h-fit">
    <AttendanceTable />
  </div>
</TabsContent>

 <TabsContent value="tools" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Data Management</h3>
            <p className="text-sm text-gray-500 mb-4">Run periodic cleanup jobs to maintain database health and data privacy.</p>
            <CleanupButton />
          </div>
        </TabsContent>

        
  
      </Tabs>
 
            
    </div>
  );
}