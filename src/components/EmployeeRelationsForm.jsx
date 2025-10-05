"use client";

import React, { useState, useEffect, useMemo } from "react";

// Helper to simulate logged-in user (replace with real session later)
const getCurrentUserId = () => {
  if (typeof window === "undefined") return "anonymous";
  return localStorage.getItem("mock_user_id") || "emp_123"; // fallback
};

// Fetch employees hook
const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
        // fallback mock data
        setEmployees([
          { id: "emp_123", firstName: "Alice", lastName: "Smith" },
          { id: "emp_456", firstName: "Bob", lastName: "Johnson" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return { employees, loading };
};

export default function EmployeeRelationsForm() {
  const { employees, loading } = useEmployees();

  const userId = useMemo(() => getCurrentUserId(), []);
  const [targetId, setTargetId] = useState("");
  const [reportType, setReportType] = useState("Complaint");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!targetId || !title.trim() || !details.trim()) {
      setStatusMessage({ type: "error", message: "Please fill all required fields." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: "", message: "" });

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterId: userId,
          targetEmployeeId: targetId,
          type: reportType,
          title,
          details,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setStatusMessage({
        type: "success",
        message: "✅ Your report has been submitted confidentially for HR review.",
      });
      setTargetId("");
      setReportType("Complaint");
      setTitle("");
      setDetails("");
    } catch (err) {
      setStatusMessage({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg shadow-md">
        <p className="text-gray-600 text-lg">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Employee Relations Form
      </h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Submit confidential complaints, feedback, or suggestions about a colleague.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Target Employee */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Target Employee *
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            disabled={isSubmitting}
          >
            <option value="">Select an employee</option>
            {employees
              .filter((emp) => emp.id !== userId)
              .map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
          </select>
        </div>

        {/* Report Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Report Type *
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            disabled={isSubmitting}
          >
            <option value="Complaint">Complaint / Grievance</option>
            <option value="Review">Positive Feedback / Review</option>
            <option value="Suggestion">Suggestion / Other</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Summary Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Project communication issue or Excellent collaboration"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Details */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Detailed Description *
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={6}
            placeholder="Include all relevant details, context, and examples."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 resize-y"
            disabled={isSubmitting}
          />
        </div>

        {/* Status Message */}
        {statusMessage.message && (
          <div
            className={`p-3 rounded-md border-l-4 text-sm font-medium ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-700 border-green-500"
                : "bg-red-50 text-red-700 border-red-500"
            }`}
          >
            {statusMessage.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-4 py-3 font-semibold text-white rounded-lg transition ${
            isSubmitting
              ? "bg-red-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg"
          }`}
        >
          {isSubmitting ? (
            <span className="flex justify-center items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Confidential Report"
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          All submissions are confidential and accessible only by HR/Admin.
        </p>
      </form>
    </div>
  );
}
