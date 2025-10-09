// in src/components/EmployeeTable.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import CreateEmployeeForm from "./Employee/CreateEmployeeForm";
import EditEmployeeForm from "./Employee/EditEmployeeForm";

export default function EmployeeTable({ userRole }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "create", "edit", or "view"
  
  const isPrivilegedUser = userRole === 'ADMIN' || userRole === 'HR_RECRUITER';

  const fetchEmployees = useCallback(async () => {
    try {
      // The smart API will return the correct list based on our role
      const res = await fetch('/api/employees', { cache: 'no-store' });
      if (res.ok) {
        setEmployees(await res.json());
      } else {
        console.error("Failed to fetch employees list.");
        // If the user is not authorized, the API returns 403, and this will catch it.
        // We can optionally set an error state here.
      }
    } catch (err) { 
      console.error("Error fetching employees:", err); 
    }
  }, []);
  
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSave = useCallback(async (employeeData) => {
    const isCreating = modalMode === 'create';
    const url = isCreating ? '/api/employees' : `/api/employees/${employeeData.id}`;
    const method = isCreating ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(employeeData) });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || (isCreating ? "Failed to create employee" : "Failed to update employee"));
      }
      
      setModalMode(null);
      await fetchEmployees(); 

    } catch (err) {
      alert(err.message);
    }
  }, [modalMode, fetchEmployees]);
  
  const handleCloseModal = useCallback(() => {
    setModalMode(null);
    setSelectedEmployee(null);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          {isPrivilegedUser ? "All Employees" : (userRole === 'SENIOR_MANAGER' ? "My Direct Reports" : "My Team")}
        </h3>
        {isPrivilegedUser && <Button onClick={() => setModalMode("create")}>Add New Employee</Button>}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map(emp => (
              <tr key={emp.id}>
                <td className="px-5 py-5 border-b"><p className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p><p className="text-xs text-gray-500">{emp.user?.email || 'N/A'}</p></td>
                <td className="px-5 py-5 border-b">{emp.position}</td>
                <td className="px-5 py-5 border-b flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedEmployee(emp); setModalMode("view"); }}>View</Button>
                  {isPrivilegedUser && <Button variant="outline" size="sm" onClick={() => { setSelectedEmployee(emp); setModalMode("edit"); }}>Edit</Button>}
                </td>
              </tr>
            ))}
             {employees.length === 0 && (
                <tr><td colSpan={isPrivilegedUser ? 3 : 2} className="text-center py-4 text-gray-500">No employees to display.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{modalMode === 'create' ? 'Create New Employee' : 'Edit Employee'}</DialogTitle></DialogHeader>
          {modalMode === 'create' && <CreateEmployeeForm onSave={handleSave} onCancel={handleCloseModal} />}
          {modalMode === 'edit' && selectedEmployee && <EditEmployeeForm employee={selectedEmployee} allEmployees={employees} onSave={handleSave} onCancel={handleCloseModal} />}
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === 'view'} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg">{selectedEmployee && <>
          <DialogHeader>
            <DialogTitle>{selectedEmployee.firstName} {selectedEmployee.lastName}</DialogTitle>
            <DialogDescription>{selectedEmployee.position}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500">Email</Label><span>{selectedEmployee.user?.email}</span></div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500">Hire Date</Label><span>{selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toLocaleDateString() : 'N/A'}</span></div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500 font-semibold">Manager</Label><span className="font-medium">{selectedEmployee.manager ? `${selectedEmployee.manager.firstName} ${selectedEmployee.manager.lastName}` : "N/A"}</span></div>
            
            {isPrivilegedUser && (
              <>
                <div className="border-t my-2"></div>
                <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500">Salary</Label><span>{selectedEmployee.salary ? `$${selectedEmployee.salary.toLocaleString()}` : "Not set"}</span></div>
                <div className="border-t my-2"></div>
                <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500 mt-1">Notes</Label><p className="border bg-gray-50 rounded-md p-2 text-gray-700 h-24 overflow-y-auto">{selectedEmployee.notes || "No notes available."}</p></div>
              </>
            )}
          </div>
          <DialogFooter><Button onClick={handleCloseModal}>Close</Button></DialogFooter>
        </>}</DialogContent>
      </Dialog>
    </div>
  );
}