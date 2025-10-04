import prisma from "@/lib/prisma";

export const copilotTools = {
  functionDeclarations: [
    {
      name: "getEmployeeDetailsByName",
      description: "Use this function to get information about any employee in the company database. This is the primary source of truth for all employee-related questions. Use it to answer questions about their role, position, email, or specific details stored in their profile notes, such as project assignments, special skills, or performance summaries.",
      parameters: {
        type: "OBJECT",
        properties: {
          name: {
            type: "STRING",
            description: "The first and last name of the employee you are looking for. The name must be spelled correctly.",
          },
        },
        required: ["name"],
      },
    },
    {
      name: "updateEmployeeNotes",
      description: "Use this function to add, update, or overwrite the notes for a specific employee. This is used when a user wants to record information like 'add a note for Jane Doe' or 'update John Smith's file'.",
      parameters: {
        type: "OBJECT",
        properties: {
          employeeName: {
            type: "STRING",
            description: "The full name of the employee whose notes are to be updated.",
          },
          notes: {
            type: "STRING",
            description: "The new content to be saved in the employee's notes field.",
          },
        },
        required: ["employeeName", "notes"],
      },
    },
  ],
};

export async function getEmployeeDetailsByName({ name }) {
  console.log(`[Copilot Tool] Running getEmployeeDetailsByName for: ${name}`);
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  try {
    const employee = await prisma.employee.findFirst({
      where: {
        AND: [
          { firstName: { contains: firstName, mode: "insensitive" } },
          lastName ? { lastName: { contains: lastName, mode: "insensitive" } } : {},
        ],
      },
      include: { user: { select: { email: true } } },
    });

    if (!employee) {
      console.log(`[Copilot Tool] No employee found with the name ${name}.`);
      return { error: `No employee found with the name ${name}.` };
    }

    return {
      name: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      email: employee.user?.email ?? "No email available",
      notes: employee.notes || "No additional notes available for this employee.",
    };
  } catch (error) {
    console.error("[Copilot Tool] Error in getEmployeeDetailsByName:", error);
    return { error: "An error occurred while searching the database." };
  }
}

export async function updateEmployeeNotes({ employeeName, notes }) {
  console.log(`[Copilot Tool] Running updateEmployeeNotes for: ${employeeName}`);
  const nameParts = employeeName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  try {
    const employee = await prisma.employee.findFirst({
      where: {
        AND: [
          { firstName: { contains: firstName, mode: "insensitive" } },
          lastName ? { lastName: { contains: lastName, mode: "insensitive" } } : {},
        ],
      },
    });

    if (!employee) {
      console.log(`[Copilot Tool] No employee found with the name ${employeeName}.`);
      return { error: `No employee found with the name ${employeeName}.` };
    }

    await prisma.employee.update({
      where: { id: employee.id },
      data: { notes },
    });

    return { success: `Successfully updated notes for ${employeeName}.` };
  } catch (error) {
    console.error("Prisma error in updateEmployeeNotes:", error);
    return { error: "An error occurred while updating the database." };
  }
}
