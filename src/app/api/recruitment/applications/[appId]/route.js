// in src/app/api/recruitment/applications/[appId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function PATCH(request, { params }) {
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const applicationId = params.appId;
    const { status } = await request.json();

    // You could add validation here to ensure status is a valid ApplicationStatus
    
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Update Application Status Error:", error);
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 });
  }
}