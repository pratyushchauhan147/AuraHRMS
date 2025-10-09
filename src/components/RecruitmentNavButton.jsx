"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react"; // optional icon

export default function RecruitmentNavButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/recruitment")}
      className="bg-zinc-900 hover:bg-blue-700 text-white"
    >
      <Briefcase className="w-4 h-4 mr-2" />
      Go to Recruitment
    </Button>
  );
}
