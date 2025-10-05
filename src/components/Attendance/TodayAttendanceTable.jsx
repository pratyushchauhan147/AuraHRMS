"use client";
import useSWR from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fetcher = (url) => fetch(url).then(res => res.json());

export default function TodayAttendanceTable() {
  const { data } = useSWR("/api/attendance/today", fetcher);

  if (!data) return <p>Loading...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Total Hours</TableHead>
          <TableHead>Overtime</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((rec) => (
          <TableRow key={rec.id}>
            <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
            <TableCell>{rec.employee.firstName} {rec.employee.lastName}</TableCell>
            <TableCell>{rec.totalHours?.toFixed(2) || 0}</TableCell>
            <TableCell>{rec.overtime?.toFixed(2) || 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
