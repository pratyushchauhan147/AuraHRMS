"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeeSelector({ employees, selectedEmployee, setSelectedEmployee }) {
  return (
    <Select
      onValueChange={(val) => {
        if (!val) return;
        const emp = employees.find((e) => e.id?.toString() === val);
        setSelectedEmployee(emp);
      }}
    >
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select Employee" />
      </SelectTrigger>
      <SelectContent>
        {employees.map((emp) => (
          <SelectItem key={emp.id} value={emp.id?.toString()}>
            {emp.firstName} {emp.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
