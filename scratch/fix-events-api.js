const fs = require('fs');

let c = fs.readFileSync('app/api/admin/events/route.ts', 'utf8');

const target1 = `  // Validate organizerId exists (Assuming organizerId is a SalesAgent ID that links to a User)
  const existingOrganizer = await prisma.salesAgent.findUnique({
    where: { id: organizerId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!existingOrganizer) {
    return formatResponse(
      false,
      null,
      "Provided organizerId (Sales Agent) does not exist.",
      400,
    );
  }
  const finalOrganizerUserId = existingOrganizer.user?.id; // Use the User ID linked to the Sales Agent`;

const rep1 = `  // Validate organizerId exists (Can be User, SalesAgent, or Staff)
  let finalOrganizerUserId: string | undefined;

  const directUser = await prisma.user.findUnique({
    where: { id: organizerId },
    select: { id: true },
  });
  if (directUser) {
    finalOrganizerUserId = directUser.id;
  } else {
    const existingOrganizer = await prisma.salesAgent.findUnique({
      where: { id: organizerId },
      include: { user: { select: { id: true } } },
    });
    if (existingOrganizer?.user?.id) {
      finalOrganizerUserId = existingOrganizer.user.id;
    } else {
      const staffMember = await prisma.staff.findUnique({
        where: { id: organizerId },
        select: { userId: true },
      });
      if (staffMember?.userId) {
        finalOrganizerUserId = staffMember.userId;
      }
    }
  }

  if (!finalOrganizerUserId) {
    return formatResponse(
      false,
      null,
      "Provided organizerId does not match a valid User, Staff, or Sales Agent.",
      400,
    );
  }`;

// Handle both LF and CRLF
if (c.includes(target1)) {
  c = c.replace(target1, rep1);
} else {
  c = c.replace(target1.replace(/\n/g, '\r\n'), rep1.replace(/\n/g, '\r\n'));
}

// Fix double nesting
c = c.replace('return formatResponse(true, { data: responseData }, null, 201);', 'return formatResponse(true, responseData, "Event created successfully", 201);');

fs.writeFileSync('app/api/admin/events/route.ts', c, 'utf8');
console.log('Updated app/api/admin/events/route.ts successfully');
