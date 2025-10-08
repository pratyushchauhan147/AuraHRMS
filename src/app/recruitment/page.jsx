// in src/app/recruitment/page.jsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RecruitmentPage() {
  // Fetch the initial list of jobs on the server
  const jobPostings = await prisma.jobPosting.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Recruitment Hub</h1>
          <p className="text-gray-500">Manage all open and closed job postings.</p>
        </div>
       <div className="flex items-center space-x-2">
            {/* --- ADD THIS BUTTON --- */}
            <Link href="/recruitment/candidates">
                <Button variant="secondary">Candidate Database</Button>
            </Link>
            <Link href="/recruitment/new">
                <Button>Create New Job</Button>
            </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {jobPostings.map((job) => (
            <li key={job.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
              <div>
                <Link href={`/recruitment/jobs/${job.id}`} className="font-semibold text-indigo-600 hover:underline">
                  {job.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {job.isOpen ? "Open" : "Closed"} • {job._count.applications} Applications
                </p>
              </div>
              {/* We can add an edit/delete menu here later */}
            </li>
          ))}
          {jobPostings.length === 0 && (
            <li className="p-4 text-center text-gray-500">No job postings created yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}