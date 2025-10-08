// in src/components/recruitment/ScheduleInterviewForm.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function ScheduleInterviewForm({ onSave, onCancel }) {
  const [scheduledFor, setScheduledFor] = useState(null);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!scheduledFor) {
      alert("Please select an interview date.");
      return;
    }
    onSave({ scheduledFor, feedback });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Interview Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {scheduledFor ? format(scheduledFor, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={scheduledFor}
              onSelect={setScheduledFor}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label>Notes for Interviewer (Optional)</Label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g., Focus on React hooks and state management."
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Schedule</Button>
      </DialogFooter>
    </form>
  );
}