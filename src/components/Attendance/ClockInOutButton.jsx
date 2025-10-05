"use client";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ClockInOutButton() {
  const { data, mutate } = useSWR("/api/attendance/status", fetcher);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await mutate();
    setLoading(false);
  };

  if (!data) return <Button disabled>Loading...</Button>;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={() => handleAction(data.clockedIn ? "clockOut" : "clockIn")}
        disabled={loading}
      >
        {loading
          ? "Processing..."
          : data.clockedIn
          ? "Clock Out"
          : "Clock In"}
      </Button>
      <p className="text-sm text-gray-500">
        Total Hours Today: {data.totalHours || 0} hrs
      </p>
    </div>
  );
}
