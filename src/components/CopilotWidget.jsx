// in src/components/CopilotWidget.jsx
"use client";

import { useState } from "react";

export default function CopilotWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { author: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response from Co-pilot");
      }

      const data = await res.json();
      const aiMessage = { author: "ai", content: data.response };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage = { author: "ai", content: "Sorry, I couldn't process that request." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">AI Co-pilot</h3>
      <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded-md border space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.author === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                <span className="animate-pulse">...</span>
              </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about an employee..."
          className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-r-md border border-transparent bg-indigo-600 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
}