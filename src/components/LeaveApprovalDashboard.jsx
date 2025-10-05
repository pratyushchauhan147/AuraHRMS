// in src/components/LeaveApprovalDashboard.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// We no longer need the router for this component
// import { useRouter } from "next/navigation";

export default function LeaveApprovalDashboard({ initialRequests }) {
  const [requests, setRequests] = useState(initialRequests);
  // const router = useRouter(); // No longer needed

  const handleUpdateStatus = async (requestId, status) => {
    try {
      // 1. Send the API request and wait for it to complete.
      const res = await fetch(`/api/leave-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      // 2. Check if the API call was successful.
      if (res.ok) {
        // 3. If successful, THEN update the local state to remove the item from the list.
        // This will trigger a re-render and make the row disappear instantly.
        setRequests(currentRequests =>
          currentRequests.filter(req => req.id !== requestId)
        );
      } else {
        // Handle failure
        const data = await res.json();
        alert(`Failed to update request: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert("An error occurred while communicating with the server.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 border-b pb-2">Pending Leave Requests</h3>
      {requests.length > 0 ? (
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Employee</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Dates</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Reason</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td className="py-2 px-3 text-sm text-gray-800">{req.employee.firstName} {req.employee.lastName}</td>
                <td className="py-2 px-3 text-sm text-gray-800">
                  {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-3 text-sm text-gray-600 italic">{req.reason || "N/A"}</td>
                <td className="py-2 px-3">
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleUpdateStatus(req.id, 'APPROVED')}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(req.id, 'DENIED')}>Deny</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-sm">No pending leave requests to review.</p>
      )}
    </div>
  );
}