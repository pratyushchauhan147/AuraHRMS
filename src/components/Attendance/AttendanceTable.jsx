"use client";

import useSWR from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AttendanceTable() {
  const { data } = useSWR("/api/attendance", fetcher);

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p className="text-red-500">{data.error}</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Total Hours</TableHead>
          <TableHead>Overtime</TableHead>
          <TableHead>Attendance Status</TableHead>
          <TableHead>Current Presence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((rec) => {
          const sessions = JSON.parse(rec.sessions || "[]");
          const lastSession = sessions[sessions.length - 1];
          const currentlyPresent = lastSession && !lastSession.clockOut;

          return (
            <TableRow key={rec.id}>
              <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
              <TableCell>{rec.employee.firstName} {rec.employee.lastName}</TableCell>
              <TableCell>{rec.totalHours?.toFixed(2) || 0}</TableCell>
              <TableCell>{rec.overtime?.toFixed(2) || 0}</TableCell>
              <TableCell>
                <span className="font-medium text-blue-700">{rec.status || "N/A"}</span>
              </TableCell>
              <TableCell>
                <span
                  className={`font-semibold px-2 py-1 rounded-full text-white ${
                    currentlyPresent ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {currentlyPresent ? "Present" : "Absent"}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
