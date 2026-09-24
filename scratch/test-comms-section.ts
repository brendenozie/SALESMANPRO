import prisma from '../server/db/prismadb';

async function testCommsSection() {
  console.log('--- Testing Section 4: Attendance, Events & Communications CRUD ---');
  const companyId = '683581bba1bdf6ca3624b530'; // Mount Moriah

  // Ensure owner user exists
  const user = await prisma.user.findFirst({
    where: { email: 'brendenozie@gmail.com' },
  });
  if (!user) throw new Error('Owner user not found');

  // Find a student for attendance testing
  const student = await prisma.student.findFirst({
    where: { companyId },
  });
  if (!student) throw new Error('Student not found for company');

  // ==========================================
  // 1. Attendance Test
  // ==========================================
  console.log('1. Testing AttendanceRecord CRUD...');
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Clean any previous test record for today
  await prisma.attendanceRecord.deleteMany({
    where: {
      studentId: student.id,
      date: { gte: startOfDay, lte: endOfDay },
    },
  });

  // Create
  const attendance = await prisma.attendanceRecord.create({
    data: {
      studentId: student.id,
      date: today,
      status: 'PRESENT',
      reason: 'Audit Test Normal Attendance',
      recordedById: user.id,
    },
  });
  console.log('   Created attendance record:', attendance.id, 'Status:', attendance.status);

  // Update
  const updatedAttendance = await prisma.attendanceRecord.update({
    where: { id: attendance.id },
    data: {
      status: 'TARDY',
      reason: 'Audit Test Updated Reason: Traffic Delay',
    },
  });
  if (updatedAttendance.status !== 'TARDY') throw new Error('Attendance update failed');
  console.log('   Updated attendance record:', updatedAttendance.id, 'New Status:', updatedAttendance.status);

  // Verify Read
  const readAttendance = await prisma.attendanceRecord.findFirst({
    where: {
      id: attendance.id,
      student: { companyId },
    },
  });
  if (!readAttendance || readAttendance.status !== 'TARDY') throw new Error('Attendance read failed');
  console.log('   Read attendance record verified successfully.');

  // Cleanup
  await prisma.attendanceRecord.delete({ where: { id: attendance.id } });
  console.log('   Cleaned up test attendance record.');

  // ==========================================
  // 2. Events Test
  // ==========================================
  console.log('2. Testing Event CRUD...');
  const eventStart = new Date(Date.now() + 86400000); // Tomorrow
  const eventEnd = new Date(Date.now() + 90000000);

  const testEventTitle = `Audit Test School Gala ${Date.now()}`;
  const createdEvent = await prisma.event.create({
    data: {
      companyId,
      title: testEventTitle,
      summary: 'Annual school gala test',
      description: 'Full description of the annual gala',
      startDateTime: eventStart,
      endDateTime: eventEnd,
      eventType: 'CULTURAL',
      eventStatus: 'SCHEDULED',
      organizerId: user.id,
      audience: 'ALL',
      location: 'Main Auditorium',
    },
    include: { organizer: true },
  });
  console.log('   Created Event:', createdEvent.id, createdEvent.title);

  // Read
  const readEvent = await prisma.event.findFirst({
    where: { id: createdEvent.id, companyId },
  });
  if (!readEvent || readEvent.title !== testEventTitle) throw new Error('Event read failed');
  console.log('   Read Event verified successfully.');

  // Update
  const updatedEvent = await prisma.event.update({
    where: { id: createdEvent.id },
    data: {
      title: `${testEventTitle} - Updated`,
      eventStatus: 'POSTPONED',
    },
  });
  if (updatedEvent.eventStatus !== 'POSTPONED') throw new Error('Event update failed');
  console.log('   Updated Event verified:', updatedEvent.title, 'Status:', updatedEvent.eventStatus);

  // Delete
  await prisma.event.delete({ where: { id: createdEvent.id } });
  const deletedEventCheck = await prisma.event.findUnique({ where: { id: createdEvent.id } });
  if (deletedEventCheck) throw new Error('Event still exists after delete');
  console.log('   Deleted Event successfully.');

  // ==========================================
  // 3. Announcements Test
  // ==========================================
  console.log('3. Testing Announcement CRUD...');
  const testAnnouncementTitle = `Audit Test Announcement ${Date.now()}`;
  const createdAnnouncement = await prisma.announcement.create({
    data: {
      companyId,
      title: testAnnouncementTitle,
      summary: 'Testing announcement summary',
      content: 'Detailed text for the announcement body',
      authorId: user.id,
      audience: 'ALL',
      type: 'GENERAL',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
  console.log('   Created Announcement:', createdAnnouncement.id, createdAnnouncement.title);

  // Read
  const readAnnouncement = await prisma.announcement.findFirst({
    where: { id: createdAnnouncement.id, companyId },
  });
  if (!readAnnouncement || readAnnouncement.title !== testAnnouncementTitle) throw new Error('Announcement read failed');
  console.log('   Read Announcement verified successfully.');

  // Update
  const updatedAnnouncement = await prisma.announcement.update({
    where: { id: createdAnnouncement.id },
    data: {
      title: `${testAnnouncementTitle} - Updated`,
      status: 'ARCHIVED',
    },
  });
  if (updatedAnnouncement.status !== 'ARCHIVED') throw new Error('Announcement update failed');
  console.log('   Updated Announcement verified:', updatedAnnouncement.title, 'Status:', updatedAnnouncement.status);

  // Delete
  await prisma.announcement.delete({ where: { id: createdAnnouncement.id } });
  const deletedAnnouncementCheck = await prisma.announcement.findUnique({ where: { id: createdAnnouncement.id } });
  if (deletedAnnouncementCheck) throw new Error('Announcement still exists after delete');
  console.log('   Deleted Announcement successfully.');

  // ==========================================
  // 4. Messages / Conversation Test
  // ==========================================
  console.log('4. Testing Conversation & Message CRUD...');
  const conversation = await prisma.conversation.create({
    data: {
      companyId,
      title: `Audit Test Conversation ${Date.now()}`,
      participants: {
        create: [
          { userId: user.id },
        ],
      },
      messages: {
        create: [
          {
            content: 'Hello, this is a test audit communication.',
            senderId: user.id,
          },
        ],
      },
    },
    include: { messages: true, participants: true },
  });
  console.log('   Created Conversation:', conversation.id, 'with message:', conversation.messages[0].id);

  // Read
  const readConversation = await prisma.conversation.findFirst({
    where: { id: conversation.id, companyId },
    include: { messages: true },
  });
  if (!readConversation || readConversation.messages.length === 0) throw new Error('Conversation read failed');
  console.log('   Read Conversation verified with', readConversation.messages.length, 'messages.');

  // Cleanup
  await prisma.message.deleteMany({ where: { conversationId: conversation.id } });
  await prisma.conversationParticipant.deleteMany({ where: { conversationId: conversation.id } });
  await prisma.conversation.delete({ where: { id: conversation.id } });
  console.log('   Cleaned up test conversation and messages.');

  console.log('--- Section 4: Attendance, Events & Communications Complete: ALL PASS ---');
}

testCommsSection()
  .catch((e) => {
    console.error('Test Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
