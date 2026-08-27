import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheDel } from "@/lib/cache";
import bcrypt from "bcryptjs";

async function convertLeadToConsumer(req: Request) {
  const body = await req.json();
  const { leadId, companyId, email, name, phone, password, notes, bio } = body;

  if (!leadId || !companyId) {
    return formatResponse(
      false,
      null,
      "Lead ID and Company ID are required",
      400,
    );
  }

  // 1. Fetch target Lead
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    return formatResponse(false, null, "Lead not found", 404);
  }

  const targetEmail = (email || lead.email)?.toLowerCase().trim();
  const targetName = name || lead.name || "Consumer";
  const targetPhone = phone || lead.phone;

  if (!targetEmail) {
    return formatResponse(
      false,
      null,
      "A valid email address is required to create a consumer user profile",
      400,
    );
  }

  // 2. Check if User account already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: {
      consumerProfile: {
        where: { companyId },
      },
    },
  });

  // If user exists AND already has a Consumer profile for THIS company
  if (existingUser && existingUser.consumerProfile.length > 0) {
    return formatResponse(
      false,
      null,
      "A consumer profile already exists for this user in this company",
      409,
    );
  }

  const hashedPassword = await bcrypt.hash(password || "consumer123", 10);
  const loginCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 3. Execute atomic transaction
  const result = await prisma.$transaction(async (tx) => {
    let consumerProfile;

    if (!existingUser) {
      // Create new User and link new Consumer profile
      const newUser = await tx.user.create({
        data: {
          name: targetName,
          email: targetEmail,
          phone: targetPhone,
          password: hashedPassword,
          role: "USER",
          companyId,
          consumerProfile: {
            create: {
              companyId,
              loginCode,
              bio: bio || null,
              notes: notes || `Converted from Lead ID: ${leadId}`,
              membershipStatus: "ACTIVE",
            },
          },
        },
        include: {
          consumerProfile: {
            include: { user: true },
          },
        },
      });

      // Unwrap single consumer profile from the returned array
      consumerProfile = newUser.consumerProfile[0];
    } else {
      // Link new Consumer profile to existing User account
      consumerProfile = await tx.consumer.create({
        data: {
          userId: existingUser.id,
          companyId,
          loginCode,
          bio: bio || null,
          notes: notes || `Converted from Lead ID: ${leadId}`,
          membershipStatus: "ACTIVE",
        },
        include: {
          user: true,
        },
      });
    }

    // Promote Lead stage to 'paid' (Converted)
    const updatedLead = await tx.lead.update({
      where: { id: leadId },
      data: {
        stage: "paid",
        email: targetEmail,
        name: targetName,
      },
    });

    return { consumer: consumerProfile, lead: updatedLead };
  });

  // 4. Invalidate cache
  try {
    await cacheDel(`admin:leads:${companyId}:*`);
    await cacheDel(`admin:consumers:${companyId}:*`);
  } catch (e) {
    // Silently ignore cache deletion failures
  }

  return formatResponse(
    true,
    result,
    "Lead converted into Consumer Profile successfully",
    200,
  );
}

export const POST = withApiHandler(convertLeadToConsumer);
