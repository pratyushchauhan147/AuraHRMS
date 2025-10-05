export default function EmployeeHistoryTable({ records }) {
  if (!records || !Array.isArray(records)) return <p>No records</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Total Hours</TableHead>
          <TableHead>Overtime</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((rec) => (
          <TableRow key={rec.id}>
            <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
            <TableCell>{rec.totalHours?.toFixed(2) || 0}</TableCell>
            <TableCell>{rec.overtime?.toFixed(2) || 0}</TableCell>
            <TableCell>{rec.status || "N/A"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}