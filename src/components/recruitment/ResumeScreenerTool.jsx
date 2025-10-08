// in src/components/recruitment/ResumeScreenerTool.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ResumeScreenerTool({ jobDescription }) {
  const [resumeText, setResumeText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef(null);

  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysisResult]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/screen-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, job_description: jobDescription }),
      });

      if (!res.ok) throw new Error("Failed to get analysis from the server.");
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resume-text" className="text-base font-semibold">Paste Resume Text</Label>
          <Textarea id="resume-text" className="mt-1 block w-full h-96" placeholder="Paste the candidate's full resume text here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} required disabled={isLoading} />
        </div>
        <Button type="submit" disabled={isLoading || !resumeText} className="w-full">
          {isLoading ? "Analyzing..." : "Run AI Analysis"}
        </Button>
      </form>
      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
      {analysisResult && (
        <div ref={resultsRef} className="border-t pt-4 max-h-96 overflow-y-auto">
          <h4 className="text-lg font-semibold mb-2">Analysis Result</h4>
          <div className="space-y-4">
            <div><h5 className="font-semibold">Match Score:</h5><p className="text-2xl font-bold text-indigo-600">{analysisResult.match_score}/100</p></div>
            <div><h5 className="font-semibold">Summary:</h5><p className="text-gray-600 text-sm">{analysisResult.summary}</p></div>
            <div><h5 className="font-semibold">Suggested Questions:</h5><ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">{analysisResult.suggested_questions.map((q, i) => <li key={i}>{q}</li>)}</ol></div>
          </div>
        </div>
      )}
    </div>
  );
}