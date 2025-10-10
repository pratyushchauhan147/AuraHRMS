import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";


const DEFAULT_OVERTIME_RATE = 200; // ₹ per overtime hour

export async function POST(req) {
  try {
    const user = await getUserSession();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!["ADMIN", "HR_RECRUITER"].includes(user.role))
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    // ✅ Parse body safely
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body received" },
        { status: 400 }
      );
    }

    const { month, year } = body;

    if (!month || !year)
      return NextResponse.json(
        { error: "Month and Year are required" },
        { status: 400 }
      );

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (isNaN(monthNum) || isNaN(yearNum))
      return NextResponse.json(
        { error: "Month and Year must be valid numbers" },
        { status: 400 }
      );

    // ✅ Prevent duplicate payroll
    const existing = await prisma.payroll.findFirst({
      where: { month: monthNum, year: yearNum },
    });

    if (existing)
      return NextResponse.json(
        { error: `Payroll for ${monthNum}/${yearNum} already exists.` },
        { status: 400 }
      );

    // ✅ Fetch employees
    const employees = await prisma.employee.findMany({
      select: { id: true, salary: true },
    });

    if (employees.length === 0)
      return NextResponse.json(
        { error: "No employees found" },
        { status: 404 }
      );

    // ✅ Create Payroll record
    const payroll = await prisma.payroll.create({
      data: {
        month: monthNum,
        year: yearNum,
        totalEmployees: employees.length,
        status: "PENDING",
      },
    });

    // ✅ Compute payslips
    let totalPayout = 0;
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 1);

    for (const emp of employees) {
      const salary = emp.salary ?? 0;
      const attendance = await prisma.attendance.findMany({
        where: { employeeId: emp.id, date: { gte: startDate, lt: endDate } },
      });

      const totalDays = attendance.length;
const overtimeHours = attendance.reduce(
  (sum, a) => sum + (a.overtime ?? 0),
  0
);
const overtimePay = overtimeHours * DEFAULT_OVERTIME_RATE;

const workingDays = 30; // You can make this dynamic later if needed

// ✅ Deduct only if attendance exists; assume no deduction if data missing
const deductions =
  totalDays > 0
    ? Math.max(0, (workingDays - totalDays) * (salary / workingDays))
    : 0;

// ✅ Flat 10% tax
const taxes = salary * 0.1;
const bonuses = 0;

// ✅ Prevent negative salaries
const netPay = Math.max(
  0,
  salary + overtimePay - deductions - taxes + bonuses
);
      await prisma.payslip.create({
        data: {
          employeeId: emp.id,
          payrollId: payroll.id,
          baseSalary: salary,
          overtimePay,
          deductions,
          taxes,
          bonuses,
          netPay,
          remarks: `Payroll generated for ${monthNum}/${yearNum}`,
        },
      });

      totalPayout += netPay;
    }

    await prisma.payroll.update({
      where: { id: payroll.id },
      data: { totalPayout, status: "GENERATED" },
    });

    return NextResponse.json({
      message: `Payroll for ${monthNum}/${yearNum} generated successfully`,
      payrollId: payroll.id,
      totalEmployees: employees.length,
      totalPayout,
    });
  } catch (err) {
    console.error("Payroll Generation Error:", err);
    return NextResponse.json(
      { error: "Failed to generate payroll", details: err.message },
      { status: 500 }
    );
  }
}
