// in src/components/ResumeScreener.jsx
"use client";

import { useState } from "react";

export default function ResumeScreener() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/screen-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resume, job_description: jobDescription }),
      });

      if (!res.ok) {
        throw new Error("Failed to get analysis from the server.");
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">AI-Powered Resume Screener</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
            Job Description
          </label>
          <textarea
            id="job-description"
            rows={8}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
            Candidate's Resume
          </label>
          <textarea
            id="resume"
            rows={12}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            placeholder="Paste the candidate's full resume text here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            required
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {isLoading ? "Analyzing..." : "Analyze Candidate"}
          </button>
        </div>
      </form>

      {error && <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {analysisResult && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">Analysis Result</h3>
          <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800">Match Score:</h4>
              <p className="text-3xl font-bold text-indigo-600">{analysisResult.match_score}/100</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Summary:</h4>
              <p className="text-gray-600">{analysisResult.summary}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Suggested Interview Questions:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                {analysisResult.suggested_questions.map((q, index) => (
                  <li key={index}>{q}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}