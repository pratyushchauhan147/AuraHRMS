// in src/app/recruitment/candidates/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CreateCandidateForm({ onSave, onCancel }) {
    const [formData, setFormData] = useState({});
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input name="firstName" required onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input name="lastName" required onChange={handleChange} /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required onChange={handleChange} /></div>
            <div className="space-y-2"><Label>Phone (Optional)</Label><Input name="phone" type="tel" onChange={handleChange} /></div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Add Candidate</Button>
            </DialogFooter>
        </form>
    );
}

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- THIS FUNCTION IS NOW FIXED ---
    const fetchCandidates = async () => {
        try {
            const res = await fetch('/api/recruitment/candidates', { cache: 'no-store' });
            
            // 1. Check if the API call was successful
            if (res.ok) {
                const data = await res.json();
                // 2. Only update state if data is an array (as expected)
                if (Array.isArray(data)) {
                    setCandidates(data);
                }
            } else {
                // If API returns an error, log it and don't crash the page
                console.error("Failed to fetch candidates:", await res.text());
                // Optionally set an error state here to show a message to the user
            }
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const handleCreate = async (newCandidateData) => {
        const res = await fetch('/api/recruitment/candidates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCandidateData),
        });
        if (res.ok) {
            setIsCreateModalOpen(false);
            fetchCandidates();
        } else {
            const data = await res.json();
            alert(`Failed to add candidate: ${data.error}`);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Candidate Database</h1>
                    <p className="text-gray-500">A central list of all candidates in your talent pool.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/recruitment"><Button variant="outline">&larr; Back to Hub</Button></Link>
                    <Button onClick={() => setIsCreateModalOpen(true)}>Add New Candidate</Button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Applications</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {candidates.map(c => (
                        <tr key={c.id}>
                            <td className="py-3 px-4 font-medium text-gray-800">{c.firstName} {c.lastName}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{c.email}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{c._count.applications}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

             <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New Candidate</DialogTitle></DialogHeader>
                    <CreateCandidateForm onSave={handleCreate} onCancel={() => setIsCreateModalOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}