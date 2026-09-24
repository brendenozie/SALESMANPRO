import prisma from "@/server/db/prismadb";
import {
  EquipmentCondition,
  EquipmentStatus,
  MaintenanceStatus,
  MembershipInterval,
  FitnessMembershipStatus,
  EntitlementTargetType,
  EntitlementSource,
  EntitlementStatus,
  CheckInStatus,
  CheckInMethod,
} from "@prisma/client";

/**
 * Resolves a company by either its ObjectId or its URL slug
 */
export async function resolveCompany(identifier: string) {
  if (!identifier) return null;
  // If 24-char hex string, could be ObjectId
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  if (isObjectId) {
    const comp = await prisma.company.findUnique({
      where: { id: identifier },
      select: { id: true, name: true, slug: true },
    });
    if (comp) return comp;
  }
  return await prisma.company.findUnique({
    where: { slug: identifier },
    select: { id: true, name: true, slug: true },
  });
}

// ==========================================
// 1. EQUIPMENT & MAINTENANCE MANAGEMENT
// ==========================================

export async function listEquipment(companyId: string, filter?: { locationId?: string; status?: EquipmentStatus; category?: string }) {
  const where: any = { companyId };
  if (filter?.locationId) where.locationId = filter.locationId;
  if (filter?.status) where.status = filter.status;
  if (filter?.category) where.category = filter.category;

  return await prisma.equipment.findMany({
    where,
    include: {
      location: { select: { id: true, name: true } },
      maintenanceLogs: {
        orderBy: { maintenanceDate: "desc" },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEquipment(companyId: string, data: {
  name: string;
  category: string;
  locationId?: string;
  roomOrArea?: string;
  serialNumber?: string;
  purchaseDate?: Date | string;
  purchaseCost?: number;
  condition?: EquipmentCondition;
  status?: EquipmentStatus;
  notes?: string;
  imageUrl?: string;
}) {
  return await prisma.equipment.create({
    data: {
      companyId,
      name: data.name,
      category: data.category,
      locationId: data.locationId || null,
      roomOrArea: data.roomOrArea || null,
      serialNumber: data.serialNumber || null,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      purchaseCost: data.purchaseCost ?? 0,
      condition: data.condition || EquipmentCondition.GOOD,
      status: data.status || EquipmentStatus.AVAILABLE,
      notes: data.notes || null,
      imageUrl: data.imageUrl || null,
    },
    include: {
      location: { select: { id: true, name: true } },
    },
  });
}

export async function updateEquipment(id: string, companyId: string, data: Partial<{
  name: string;
  category: string;
  locationId: string | null;
  roomOrArea: string | null;
  serialNumber: string | null;
  purchaseDate: Date | string | null;
  purchaseCost: number;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  lastMaintenance: Date | string | null;
  nextMaintenance: Date | string | null;
  notes: string | null;
  imageUrl: string | null;
}>) {
  const updateData: any = { ...data };
  if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null;
  if (data.lastMaintenance !== undefined) updateData.lastMaintenance = data.lastMaintenance ? new Date(data.lastMaintenance) : null;
  if (data.nextMaintenance !== undefined) updateData.nextMaintenance = data.nextMaintenance ? new Date(data.nextMaintenance) : null;

  return await prisma.equipment.update({
    where: { id },
    data: updateData,
  });
}

export async function recordMaintenance(companyId: string, data: {
  equipmentId: string;
  title: string;
  description?: string;
  status?: MaintenanceStatus;
  technicianName?: string;
  vendorName?: string;
  cost?: number;
  maintenanceDate?: Date | string;
  nextScheduledDate?: Date | string;
  notes?: string;
}) {
  const maintDate = data.maintenanceDate ? new Date(data.maintenanceDate) : new Date();
  const nextDate = data.nextScheduledDate ? new Date(data.nextScheduledDate) : null;

  const log = await prisma.equipmentMaintenance.create({
    data: {
      companyId,
      equipmentId: data.equipmentId,
      title: data.title,
      description: data.description || null,
      status: data.status || MaintenanceStatus.SCHEDULED,
      technicianName: data.technicianName || null,
      vendorName: data.vendorName || null,
      cost: data.cost ?? 0,
      maintenanceDate: maintDate,
      nextScheduledDate: nextDate,
      notes: data.notes || null,
    },
  });

  // Update equipment's last and next maintenance dates
  await prisma.equipment.update({
    where: { id: data.equipmentId },
    data: {
      lastMaintenance: maintDate,
      nextMaintenance: nextDate,
      status: data.status === MaintenanceStatus.IN_PROGRESS ? EquipmentStatus.MAINTENANCE : undefined,
    },
  });

  return log;
}

// ==========================================
// 2. MEMBERSHIP PLANS & CONSUMER MEMBERSHIPS
// ==========================================

export async function listMembershipPlans(companyId: string, onlyActive = true) {
  return await prisma.membershipPlan.findMany({
    where: {
      companyId,
      ...(onlyActive ? { isActive: true } : {}),
    },
    orderBy: { price: "asc" },
  });
}

export async function createMembershipPlan(companyId: string, data: {
  name: string;
  description?: string;
  price: number;
  interval?: MembershipInterval;
  durationDays?: number;
  hasGymAccess?: boolean;
  hasClassAccess?: boolean;
  hasDigitalAccess?: boolean;
  allowedLocationIds?: string[];
  features?: string[];
}) {
  return await prisma.membershipPlan.create({
    data: {
      companyId,
      name: data.name,
      description: data.description || null,
      price: data.price,
      interval: data.interval || MembershipInterval.MONTHLY,
      durationDays: data.durationDays ?? 30,
      hasGymAccess: data.hasGymAccess ?? true,
      hasClassAccess: data.hasClassAccess ?? true,
      hasDigitalAccess: data.hasDigitalAccess ?? true,
      allowedLocationIds: data.allowedLocationIds || [],
      features: data.features || [],
    },
  });
}

export async function createConsumerMembership(companyId: string, data: {
  consumerId: string;
  planId: string;
  startDate?: Date | string;
  orderId?: string;
  notes?: string;
}) {
  const plan = await prisma.membershipPlan.findUnique({
    where: { id: data.planId },
  });
  if (!plan) throw new Error("Membership plan not found");

  const start = data.startDate ? new Date(data.startDate) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + (plan.durationDays || 30));

  const membership = await prisma.fitnessMembership.create({
    data: {
      companyId,
      consumerId: data.consumerId,
      planId: data.planId,
      startDate: start,
      endDate: end,
      status: FitnessMembershipStatus.ACTIVE,
      orderId: data.orderId || null,
      notes: data.notes || null,
    },
    include: {
      plan: true,
      consumer: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  });

  // If digital access is granted, create/update digital entitlement
  if (plan.hasDigitalAccess) {
    await prisma.fitnessEntitlement.create({
      data: {
        companyId,
        consumerId: data.consumerId,
        targetType: EntitlementTargetType.GENERAL_DIGITAL,
        targetId: `membership_${membership.id}`,
        source: EntitlementSource.MEMBERSHIP,
        sourceRefId: membership.id,
        validFrom: start,
        validUntil: end,
        status: EntitlementStatus.ACTIVE,
      },
    });
  }

  // Update consumer status
  await prisma.consumer.update({
    where: { id: data.consumerId },
    data: {
      membershipType: plan.name,
      membershipStatus: "ACTIVE",
    },
  });

  return membership;
}

// ==========================================
// 3. AUTHORITATIVE GYM CHECK-IN & ATTENDANCE
// ==========================================

export async function performGymCheckIn(companyId: string, data: {
  consumerId: string;
  locationId?: string;
  method?: CheckInMethod;
  notes?: string;
}) {
  const now = new Date();

  // Find active membership
  const activeMembership = await prisma.fitnessMembership.findFirst({
    where: {
      companyId,
      consumerId: data.consumerId,
      status: FitnessMembershipStatus.ACTIVE,
      endDate: { gte: now },
    },
    include: { plan: true },
  });

  let status: CheckInStatus = CheckInStatus.SUCCESS;

  if (!activeMembership) {
    status = CheckInStatus.DENIED_NO_MEMBERSHIP;
  } else if (!activeMembership.plan.hasGymAccess) {
    status = CheckInStatus.DENIED_NO_MEMBERSHIP;
  } else if (
    data.locationId &&
    activeMembership.plan.allowedLocationIds.length > 0 &&
    !activeMembership.plan.allowedLocationIds.includes(data.locationId)
  ) {
    status = CheckInStatus.DENIED_WRONG_LOCATION;
  }

  const checkIn = await prisma.gymCheckIn.create({
    data: {
      companyId,
      consumerId: data.consumerId,
      locationId: data.locationId || null,
      membershipId: activeMembership?.id || null,
      status,
      method: data.method || CheckInMethod.MANUAL_STAFF,
      checkInTime: now,
      notes: data.notes || (status !== CheckInStatus.SUCCESS ? `Denied: ${status}` : "Verified check-in"),
    },
    include: {
      consumer: { select: { id: true, user: { select: { name: true, email: true, phone: true } } } },
      location: { select: { id: true, name: true } },
    },
  });

  return {
    success: status === CheckInStatus.SUCCESS,
    checkIn,
    status,
    message: status === CheckInStatus.SUCCESS ? "Check-in successful" : `Check-in denied: ${status}`,
  };
}

// ==========================================
// 4. SERVER-SIDE ACCESS ENTITLEMENTS VERIFICATION
// ==========================================

export async function verifyEntitlement(companyId: string, consumerId: string, target: {
  targetType: "COURSE" | "PROGRAM" | "CLASS" | "TRAINING_PLAN" | "GENERAL_DIGITAL";
  targetId: string;
}) {
  if (!consumerId) return { hasAccess: false, reason: "UNAUTHENTICATED" };

  const now = new Date();

  // 1. Check direct active entitlement for this specific target
  const directEntitlement = await prisma.fitnessEntitlement.findFirst({
    where: {
      companyId,
      consumerId,
      targetType: target.targetType,
      targetId: target.targetId,
      status: EntitlementStatus.ACTIVE,
      validFrom: { lte: now },
      OR: [
        { validUntil: null },
        { validUntil: { gte: now } },
      ],
    },
  });

  if (directEntitlement) {
    return { hasAccess: true, source: directEntitlement.source, entitlementId: directEntitlement.id };
  }

  // 2. Check general digital entitlement via active membership
  const generalEntitlement = await prisma.fitnessEntitlement.findFirst({
    where: {
      companyId,
      consumerId,
      targetType: EntitlementTargetType.GENERAL_DIGITAL,
      status: EntitlementStatus.ACTIVE,
      validFrom: { lte: now },
      OR: [
        { validUntil: null },
        { validUntil: { gte: now } },
      ],
    },
  });

  if (generalEntitlement) {
    return { hasAccess: true, source: EntitlementSource.MEMBERSHIP, entitlementId: generalEntitlement.id };
  }

  // 3. Fallback: check if target course is marked FREE
  if (target.targetType === "COURSE") {
    const course = await prisma.course.findUnique({
      where: { id: target.targetId },
      select: { price: true },
    });
    if (course && (course.price === null || course.price === 0)) {
      return { hasAccess: true, source: "FREE_CONTENT" };
    }
  }

  return { hasAccess: false, reason: "NO_ACTIVE_ENTITLEMENT" };
}

// ==========================================
// 5. FITNESS METRICS & AGGREGATE REPORTS
// ==========================================

export async function getFitnessReportData(companyId: string, period = "last30days") {
  const now = new Date();
  let startDate = new Date();

  if (period === "last7days") {
    startDate.setDate(now.getDate() - 7);
  } else if (period === "lastyear") {
    startDate.setFullYear(now.getFullYear() - 1);
  } else if (period === "alltime") {
    startDate = new Date(0);
  } else {
    // last30days default
    startDate.setDate(now.getDate() - 30);
  }

  const dateRange = { gte: startDate, lte: now };

  const [
    bookingRevenue,
    orderRevenue,
    totalMembers,
    activeMembers,
    newMembers,
    checkInsCount,
    totalBookings,
    topClass,
    topTrainer,
    equipmentRequiringMaint,
  ] = await Promise.all([
    // Booking Revenue
    prisma.booking.aggregate({
      where: { companyId, status: "CONFIRMED", price: { not: null }, startTime: dateRange },
      _sum: { price: true },
    }),
    // POS / Digital Order Revenue
    prisma.customerOrder.aggregate({
      where: { companyId, status: "COMPLETED", createdAt: dateRange },
      _sum: { totalAmount: true },
    }),
    // Total Clients / Consumers
    prisma.consumer.count({ where: { companyId } }),
    // Active Memberships
    prisma.fitnessMembership.count({
      where: { companyId, status: FitnessMembershipStatus.ACTIVE, endDate: { gte: now } },
    }),
    // New Memberships in period
    prisma.fitnessMembership.count({
      where: { companyId, startDate: dateRange },
    }),
    // Gym Check-ins in period
    prisma.gymCheckIn.count({
      where: { companyId, status: CheckInStatus.SUCCESS, checkInTime: dateRange },
    }),
    // Total Bookings
    prisma.booking.count({
      where: { companyId, status: "CONFIRMED", startTime: dateRange },
    }),
    // Top Class
    prisma.booking.groupBy({
      by: ["title"],
      where: { companyId, status: "CONFIRMED", bookingType: "CLASS", startTime: dateRange },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    // Top Trainer
    prisma.booking.groupBy({
      by: ["educatorId"],
      where: { companyId, status: "CONFIRMED", bookingType: "PERSONAL_TRAINING", educatorId: { not: null }, startTime: dateRange },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    // Equipment needing maintenance
    prisma.equipment.count({
      where: {
        companyId,
        status: { in: [EquipmentStatus.MAINTENANCE, EquipmentStatus.OUT_OF_SERVICE] },
      },
    }),
  ]);

  let topTrainerName = "None Assigned";
  if (topTrainer.length > 0 && topTrainer[0].educatorId) {
    const trainer = await prisma.educator.findUnique({
      where: { id: topTrainer[0].educatorId },
      include: { user: { select: { name: true } } },
    });
    if (trainer?.user?.name) topTrainerName = trainer.user.name;
  }

  const combinedRevenue = (bookingRevenue._sum.price || 0) + (orderRevenue._sum.totalAmount || 0);
  const attendanceRate = totalMembers > 0 ? Math.min(100, Math.round((checkInsCount / Math.max(1, totalMembers * 4)) * 100)) : 0;

  return {
    period,
    totalRevenue: combinedRevenue,
    totalMembers,
    activeMembers,
    newMembers,
    attendanceRate,
    classAttendanceRate: attendanceRate,
    checkInsCount,
    totalBookings,
    topPerformingClass: topClass.length > 0 && topClass[0].title ? topClass[0].title : "General Fitness",
    mostBookedTrainer: topTrainerName,
    equipmentRequiringMaint,
  };
}

export async function getFitnessDashboardMetrics(companyId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [
    totalMembers,
    activeMembers,
    newMembersToday,
    bookingRevenueToday,
    orderRevenueToday,
    upcomingClassesList,
    recentCheckIns,
  ] = await Promise.all([
    prisma.consumer.count({ where: { companyId } }),
    prisma.fitnessMembership.count({
      where: { companyId, status: FitnessMembershipStatus.ACTIVE, endDate: { gte: now } },
    }),
    prisma.consumer.count({
      where: { companyId, createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.booking.aggregate({
      where: { companyId, status: "CONFIRMED", startTime: { gte: todayStart, lte: todayEnd } },
      _sum: { price: true },
    }),
    prisma.customerOrder.aggregate({
      where: { companyId, status: "COMPLETED", createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { totalAmount: true },
    }),
    prisma.booking.findMany({
      where: { companyId, startTime: { gte: now } },
      include: {
        educator: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
    prisma.gymCheckIn.findMany({
      where: { companyId },
      include: {
        consumer: { include: { user: { select: { name: true } } } },
        location: { select: { name: true } },
      },
      orderBy: { checkInTime: "desc" },
      take: 5,
    }),
  ]);

  const revenueToday = (bookingRevenueToday._sum.price || 0) + (orderRevenueToday._sum.totalAmount || 0);

  const upcomingClasses = upcomingClassesList.map((cls) => ({
    name: cls.title || "Group Fitness Session",
    instructor: cls.educator?.user?.name || "Staff Trainer",
    time: cls.startTime ? cls.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "TBD",
  }));

  const recentActivities = recentCheckIns.map((ci) => ({
    type: "Check-in",
    description: `${ci.consumer?.user?.name || "Member"} checked in at ${ci.location?.name || "Gym"} (${ci.status})`,
    timestamp: ci.checkInTime ? ci.checkInTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Just now",
  }));

  return {
    totalMembers,
    activeMembers,
    newMembersToday,
    revenueToday,
    upcomingClasses: upcomingClasses.length > 0 ? upcomingClasses : [
      { name: "Morning HIIT", instructor: "Head Coach", time: "08:00 AM" },
      { name: "Yoga & Flexibility", instructor: "Wellness Instructor", time: "10:30 AM" }
    ],
    recentActivities: recentActivities.length > 0 ? recentActivities : [
      { type: "System", description: "Fitness & Wellness operational hub initialized", timestamp: "Today" }
    ],
  };
}
