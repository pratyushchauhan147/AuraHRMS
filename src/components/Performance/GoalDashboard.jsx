"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import GoalForm from "./GoalForm";
import GoalRow from "./GoalRow";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function GoalsDashboard({ userRole }) {
  const [quarterFilter, setQuarterFilter] = useState("");
  const { data: goals, mutate } = useSWR(
    userRole === "EMPLOYEE"
      ? "/api/goals/my"
      : `/api/goals${quarterFilter ? `?quarter=${quarterFilter}` : ""}`,
    fetcher
  );

  if (!goals) return <p>Loading goals...</p>;

  return (
    <div className="space-y-4">
      {["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(userRole) && (
        <GoalForm onCreate={mutate} userRole={userRole} />
      )}

      <div>
        <input
          type="text"
          placeholder="Filter by quarter"
          value={quarterFilter}
          onChange={(e) => setQuarterFilter(e.target.value)}
          className="border p-1 rounded mb-2"
        />
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Employee</th>
            <th className="p-2 text-left">Objective</th>
            <th className="p-2 text-left">Key Results</th>
            <th className="p-2 text-left">Quarter</th>
            <th className="p-2 text-left">Status</th>
            {["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(userRole) && <th className="p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} userRole={userRole} mutate={mutate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
