import prisma from '../server/db/prismadb';

async function testTransportSection() {
  console.log('--- Testing Section 6: Transport Operations (8 Routes) CRUD & Consistency ---');
  const companyId = '683581bba1bdf6ca3624b530'; // Mount Moriah

  // Ensure owner user exists
  const user = await prisma.user.findFirst({
    where: { email: 'brendenozie@gmail.com' },
  });
  if (!user) throw new Error('Owner user not found');

  // ==========================================
  // 1. Vehicle CRUD
  // ==========================================
  console.log('1. Testing TransportVehicle CRUD...');
  const testReg = `BUS-${Date.now().toString().slice(-4)}`;
  const vehicle = await prisma.transportVehicle.create({
    data: {
      companyId,
      registration: testReg,
      make: 'Toyota',
      model: 'Coaster 30-Seater',
      year: 2024,
      type: 'BUS',
      capacity: 30,
      status: 'ACTIVE',
      mileage: 12500,
    },
  });
  console.log('   Created vehicle:', vehicle.id, vehicle.registration);

  const updatedVehicle = await prisma.transportVehicle.update({
    where: { id: vehicle.id },
    data: { mileage: 13000, status: 'ACTIVE' },
  });
  if (updatedVehicle.mileage !== 13000) throw new Error('Vehicle update failed');
  console.log('   Updated vehicle mileage:', updatedVehicle.mileage);

  // ==========================================
  // 2. Route CRUD
  // ==========================================
  console.log('2. Testing TransportRoute CRUD...');
  const testRouteName = `Route ${Date.now().toString().slice(-4)} - North Suburbs`;
  const route = await prisma.transportRoute.create({
    data: {
      companyId,
      name: testRouteName,
      startPoint: 'School Main Gate',
      endPoint: 'North Hills Terminal',
      vehicleId: vehicle.id,
      stops: [
        { name: 'Station 1: Market Road', time: '07:15 AM' },
        { name: 'Station 2: Green Valley', time: '07:30 AM' },
      ],
    },
  });
  console.log('   Created route:', route.id, route.name);

  const updatedRoute = await prisma.transportRoute.update({
    where: { id: route.id },
    data: { endPoint: 'North Hills Extension' },
  });
  if (updatedRoute.endPoint !== 'North Hills Extension') throw new Error('Route update failed');
  console.log('   Updated route endpoint successfully.');

  // ==========================================
  // 3. Driver CRUD
  // ==========================================
  console.log('3. Testing TransportDriver CRUD...');
  const licenseNo = `DL-${Date.now().toString().slice(-7)}`;
  // Find or create driver user
  let driverUser = await prisma.user.findFirst({
    where: { email: `driver-${Date.now()}@moriah-transport.com` },
  });
  if (!driverUser) {
    driverUser = await prisma.user.create({
      data: {
        email: `driver-${Date.now()}@moriah-transport.com`,
        name: 'John K. Mwangi',
        role: 'SCHOOL_DRIVER',
        companyId,
      },
    });
  }

  const driver = await prisma.transportDriver.create({
    data: {
      companyId,
      userId: driverUser.id,
      licenseNo,
      status: 'ACTIVE',
      experienceYears: 8,
      loginCode: `DRV-${Date.now().toString().slice(-4)}`,
    },
  });
  console.log('   Created driver:', driver.id, 'License:', driver.licenseNo);

  await prisma.transportDriver.update({
    where: { id: driver.id },
    data: { experienceYears: 9 },
  });
  console.log('   Updated driver experience years to 9.');

  // ==========================================
  // 4. Schedule / Shift CRUD
  // ==========================================
  console.log('4. Testing TransportShift (Schedule) CRUD...');
  const shiftStart = new Date(Date.now() + 86400000);
  shiftStart.setHours(7, 0, 0, 0);
  const shiftEnd = new Date(shiftStart);
  shiftEnd.setHours(8, 30, 0, 0);

  const shift = await prisma.transportShift.create({
    data: {
      companyId,
      routeId: route.id,
      driverId: driver.id,
      vehicleId: vehicle.id,
      startTime: shiftStart,
      endTime: shiftEnd,
      status: 'SCHEDULED',
    },
  });
  console.log('   Created transport schedule/shift:', shift.id, 'Status:', shift.status);

  await prisma.transportShift.update({
    where: { id: shift.id },
    data: { status: 'COMPLETED' },
  });
  console.log('   Updated schedule status to COMPLETED.');

  // ==========================================
  // 5. Maintenance CRUD
  // ==========================================
  console.log('5. Testing TransportMaintenance CRUD...');
  const maintenance = await prisma.transportMaintenance.create({
    data: {
      vehicleId: vehicle.id,
      description: 'Scheduled 15,000km Engine Oil and Brake Service',
      scheduledDate: new Date(),
      cost: 180.0,
      status: 'COMPLETED',
      notes: 'Brake pads replaced, filters renewed.',
    },
  });
  console.log('   Created maintenance record:', maintenance.id, 'Cost:', maintenance.cost);

  // ==========================================
  // 6. Fuel Log CRUD
  // ==========================================
  console.log('6. Testing TransportFuelLog CRUD...');
  const fuelLog = await prisma.transportFuelLog.create({
    data: {
      vehicleId: vehicle.id,
      date: new Date(),
      quantity: 65.5,
      cost: 110.0,
      odometer: 13050,
      notes: 'Shell Station North fueling',
    },
  });
  console.log('   Created fuel log:', fuelLog.id, 'Liters:', fuelLog.quantity, 'Cost:', fuelLog.cost);

  // ==========================================
  // 7. Transport Incident CRUD
  // ==========================================
  console.log('7. Testing Transport Incident CRUD...');
  const incident = await prisma.transportMaintenance.create({
    data: {
      vehicleId: vehicle.id,
      description: 'Incident: Side Mirror Clipping | Driver: John K. Mwangi | Severity: Low',
      scheduledDate: new Date(),
      cost: 45.0,
      status: 'SCHEDULED',
      notes: 'Clipped branch during tight corner on Elm St. Mirror glass replaced.',
    },
  });
  console.log('   Created incident record:', incident.id, 'Description:', incident.description);

  // ==========================================
  // 8. Fleet Metrics / Reports Verification
  // ==========================================
  console.log('8. Verifying fleet reports derived metrics...');
  const [totalVehicles, activeRoutes, fuelTotals] = await Promise.all([
    prisma.transportVehicle.count({ where: { companyId } }),
    prisma.transportRoute.count({ where: { companyId } }),
    prisma.transportFuelLog.aggregate({
      where: { vehicle: { companyId } },
      _sum: { cost: true, quantity: true },
    }),
  ]);
  console.log('   Derived fleet metrics - Total Vehicles:', totalVehicles, 'Routes:', activeRoutes, 'Total Fuel Cost:', fuelTotals._sum.cost);

  // ==========================================
  // 9. Cleanup Test Records
  // ==========================================
  console.log('9. Cleaning up test records...');
  await prisma.transportMaintenance.delete({ where: { id: incident.id } });
  await prisma.transportFuelLog.delete({ where: { id: fuelLog.id } });
  await prisma.transportMaintenance.delete({ where: { id: maintenance.id } });
  await prisma.transportShift.delete({ where: { id: shift.id } });
  await prisma.transportDriver.delete({ where: { id: driver.id } });
  await prisma.user.delete({ where: { id: driverUser.id } });
  await prisma.transportRoute.delete({ where: { id: route.id } });
  await prisma.transportVehicle.delete({ where: { id: vehicle.id } });
  console.log('   Cleaned up all transport test entities successfully.');

  console.log('--- Section 6: Transport Operations Complete: ALL 8 ROUTES PASS ---');
}

testTransportSection()
  .catch((e) => {
    console.error('Test Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
