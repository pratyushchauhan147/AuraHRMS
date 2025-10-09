"use client";

import { useState } from "react";

export default function GoalRow({ goal, userRole, mutate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [objective, setObjective] = useState(goal.objective);

  const initialKeyResults = Array.isArray(goal.keyResults)
    ? goal.keyResults
    : typeof goal.keyResults === "string"
    ? JSON.parse(goal.keyResults)
    : [];

  const [keyResults, setKeyResults] = useState(initialKeyResults.join("\n"));
  const [status, setStatus] = useState(goal.status);
  const [quarter, setQuarter] = useState(goal.quarter);

  const [showFullObjective, setShowFullObjective] = useState(false);
  const [showFullKeyResults, setShowFullKeyResults] = useState(false);

  const handleUpdate = async () => {
    await fetch(`/api/goals/${goal.id}`, {
      method: "PUT",
      body: JSON.stringify({
        objective,
        keyResults: keyResults.split("\n"),
        status,
        quarter,
      }),
    });
    setIsEditing(false);
    mutate();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this goal?")) {
      await fetch(`/api/goals/${goal.id}`, { method: "DELETE" });
      mutate();
    }
  };

  const truncateText = (text, length = 80) => {
    if (!text) return "";
    return text.length > length ? text.slice(0, length) + "..." : text;
  };

  if (isEditing) {
    return (
      <tr className="border-b">
        <td className="p-2">
          {goal.employee?.firstName} {goal.employee?.lastName}
        </td>
        <td className="p-2">
          <input
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full border rounded p-1"
          />
        </td>
        <td className="p-2">
          <textarea
            value={keyResults}
            onChange={(e) => setKeyResults(e.target.value)}
            className="w-full border rounded p-1"
          />
        </td>
        <td className="p-2">
          <input
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="border rounded p-1"
          />
        </td>
        <td className="p-2">
          <input
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded p-1"
          />
        </td>
        <td className="p-2 space-x-2">
          <button
            onClick={handleUpdate}
            className="bg-green-500 text-white px-2 py-1 rounded"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-300 px-2 py-1 rounded"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b align-top">
      <td className="p-2">
        {goal.employee?.firstName} {goal.employee?.lastName}
      </td>

      {/* Objective cell */}
      <td className="p-2 max-w-[250px]">
        <div className="whitespace-pre-wrap">
          {showFullObjective ? objective : truncateText(objective, 80)}
          {objective.length > 80 && (
            <button
              onClick={() => setShowFullObjective(!showFullObjective)}
              className="text-blue-500 text-sm ml-2"
            >
              {showFullObjective ? "View less" : "View more"}
            </button>
          )}
        </div>
      </td>

      {/* Key results cell */}
      <td className="p-2 max-w-[300px]">
        <div className="whitespace-pre-wrap">
          {showFullKeyResults
            ? initialKeyResults.join(", ")
            : truncateText(initialKeyResults.join(", "), 100)}
          {initialKeyResults.join(", ").length > 100 && (
            <button
              onClick={() => setShowFullKeyResults(!showFullKeyResults)}
              className="text-blue-500 text-sm ml-2"
            >
              {showFullKeyResults ? "View less" : "View more"}
            </button>
          )}
        </div>
      </td>

      <td className="p-2">{quarter}</td>
      <td className="p-2">{status}</td>

      {["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(userRole) && (
        <td className="p-2 space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-400 px-2 py-1 rounded"
          >
            Edit
          </button>
          {["ADMIN", "HR_RECRUITER"].includes(userRole) && (
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
