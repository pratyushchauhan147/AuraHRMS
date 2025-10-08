// in src/components/Employee/EditEmployeeForm.jsx
"use client";
    
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

export default function EditEmployeeForm({ employee, allEmployees, onSave, onCancel }) {
  const [formData, setFormData] = useState(employee);
  const potentialManagers = allEmployees.filter(e => e.id !== employee.id);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseFloat(value) || null : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };
  
  const handleManagerChange = (managerId) => {
    setFormData(prev => ({...prev, managerId: managerId === "none" ? null : managerId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange} /></div>
        <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="position">Position</Label><Input id="position" name="position" value={formData.position || ''} onChange={handleChange} /></div>
      <div className="space-y-2"><Label htmlFor="salary">Salary</Label><Input id="salary" name="salary" type="number" value={formData.salary || ''} onChange={handleChange} placeholder="e.g., 50000"/></div>
      <div className="space-y-2"><Label htmlFor="managerId">Reports To (Manager)</Label><Select onValueChange={handleManagerChange} defaultValue={formData.managerId || "none"}><SelectTrigger><SelectValue placeholder="Select a manager" /></SelectTrigger><SelectContent><SelectItem value="none">-- None --</SelectItem>{potentialManagers.map(mgr => (<SelectItem key={mgr.id} value={mgr.id}>{mgr.firstName} {mgr.lastName}</SelectItem>))}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" value={formData.notes || ''} onChange={handleChange} /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
}