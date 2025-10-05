import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";
import { ReportType, ReportStatus, Role } from "@prisma/client";

/**
 * GET /api/reports
 * Fetch all reports (Admin/HR only)
 */
export async function GET() {
  const user = await getUserSession();
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.HR_RECRUITER)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const reports = await prisma.employeeReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        targetEmployee: { select: { firstName: true, lastName: true, position: true } },
        reporter: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

/**
 * POST /api/reports
 * Submit a new report
 */
export async function POST(request) {
  const user = await getUserSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { targetEmployeeId, type, title, details } = await request.json();

    if (!targetEmployeeId || !type || !title || !details) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map front-end string to Prisma enum
    const reportType = (() => {
      switch (type) {
        case "Complaint": return ReportType.COMPLAINT;
        case "Review": return ReportType.POSITIVE_REVIEW;
        case "Suggestion": return ReportType.SUGGESTION;
        default: return null;
      }
    })();

    if (!reportType) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    // Find employee profile of logged-in user
    const reporterEmployee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });

    if (!reporterEmployee) {
      return NextResponse.json({ error: `Employee $ profile not found` }, { status: 404 });
    }

    // Create the report
    const newReport = await prisma.employeeReport.create({
      data: {
        targetEmployeeId,
        reporterId: reporterEmployee.id,
        type: reportType,
        title,
        details,
        status: ReportStatus.NEW, // default status
      },
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Submit report error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

/**
 * PATCH /api/reports
 * Update report status (Admin/HR only)
 */
export async function PATCH(request) {
  const user = await getUserSession();
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.HR_RECRUITER)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { reportId, status } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: "Missing reportId or status" }, { status: 400 });
    }

    if (!Object.values(ReportStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatedReport = await prisma.employeeReport.update({
      where: { id: reportId },
      data: { status },
      include: {
        targetEmployee: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Update report status error:", error);
    return NextResponse.json({ error: "Failed to update report status" }, { status: 500 });
  }
}
