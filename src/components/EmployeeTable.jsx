// in src/components/EmployeeTable.jsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// The problematic prisma import has been removed.

// We define the roles as a simple constant array for the client-side form
const roles = ["ADMIN", "SENIOR_MANAGER", "HR_RECRUITER", "EMPLOYEE"];

// Sub-component for the Create Employee Form
function CreateEmployeeForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', 
    position: '', role: 'EMPLOYEE', contactNumber: '', address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>First Name</Label><Input name="firstName" required onChange={handleChange} /></div><div className="space-y-2"><Label>Last Name</Label><Input name="lastName" required onChange={handleChange} /></div></div>
      <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required onChange={handleChange} /></div>
      <div className="space-y-2"><Label>Password</Label><Input name="password" type="password" required onChange={handleChange} /></div>
      <div className="space-y-2"><Label>Position</Label><Input name="position" required onChange={handleChange} /></div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select onValueChange={handleRoleChange} defaultValue="EMPLOYEE">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {/* We now map over our constant 'roles' array */}
            {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Contact Number</Label><Input name="contactNumber" onChange={handleChange} /></div>
      <div className="space-y-2"><Label>Address</Label><Input name="address" onChange={handleChange} /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Create Employee</Button></DialogFooter>
    </form>
  );
}

// Sub-component for the Edit Employee Form
function EditEmployeeForm({ employee, allEmployees, onSave, onCancel }) {
  const [formData, setFormData] = useState(employee);
  const potentialManagers = allEmployees.filter(e => e.id !== employee.id);
  const handleChange = (e) => { const { name, value, type } = e.target; const finalValue = type === 'number' ? parseFloat(value) || null : value; setFormData(prev => ({ ...prev, [name]: finalValue })); };
  const handleManagerChange = (managerId) => { setFormData(prev => ({...prev, managerId: managerId === "none" ? null : managerId })); };
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>First Name</Label><Input name="firstName" value={formData.firstName || ''} onChange={handleChange} /></div><div className="space-y-2"><Label>Last Name</Label><Input name="lastName" value={formData.lastName || ''} onChange={handleChange} /></div></div>
        <div className="space-y-2"><Label>Position</Label><Input name="position" value={formData.position || ''} onChange={handleChange} /></div>
        <div className="space-y-2"><Label>Salary</Label><Input name="salary" type="number" value={formData.salary || ''} onChange={handleChange} placeholder="e.g., 50000"/></div>
        <div className="space-y-2"><Label>Reports To (Manager)</Label><Select onValueChange={handleManagerChange} defaultValue={formData.managerId || "none"}><SelectTrigger><SelectValue placeholder="Select a manager" /></SelectTrigger><SelectContent><SelectItem value="none">-- None --</SelectItem>{potentialManagers.map(mgr => (<SelectItem key={mgr.id} value={mgr.id}>{mgr.firstName} {mgr.lastName}</SelectItem>))}</SelectContent></Select></div>
        <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter>
    </form>
  );
}

// Main Interactive Table Component
export default function EmployeeTable({ initialEmployees }) {
  const [employees, setEmployees] = useState(initialEmployees || []);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      } else { console.error("Failed to fetch employees list."); }
    } catch (error) { console.error("Error fetching employees:", error); }
  };
  
  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async (updatedEmployee) => {
    const trimmedId = updatedEmployee.id.trim();
    await fetch(`/api/employees/${trimmedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEmployee),
    });
    setEditingEmployee(null);
    fetchEmployees();
  };

  const handleCreate = async (newEmployeeData) => {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployeeData),
    });
    if (res.ok) {
      setIsCreateModalOpen(false);
      fetchEmployees();
    } else {
      const data = await res.json();
      alert(`Failed to create employee: ${data.error}`);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreateModalOpen(true)}>Add New Employee</Button>
      </div>
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
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="font-semibold text-gray-900">{employee.firstName} {employee.lastName}</p><p className="text-gray-500 text-xs">{employee.user?.email || 'N/A'}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900">{employee.position}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setViewingEmployee(employee)}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingEmployee(employee)}>Edit</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Create New Employee</DialogTitle></DialogHeader><CreateEmployeeForm onSave={handleCreate} onCancel={() => setIsCreateModalOpen(false)} /></DialogContent>
      </Dialog>
      
      <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Edit Employee</DialogTitle></DialogHeader>{editingEmployee && <EditEmployeeForm employee={editingEmployee} allEmployees={employees} onSave={handleSave} onCancel={() => setEditingEmployee(null)}/>}</DialogContent>
      </Dialog>
  
      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{viewingEmployee?.firstName} {viewingEmployee?.lastName}</DialogTitle><DialogDescription>{viewingEmployee?.position}</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500">Email</Label><span>{viewingEmployee?.user?.email}</span></div>
          <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500">Hire Date</Label><span>{viewingEmployee ? new Date(viewingEmployee.hireDate).toLocaleDateString() : ''}</span></div>
          <div className="border-t my-2"></div>
          <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500 font-semibold">Manager</Label><span className="font-medium">{viewingEmployee?.manager ? `${viewingEmployee.manager.firstName} ${viewingEmployee.manager.lastName}` : "N/A"}</span></div>
          <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500">Salary</Label><span>{viewingEmployee?.salary ? `$${viewingEmployee.salary.toLocaleString()}` : "Not set"}</span></div>
          <div className="border-t my-2"></div>
          <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500">Job Satisfaction</Label><span>{viewingEmployee?.jobSatisfaction ? `${viewingEmployee.jobSatisfaction} / 5` : "Not set"}</span></div>
          <div className="grid grid-cols-[150px_1fr] items-center gap-4"><Label className="text-right text-gray-500">Performance Rating</Label><span>{viewingEmployee?.performanceRating ? `${viewingEmployee.performanceRating} / 5` : "Not set"}</span></div>
          <div className="grid grid-cols-[150px_1fr] items-start gap-4"><Label className="text-right text-gray-500 mt-1">Notes</Label><p className="border bg-gray-50 rounded-md p-2 text-gray-700 h-24 overflow-y-auto">{viewingEmployee?.notes || "No notes available."}</p></div>
        </div>
        <DialogFooter><Button onClick={() => setViewingEmployee(null)}>Close</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}