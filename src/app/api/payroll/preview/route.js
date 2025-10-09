import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function POST(req) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role))
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const { month, year } = await req.json();
    if (!month || !year)
      return NextResponse.json({ error: "Month and year required" }, { status: 400 });

    // Fetch all employees with salary
    const employees = await prisma.employee.findMany({
      where: { salary: { not: null } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        salary: true,
      },
    });

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const previews = [];

    for (const emp of employees) {
      // Fetch attendance for this employee in given month
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // --- Basic Payroll Logic ---
      const baseSalary = emp.salary ?? 0;

      // total hours logged
      const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);

      // assume 160 working hours per month → anything extra = overtime
      const overtimeHours = Math.max(0, totalHours - 160);
      const overtimePay = overtimeHours * 200; // ₹200 per hour

      const bonuses = 0; // placeholder
      const deductions = 0; // placeholder
      const taxes = Math.round((baseSalary + overtimePay) * 0.1); // 10% tax
      const netPay = baseSalary + overtimePay + bonuses - deductions - taxes;

      previews.push({
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        baseSalary,
        overtimePay,
        bonuses,
        deductions,
        taxes,
        netPay,
      });
    }

    const totalEmployees = previews.length;
    const totalPayout = previews.reduce((sum, p) => sum + p.netPay, 0);

    return NextResponse.json({
      month,
      year,
      totalEmployees,
      totalPayout,
      payslips: previews,
    });
  } catch (err) {
    console.error("Payroll Preview Error:", err);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
