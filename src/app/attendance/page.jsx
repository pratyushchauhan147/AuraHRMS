// app/attendance/page.jsx
"use client";
import { useState } from "react";
import useSWR from "swr";

import AttendanceTable from "@/components/Attendance/AttendanceTable";
import EmployeeSelector from "@/components/Attendance/EmployeeSelector";
import EmployeeHistoryTable from "@/components/Attendance/EmployeeHistoryTable";
import DailySummaryTable from "@/components/Attendance/DailySummaryTable";
import TodayAttendanceTable from "@/components/Attendance/TodayAttendanceTable";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AttendanceDashboard() {
  const { data: allAttendance } = useSWR("/api/attendance", fetcher);
  const { data: allEmployees } = useSWR("/api/employees", fetcher);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { data: employeeHistory } = useSWR(
    selectedEmployee ? `/api/attendance?employeeId=${selectedEmployee.id}` : null,
    fetcher
  );

  if (!allAttendance || !allEmployees) return <p>Loading...</p>;
  if (allAttendance.error || allEmployees.error) return <p>Error loading data</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-1">Attendance Dashboard</h1>
      </header>

      {/* Today’s Attendance Table */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Today’s Attendance</h2>
        
        <TodayAttendanceTable />
      </section>

      {/* Employee Attendance History */}
      <section>
        <h2 className="text-xl font-semibold mb-2">View Employee Attendance</h2>
        <EmployeeSelector
          employees={allEmployees}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
        />
        {selectedEmployee && <EmployeeHistoryTable records={employeeHistory} />}
      </section>

      {/* Daily Summary */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Daily Summary</h2>
        <DailySummaryTable attendance={allAttendance} />
      </section>
    </div>
  );
}
