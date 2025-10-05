"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DailySummaryTable({ attendance }) {
  if (!attendance || !Array.isArray(attendance)) return <p>No data</p>;

  // Build summary map
  const summaryMap = {};
  attendance.forEach((a) => {
    if (!a.date) return;
    const d = new Date(a.date).toLocaleDateString();
    if (!summaryMap[d]) summaryMap[d] = 0;
    const sessions = a.sessions ? JSON.parse(a.sessions) : [];
    if (sessions.length > 0) summaryMap[d]++;
  });

  const dailySummary = Object.entries(summaryMap);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Total Present Employees</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dailySummary.map(([date, count]) => (
          <TableRow key={date}>
            <TableCell>{date}</TableCell>
            <TableCell>{count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}