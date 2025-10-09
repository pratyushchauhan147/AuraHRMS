"use client";

import { useState, useEffect } from "react";

export default function GoalForm({ onCreate, userRole }) {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [objective, setObjective] = useState("");
  const [keyResultsText, setKeyResultsText] = useState("");
  const [quarter, setQuarter] = useState("");
  const [tasks, setTasks] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);

  useEffect(() => {
    if (["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(userRole)) {
      fetch("/api/employees")
        .then((res) => res.json())
        .then(setEmployees);
    }
  }, [userRole]);

  const handleGenerate = async () => {
    if (!employeeId || tasks.trim() === "") {
      alert("Select employee and enter at least one task.");
      return;
    }

    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    try {
      const res = await fetch("/api/generate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName: `${emp.firstName} ${emp.lastName}`,
          department: emp.department?.name || "Unknown",
          role: emp.position || "Employee",
          tasks: tasks.split("\n").filter((t) => t.trim()),
        }),
      });

      const data = await res.json();
      const keyResultsArr = Array.isArray(data.keyResults)
        ? data.keyResults
        : [data.keyResults || ""];

      setObjective(data.objective || "");
      setKeyResultsText(keyResultsArr.join("\n"));
      setQuarter(data.suggestedQuarter || "");
      setAiGenerated(true);
    } catch (err) {
      console.error(err);
      alert("AI generation failed. You can enter manually.");
    }
  };

  const handleSave = async () => {
  if (!employeeId || !objective.trim() || !keyResultsText.trim() || !quarter.trim()) {
    alert("All fields are required!");
    return;
  }

  const keyResultsArr = keyResultsText
    .split("\n")
    .map((kr) => kr.trim())
    .filter(Boolean);

  try {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        objective,
        keyResults: keyResultsArr,
        quarter,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Save goal failed:", data);
      alert("Failed to save goal: " + (data.error || "Unknown error"));
      return;
    }

    // Reset form
    setEmployeeId("");
    setObjective("");
    setKeyResultsText("");
    setQuarter("");
    setTasks("");
    setAiGenerated(false);
    onCreate();
  } catch (err) {
    console.error("Network error while saving goal:", err);
    alert("Failed to save goal due to network error.");
  }
};
  return (
    <div className="border p-4 rounded mb-4 bg-white shadow">
      <h3 className="font-bold mb-2">Create Goal</h3>

      {["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(userRole) && (
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="border rounded p-1 mb-2 w-full"
        >
          <option value="">Select Employee</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName} ({e.position})
            </option>
          ))}
        </select>
      )}

      <input
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        placeholder="Objective"
        className="border rounded p-2 mb-2 w-full"
      />

      <textarea
        value={keyResultsText}
        onChange={(e) => setKeyResultsText(e.target.value)}
        placeholder="Key Results (one per line)"
        className="border rounded p-2 mb-2 w-full"
      />

      <input
        value={quarter}
        onChange={(e) => setQuarter(e.target.value)}
        placeholder="Quarter e.g., Q4 2025"
        className="border rounded p-2 mb-2 w-full"
      />

      <textarea
        value={tasks}
        onChange={(e) => setTasks(e.target.value)}
        placeholder="Tasks for AI generation (one per line)"
        className="border rounded p-2 mb-2 w-full"
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleGenerate}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Generate with AI
        </button>

        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Save Goal
        </button>
      </div>
    </div>
  );
}
