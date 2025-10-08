// in src/components/admin/CleanupButton.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// Import the Select component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CleanupButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // --- 1. ADD STATE FOR THE SELECTED TIMEFRAME ---
  const [selectedMonths, setSelectedMonths] = useState(6);

  const handleCleanup = async () => {
    if (!confirm(`Are you sure you want to permanently delete all rejected applications older than ${selectedMonths} months? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // --- 2. SEND THE SELECTED MONTHS IN THE API CALL BODY ---
      const res = await fetch('/api/admin/cleanup', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months: selectedMonths }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "An unknown error occurred.");

      setMessage(data.message);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center space-x-2">
            {/* --- 3. ADD THE DROPDOWN UI --- */}
            <Select onValueChange={(value) => setSelectedMonths(parseInt(value))} defaultValue="6">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="3">Older than 3 months</SelectItem>
                    <SelectItem value="6">Older than 6 months</SelectItem>
                    <SelectItem value="12">Older than 1 year</SelectItem>
                    <SelectItem value="24">Older than 2 years</SelectItem>
                </SelectContent>
            </Select>

            <Button onClick={handleCleanup} disabled={loading} variant="destructive">
                {loading ? "Cleaning up..." : "Run Cleanup"}
            </Button>
        </div>
        {message && <p className="text-sm text-gray-600 pt-2">{message}</p>}
    </div>
  );
}