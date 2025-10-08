"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EmployeeViewModal({ employee, onClose }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{employee.firstName} {employee.lastName}</DialogTitle>
          <DialogDescription>{employee.position}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Email</Label><span>{employee.user?.email}</span></div>
          <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Hire Date</Label><span>{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : ''}</span></div>
          <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Manager</Label><span>{employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'N/A'}</span></div>
          <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Salary</Label><span>{employee.salary ? `$${employee.salary.toLocaleString()}` : "Not set"}</span></div>
          <div className="grid grid-cols-[150px_1fr] gap-4"><Label>Notes</Label><p className="border bg-gray-50 rounded-md p-2 h-24 overflow-y-auto">{employee.notes || "No notes available."}</p></div>
        </div>
        <DialogFooter><Button onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
