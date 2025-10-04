// in src/components/AdminDashboard.jsx
import prisma from "@/lib/prisma";
import ResumeScreener from "../ResumeScreener";
import CopilotWidget from "../CopilotWidget"; // Corrected the import name
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeeTable from "../EmployeeTable"; // <-- Import our new Client Component

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

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-3"> {/* Changed grid-cols-2 to 3 */}
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="screener">AI Resume Screener</TabsTrigger>
          <TabsTrigger value="copilot">Copilot</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-4">
          {/* 2. Pass the server-fetched data as a prop to the Client Component */}
          <EmployeeTable initialEmployees={employees} />
        </TabsContent>

        <TabsContent value="screener" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ResumeScreener />
          </div>
        </TabsContent>

        <TabsContent value="copilot" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CopilotWidget />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}