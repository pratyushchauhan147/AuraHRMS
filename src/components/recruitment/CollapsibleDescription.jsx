// in src/components/recruitment/CollapsibleDescription.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CollapsibleDescription({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const TUNCATE_LENGTH = 300;

  if (!text) return null;

  const displayText = isExpanded ? text : `${text.substring(0, TUNCATE_LENGTH)}...`;

  return (
    <div>
      <p className="text-gray-600 max-w-3xl whitespace-pre-wrap">{displayText}</p>
      {text.length > TUNCATE_LENGTH && (
        <Button variant="link" className="px-0" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
      )}
    </div>
  );
}