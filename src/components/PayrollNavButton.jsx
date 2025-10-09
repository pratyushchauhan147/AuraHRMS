"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PayrollNavButton({ user }) {
  const router = useRouter();

  // Show button only for Admin, HR, Senior Manager, or Employee
  if (!["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER", "EMPLOYEE"].includes(user.role)) return null;

  return (
    <Button onClick={() => router.push("/payroll")}>
      Payrolls
    </Button>
  );
}
