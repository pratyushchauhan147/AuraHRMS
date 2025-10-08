// in src/app/recruitment/jobs/[jobId]/page.jsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import ApplicantList from "@/components/recruitment/ApplicantList";
import EditJobButton from "@/components/recruitment/EditJobButton"; // <-- IMPORT
import CollapsibleDescription from "@/components/recruitment/CollapsibleDescription"; // <-- IMPORT
export default async function JobDetailPage({ params }) {
  const { jobId } = params;

  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: {
      applications: {
        include: {
          candidate: true,
        },
        orderBy: {
          appliedAt: 'asc',
        },
      },
    },
  });

  if (!jobPosting) {
    return <div className="p-8">Job posting not found.</div>;
  }

 return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/recruitment" /* ... */>&larr; Back to Recruitment Hub</Link>
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">{jobPosting.title}</h1>
          {/* --- USE THE NEW COMPONENT HERE --- */}
          <CollapsibleDescription text={jobPosting.description} />
        </div>
        <EditJobButton job={jobPosting} />
      </div>

      <ApplicantList 
        initialApplications={jobPosting.applications} 
        jobId={jobId} 
        jobDescription={jobPosting.description} 
      />
    </div>
  );
}