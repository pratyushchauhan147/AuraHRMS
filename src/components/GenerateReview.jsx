"use client";

import React, { useState } from "react";

export default function ReviewGenerator() {
  const [employeeName, setEmployeeName] = useState("");
  const [bulletPoints, setBulletPoints] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setError("");
    setReviewText("");
    if (!employeeName.trim() || !bulletPoints.trim()) {
      setError("Employee name and performance bullet points are both required.");
      return;
    }

    setLoading(true);

    try {
      // NOTE: This assumes you have a Next.js API route at /api/generate-review
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeName, bulletPoints }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate review. Please check server logs.");
      } else {
        setReviewText(data.reviewText);
      }
    } catch (err) {
      setError("Unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main Container/Card: Adjusted classes for dashboard context.
    // Removed max-w, mx-auto, and mt-10. Used w-full and shadow-lg.
    <div className="w-full p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
        AI Performance Review Generator
      </h2>

      {/* Employee Name Input */}
      <div className="mb-5">
        <label htmlFor="employee-name" className="block text-sm font-semibold text-gray-700 mb-2">
          Employee Name
        </label>
        <input
          id="employee-name"
          type="text"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          placeholder="e.g., Jane Doe"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        />
      </div>

      {/* Bullet Points Input */}
      <div className="mb-6">
        <label htmlFor="bullet-points" className="block text-sm font-semibold text-gray-700 mb-2">
          Performance Bullet Points (one per line)
        </label>
        <textarea
          id="bullet-points"
          value={bulletPoints}
          onChange={(e) => setBulletPoints(e.target.value)}
          rows={6}
          placeholder={`e.g.,
• Exceeded sales targets by 20% this quarter.
• Mentored a new team member effectively.
• Improved documentation for the API.`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-y"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`
          w-full px-4 py-3 text-lg font-bold rounded-lg transition duration-300 ease-in-out
          ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-[#ffffff] hover:bg-blue-700 text-zinc-900 border shadow-md hover:shadow-lg"
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Review...
          </span>
        ) : (
          "Generate Review"
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Generated Review Output */}
      {reviewText && (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold text-blue-800 border-b pb-2 mb-4">
            Performance Review for {employeeName}
          </h3>
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{reviewText}</p>
        </div>
      )}
    </div>
  );
}