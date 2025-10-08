// in src/components/recruitment/ApplicantList.jsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeScreenerTool from "./ResumeScreenerTool";
import AddApplicantForm from "./AddApplicantForm";
import ScheduleInterviewForm from "./ScheduleInterviewForm";

const statuses = ["APPLIED", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"];

export default function ApplicantList({ initialApplications, jobId, jobDescription }) {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailedCandidate, setDetailedCandidate] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'create', 'view', 'schedule'
  const router = useRouter();
  
  const fetchFullCandidateDetails = useCallback(async (candidateId) => {
      const res = await fetch(`/api/recruitment/candidates/${candidateId}`);
      if (res.ok) setDetailedCandidate(await res.json());
  }, []);

  const handleViewProfile = (application) => {
    setSelectedApp(application);
    setModalMode('view');
    fetchFullCandidateDetails(application.candidate.id);
  };
  
  const handleCloseDialog = () => {
    setModalMode(null);
    setSelectedApp(null);
    setDetailedCandidate(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedApp) return;
    const originalApplications = [...applications];
    setApplications(apps => apps.map(app => app.id === selectedApp.id ? {...app, status: newStatus} : app));
    setSelectedApp(app => ({...app, status: newStatus}));
    try {
      const res = await fetch(`/api/recruitment/applications/${selectedApp.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error("Failed to update status.");
    } catch (error) {
      alert("Error updating status.");
      setApplications(originalApplications);
    }
  };

  const handleCreateApplicant = async (newApplicantData) => {
    // 1. Create a temporary "optimistic" record to show in the UI immediately.
    const optimisticId = `temp-${Date.now()}`;
    const optimisticApplication = {
      id: optimisticId,
      status: 'APPLIED',
      appliedAt: new Date().toISOString(),
      candidate: {
        id: `temp-candidate-${Date.now()}`,
        ...newApplicantData,
      },
    };

    // 2. Update the UI instantly
    setApplications(prev => [...prev, optimisticApplication]);
    setModalMode(null);

    try {
      // 3. Send the real API request in the background
      const res = await fetch('/api/recruitment/apply', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ...newApplicantData, jobId: jobId }), 
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add applicant.");
      }
      
      // 4. On success, refresh the data from the server in the background 
      //    to get the real IDs and confirm the change.
      router.refresh();

    } catch (error) {
      alert(error.message);
      // 5. If the API call fails, roll back the UI change.
      setApplications(prev => prev.filter(app => app.id !== optimisticId));
    }
  };

  const handleScheduleInterview = async (interviewData) => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/recruitment/applications/${selectedApp.id}/interviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(interviewData), });
      if (!res.ok) throw new Error("Failed to schedule interview.");
      setModalMode('view');
      await fetchFullCandidateDetails(selectedApp.candidate.id);
      router.refresh(); 
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold">Applicants</h2>
        <Button onClick={() => setModalMode('create')}>Add Applicant</Button>
      </div>
      <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase">Candidate</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase">Applied On</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map(app => (
              <tr key={app.id}>
                <td className="py-3 px-3">
                    <p className="font-medium text-gray-800">{app.candidate.firstName} {app.candidate.lastName}</p>
                    <p className="text-sm text-gray-500">{app.candidate.email}</p>
                </td>
                <td className="py-3 px-3 text-sm text-gray-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td className="py-3 px-3"><Badge>{app.status}</Badge></td>
                <td className="py-3 px-3">
                    <Button variant="outline" size="sm" onClick={() => handleViewProfile(app)}>View / Screen</Button>
                </td>
              </tr>
            ))}
          </tbody>
      </table>
      
      <Dialog open={modalMode === 'create'} onOpenChange={handleCloseDialog}>
        <DialogContent>
            <DialogHeader><DialogTitle>Add New Applicant</DialogTitle></DialogHeader>
            <AddApplicantForm onSave={handleCreateApplicant} onCancel={handleCloseDialog} />
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === 'view'} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            {selectedApp && <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedApp.candidate.firstName} {selectedApp.candidate.lastName}</DialogTitle>
                    <DialogDescription>{selectedApp.candidate.email}</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="details" className="pt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Application Details</TabsTrigger>
                        <TabsTrigger value="screener">AI Resume Screener</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="mt-4">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-gray-800">Application Status</h4>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Label>Status:</Label>
                                    <Select onValueChange={handleStatusChange} value={selectedApp.status}>
                                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Actions</h4>
                                <Button className="mt-2" onClick={() => setModalMode('schedule')}>Schedule Interview</Button>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Interview History</h4>
                                <div className="mt-2 text-sm border rounded-md p-3">
                                    {!detailedCandidate ? <p>Loading history...</p> : 
                                      detailedCandidate.applications.find(a => a.id === selectedApp.id)?.interviews.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1">
                                            {detailedCandidate.applications.find(a => a.id === selectedApp.id).interviews.map(interview => (
                                                <li key={interview.id}>Scheduled for {new Date(interview.scheduledFor).toLocaleString()}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No interviews scheduled for this application.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="screener" className="mt-4">
                        <ResumeScreenerTool jobDescription={jobDescription} />
                    </TabsContent>
                </Tabs>
            </>}
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === 'schedule'} onOpenChange={() => setModalMode('view')}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Schedule Interview</DialogTitle>
                <DialogDescription>For {selectedApp?.candidate.firstName} {selectedApp?.candidate.lastName}</DialogDescription>
            </DialogHeader>
            <ScheduleInterviewForm onSave={handleScheduleInterview} onCancel={() => setModalMode('view')} />
        </DialogContent>
      </Dialog>
    </div>
  );
}