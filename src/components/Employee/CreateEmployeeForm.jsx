// in src/components/Employee/CreateEmployeeForm.jsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

const roles = ["ADMIN", "SENIOR_MANAGER", "HR_RECRUITER", "EMPLOYEE"];

export default function CreateEmployeeForm({ onSave, onCancel }) {
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" value={formData.firstName} required onChange={handleChange} /></div>
        <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" value={formData.lastName} required onChange={handleChange} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} required onChange={handleChange} /></div>

      {/* --- THIS IS THE CORRECTED PASSWORD INPUT --- */}
      <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" value={formData.password} required onChange={handleChange} /></div>

      <div className="space-y-2"><Label htmlFor="position">Position</Label><Input id="position" name="position" value={formData.position} required onChange={handleChange} /></div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select onValueChange={handleRoleChange} defaultValue="EMPLOYEE">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label htmlFor="contactNumber">Contact Number</Label><Input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} /></div>
      <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" value={formData.address} onChange={handleChange} /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create Employee</Button>
      </DialogFooter>
    </form>
  );
}