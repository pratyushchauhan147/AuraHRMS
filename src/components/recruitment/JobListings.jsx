// in src/components/recruitment/JobListings.jsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";

function JobForm({ job, onSave, onCancel }) {
  const [title, setTitle] = useState(job?.title || '');
  const [description, setDescription] = useState(job?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...job, title, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2"><Label>Job Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Job Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="h-64" /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}

export default function JobListings({ initialJobs }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [modalState, setModalState] = useState({ mode: null, data: null });
  const [deletingJob, setDeletingJob] = useState(null);
  const router = useRouter();

  const fetchJobs = useCallback(async () => {
    const res = await fetch('/api/recruitment/jobs', { cache: 'no-store' });
    if (res.ok) setJobs(await res.json());
  }, []);

  const handleSave = async (jobData) => {
    const isCreating = modalState.mode === 'create';
    const url = isCreating ? '/api/recruitment/jobs' : `/api/recruitment/jobs/${jobData.id}`;
    const method = isCreating ? 'POST' : 'PUT';

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jobData) });
    if (res.ok) {
      setModalState({ mode: null, data: null });
      fetchJobs();
    } else {
      alert(`Failed to ${modalState.mode} job posting.`);
    }
  };
  
  const handleDelete = async () => {
    if (!deletingJob) return;
    const res = await fetch(`/api/recruitment/jobs/${deletingJob.id}`, { method: 'DELETE' });
    if(res.ok) {
      setDeletingJob(null);
      fetchJobs();
    } else {
      alert("Failed to delete job posting.");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setModalState({ mode: 'create', data: null })}>Create New Job Posting</Button>
      </div>
      <div className="bg-white shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <li key={job.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
              <div>
                <Link href={`/recruitment/jobs/${job.id}`} className="font-semibold text-indigo-600 hover:underline">{job.title}</Link>
                <p className="text-sm text-gray-500">{job.isOpen ? "Open" : "Closed"} • {job._count.applications} Applications</p>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => router.push(`/recruitment/jobs/${job.id}`)}>View Applicants</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setModalState({ mode: 'edit', data: job })}>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setDeletingJob(job)} className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
          {jobs.length === 0 && ( <li className="p-4 text-center text-gray-500">No job postings found.</li> )}
        </ul>
      </div>
      <Dialog open={!!modalState.mode} onOpenChange={() => setModalState({ mode: null, data: null })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{modalState.mode === 'create' ? 'Create' : 'Edit'} Job Posting</DialogTitle></DialogHeader>
          <JobForm job={modalState.data} onSave={handleSave} onCancel={() => setModalState({ mode: null, data: null })} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deletingJob} onOpenChange={() => setDeletingJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the job posting for "{deletingJob?.title}".</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}