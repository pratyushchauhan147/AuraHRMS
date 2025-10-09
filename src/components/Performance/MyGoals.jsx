"use client";

import { useEffect, useState } from "react";

export default function MyGoals() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      const res = await fetch("/api/goals/my");
      const data = await res.json();
      setGoals(data);
    };
    fetchGoals();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Goals</h2>
      <ul className="space-y-2">
        {goals.map((goal) => (
          <li key={goal.id} className="border p-4 rounded-md">
            <h3 className="font-semibold">{goal.objective}</h3>
            <p className="text-sm">{goal.keyResults}</p>
            <p className="text-xs text-gray-500">Quarter: {goal.quarter}</p>
            <p className="text-xs text-gray-500">Status: {goal.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
