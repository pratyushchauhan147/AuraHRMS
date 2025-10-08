// in src/app/recruitment/new/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewJobPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/recruitment/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job posting.");
      }

      router.push("/recruitment");
      router.refresh();
    } catch (err) {
      setError(err.message);
      // Ensure loading is stopped even if there's an error
      setIsLoading(false);
    }
    // We don't need a finally block if the success path navigates away
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Create New Job Posting</h1>
        <p className="text-gray-500">Fill in the details for the new role you want to open.</p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md mt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={title}
              // --- TYPO FIXED HERE ---
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              required
              // --- "SMOOTH" IMPROVEMENT ---
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              required
              rows={10}
              // --- "SMOOTH" IMPROVEMENT ---
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end space-x-4">
            <Link href="/recruitment">
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}