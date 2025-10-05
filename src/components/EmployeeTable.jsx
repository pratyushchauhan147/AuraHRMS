"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

const roles = ["ADMIN", "SENIOR_MANAGER", "HR_RECRUITER", "EMPLOYEE"];

export default function EmployeeTable({ initialEmployees, managerIdFilter = null }) {
  const [employees, setEmployees] = useState(initialEmployees || []);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "create" | "edit" | "view"
  
  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees', { cache: 'no-store' });
        if (res.ok) setEmployees(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    if (!managerIdFilter) return employees;
    return employees.filter(e => e.managerId === managerIdFilter && e.id !== managerIdFilter);
  }, [employees, managerIdFilter]);

  // Create or Update Employee (updates state directly)
  const handleSave = useCallback(async (employeeData) => {
    try {
      if (modalMode === "create") {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData),
        });
        if (!res.ok) throw new Error("Failed to create employee");
        const newEmployee = await res.json();
        setEmployees(prev => [...prev, newEmployee]);
      } else if (modalMode === "edit") {
        const res = await fetch(`/api/employees/${employeeData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData),
        });
        if (!res.ok) throw new Error("Failed to update employee");
        setEmployees(prev => prev.map(e => e.id === employeeData.id ? employeeData : e));
      }
      setSelectedEmployee(null);
      setModalMode(null);
    } catch (err) {
      alert(err.message);
    }
  }, [modalMode]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedEmployee(null);
    setModalMode(null);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700">
          {managerIdFilter ? "My Direct Reports" : "All Employees"}
        </h3>
        <div className="flex items-center gap-2">
          {!managerIdFilter && <Button onClick={() => setModalMode("create")}>Add Employee</Button>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><a href="/employee/report">Employee Reports/Review</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Position</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-5 py-5 border-b border-gray-200 text-center text-sm text-gray-500">
                  {managerIdFilter ? "No direct reports" : "No employees found"}
                </td>
              </tr>
            ) : filteredEmployees.map(emp => (
              <tr key={emp.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                  <p className="text-gray-500 text-xs">{emp.user?.email || 'N/A'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{emp.position}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedEmployee(emp); setModalMode("view"); }}>View</Button>
                  {!managerIdFilter && <Button variant="outline" size="sm" onClick={() => { setSelectedEmployee(emp); setModalMode("edit"); }}>Edit</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modalMode === "create" && (
        <Dialog open={true} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Create New Employee</DialogTitle></DialogHeader>
            <CreateEmployeeForm onSave={handleSave} onCancel={handleCloseModal} />
          </DialogContent>
        </Dialog>
      )}

      {modalMode === "edit" && selectedEmployee && (
        <Dialog open={true} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Edit Employee</DialogTitle></DialogHeader>
            <EditEmployeeForm employee={selectedEmployee} allEmployees={employees} onSave={handleSave} onCancel={handleCloseModal} />
          </DialogContent>
        </Dialog>
      )}

      {modalMode === "view" && selectedEmployee && (
        <Dialog open={true} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedEmployee.firstName} {selectedEmployee.lastName}</DialogTitle>
              <DialogDescription>{selectedEmployee.position}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Email</Label><span>{selectedEmployee.user?.email}</span></div>
              <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Hire Date</Label><span>{selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toLocaleDateString() : ''}</span></div>
              <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Manager</Label><span>{selectedEmployee.manager ? `${selectedEmployee.manager.firstName} ${selectedEmployee.manager.lastName}` : 'N/A'}</span></div>
              <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Salary</Label><span>{selectedEmployee.salary ? `$${selectedEmployee.salary.toLocaleString()}` : "Not set"}</span></div>
              <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Notes</Label><p className="border bg-gray-50 rounded-md p-2 h-24 overflow-y-auto">{selectedEmployee.notes || "No notes available."}</p></div>
            </div>
            <DialogFooter><Button onClick={handleCloseModal}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
