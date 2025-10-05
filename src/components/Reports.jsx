"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Used inside the modal for labels

// --- CONSTANTS ---
const statusColors = {
    NEW: "bg-red-100 text-red-700 ring-red-600/20",
    IN_REVIEW: "bg-yellow-100 text-yellow-700 ring-yellow-600/20",
    RESOLVED: "bg-green-100 text-green-700 ring-green-600/20",
    CLOSED: "bg-gray-100 text-gray-700 ring-gray-600/20",
};

const reportTypes = {
    COMPLAINT: "Complaint",
    POSITIVE_REVIEW: "Positive Review",
    SUGGESTION: "Suggestion",
};

const availableStatuses = ["NEW", "IN_REVIEW", "RESOLVED", "CLOSED"];

// --- Report Detail Modal Component ---
const ReportDetailModal = ({ report, onClose, onStatusUpdate, isUpdating }) => {
    const [newStatus, setNewStatus] = useState(report?.status || availableStatuses[0]);

    useEffect(() => {
        if (report) {
            setNewStatus(report.status);
        }
    }, [report]);
    
    if (!report) return null;

    const reporterName = report.reporter 
        ? `${report.reporter.firstName} ${report.reporter.lastName}` 
        : "Anonymous (ID: N/A)";

    const handleUpdateClick = () => {
        onStatusUpdate(report.id, newStatus);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 truncate">
                        {report.title}
                    </DialogTitle>
                    <p className="text-sm font-medium text-gray-500">
                        Target: {report.targetEmployee.firstName} {report.targetEmployee.lastName} ({report.targetEmployee.position})
                    </p>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-b pb-4">
                        <Label className="text-gray-500">Submitted By:</Label>
                        <span className="font-semibold text-gray-700">{reporterName}</span>
                        
                        <Label className="text-gray-500">Report Type:</Label>
                        <span className={`font-semibold ${report.type === 'COMPLAINT' ? 'text-red-600' : 'text-green-600'}`}>
                            {reportTypes[report.type] || report.type}
                        </span>
                        
                        <Label className="text-gray-500">Date Filed:</Label>
                        <span className="text-gray-700">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Details */}
                    <div>
                        <h4 className="text-md font-bold text-gray-800 mb-2 mt-4">Detailed Description</h4>
                        <p className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-3 rounded-md border min-h-[100px] max-h-[200px] overflow-y-auto">
                            {report.details}
                        </p>
                    </div>

                    {/* Status Update */}
                    <div className="flex items-center space-x-4 pt-4 border-t">
                        <Label htmlFor="new-status" className="min-w-[100px]">Update Status:</Label>
                        <Select onValueChange={setNewStatus} value={newStatus} disabled={isUpdating}>
                            <SelectTrigger id="new-status" className="flex-grow">
                                <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            onClick={handleUpdateClick}
                            disabled={isUpdating || newStatus === report.status}
                            className="w-[120px]"
                        >
                            {isUpdating ? 'Saving...' : 'Save Status'}
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// --- Main Dashboard Component ---

export default function ReportsDashboard() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeReport, setActiveReport] = useState(null);
    const [filter, setFilter] = useState('NEW'); // Default filter to show new reports
    const [isUpdating, setIsUpdating] = useState(false);


    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/reports', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch reports.');
            }

            const data = await response.json();
            setReports(data);
        } catch (err) {
            setError(err.message || 'An unknown error occurred while fetching reports.');
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);


    const handleStatusUpdate = async (reportId, newStatus) => {
        if (!reportId || !newStatus) return;

        setIsUpdating(true);
        try {
            const response = await fetch('/api/reports', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, status: newStatus }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update report status.');
            }

            // Report was successfully updated, refresh the list and close the dialog
            await fetchReports();
            setActiveReport(null); 
            
        } catch (err) {
            alert(`Error updating report: ${err.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredReports = useMemo(() => {
        return reports.filter(report => filter === 'ALL' || report.status === filter);
    }, [reports, filter]);


    // --- Render Logic ---

    if (loading && reports.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 text-gray-600">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading confidential reports...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                <p className="font-bold">Error Loading Data:</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-gray-800">Employee Relations Reports</h3>
                <div className="flex items-center space-x-3">
                    <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Filter by Status:</Label>
                    <Select onValueChange={setFilter} value={filter}>
                        <SelectTrigger id="status-filter" className="w-[180px] text-sm">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NEW">New (Needs Attention)</SelectItem>
                            <SelectItem value="IN_REVIEW">IN REVIEW</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            <SelectItem value="ALL">All Reports</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200">
                            <th className="px-5 py-3">Type</th>
                            <th className="px-5 py-3">Subject</th>
                            <th className="px-5 py-3">Target Employee</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-5 py-5 border-b border-gray-200 bg-white text-center text-sm text-gray-500">
                                    {filter === 'ALL' ? "No reports have been submitted yet." : `No reports found with status: ${filter.replace('_', ' ')}`}
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-indigo-50 transition duration-150">
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.type === 'COMPLAINT' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {reportTypes[report.type] || report.type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-medium text-gray-900 truncate max-w-xs">{report.title}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="font-semibold text-gray-900">{report.targetEmployee.firstName} {report.targetEmployee.lastName}</p>
                                        <p className="text-gray-500 text-xs">{report.targetEmployee.position}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[report.status] || statusColors.NEW}`}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-500">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setActiveReport(report)}
                                        >
                                            View & Manage
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {activeReport && (
                <ReportDetailModal 
                    report={activeReport} 
                    onClose={() => setActiveReport(null)} 
                    onStatusUpdate={handleStatusUpdate}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    );
}
