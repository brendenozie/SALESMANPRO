const fs = require('fs');

let c = fs.readFileSync('app/admin/[slug]/schoolAnnouncements/AdminAnnouncementsPage.tsx', 'utf8');

c = c.replace(
  '${apiBaseUrl}/admin/announcements/${announcementId}',
  '${apiBaseUrl}/admin/announcements/${announcementId}?companyId=${encodeURIComponent(companyId)}'
);

// updateAnnouncementStatus fetch:
c = c.replace(
  'fetch(`${apiBaseUrl}/admin/announcements/${announcementId}`',
  'fetch(`${apiBaseUrl}/admin/announcements/${announcementId}?companyId=${encodeURIComponent(companyId)}`'
);

// isEdit url:
c = c.replace(
  '? `${apiBaseUrl}/admin/announcements/${announcementData.id}`',
  '? `${apiBaseUrl}/admin/announcements/${announcementData.id}?companyId=${encodeURIComponent(companyId)}`'
);

fs.writeFileSync('app/admin/[slug]/schoolAnnouncements/AdminAnnouncementsPage.tsx', c, 'utf8');
console.log('Updated AdminAnnouncementsPage.tsx successfully');
