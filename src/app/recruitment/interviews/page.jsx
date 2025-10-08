// in src/app/recruitment/interviews/page.jsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";


export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const res = await fetch('/api/recruitment/interviews');
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleUpdateStatus = async (applicationId, status) => {
    const res = await fetch(`/api/recruitment/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      // Refresh the list to remove the completed interview action
      fetchInterviews();
      // Ideally, you'd navigate back to the Kanban board or show a success message
      alert(`Candidate status updated to ${status}!`);
    } else {
      alert("Failed to update status.");
    }
  };


  if (loading) {
    return <div className="p-8">Loading interviews...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Interview Schedule</h1>
          <p className="text-gray-500">All upcoming interviews across the company.</p>
        </div>
         <Link href="/recruitment">
          <Button variant="outline">&larr; Back to Recruitment Hub</Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Candidate</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">For Position</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Interview Date & Time</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {interviews.length > 0 ? (
              interviews.map(interview => (
                <tr key={interview.id}>
                  <td className="py-3 px-4 font-medium text-gray-800">{interview.application.candidate.firstName} {interview.application.candidate.lastName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{interview.application.jobPosting.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(interview.scheduledFor).toLocaleString()}</td>
                  <td className="py-3 px-4"><Badge>{interview.application.status}</Badge></td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Post-Interview Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleUpdateStatus(interview.applicationId, 'OFFERED')}>Move to Offer</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleUpdateStatus(interview.applicationId, 'REJECTED')} className="text-red-600">Reject Candidate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="py-4 px-4 text-center text-gray-500">No upcoming interviews scheduled.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}