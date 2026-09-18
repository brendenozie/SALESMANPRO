const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('c:/Users/Brenden/Desktop/SalesForce/SalesMan');
const dashboardApiDir = path.join(rootDir, 'app/api/admin/dashboard');

const verticals = [
  { key: 'ecommerce', routeDir: 'ecommerce', client: 'EcomDashboardClient' },
  { key: 'real estate', routeDir: 'real-estate', client: 'RealEstateDashboardClient' },
  { key: 'consultant & coach', routeDir: 'coach', client: 'CoachDashboardClient' },
  { key: 'automotive', routeDir: 'automotive', client: 'AutomotiveDashboardClient' },
  { key: 'blog & content', routeDir: 'blog', client: 'BlogDashboardClient' },
  { key: 'event & ticketing', routeDir: 'events', client: 'EventDashboardClient' },
  { key: 'finance & legal', routeDir: 'finance-legal', client: 'FinanceDashboardClient' },
  { key: 'fitness & wellness', routeDir: 'fitness', client: 'FitnessDashboardClient' },
  { key: 'healthcare & clinics', routeDir: 'healthcare', client: 'HealthcareDashboardClient' },
  { key: 'media & entertainment', routeDir: 'media', client: 'MediaDashboardClient' },
  { key: 'nonprofit & community', routeDir: 'nonprofit', client: 'NonprofitDashboardClient' },
  { key: 'portfolio & personal branding', routeDir: 'portfolio', client: 'PortfolioDashboardClient' },
  { key: 'restaurant & food delivery', routeDir: 'restaurent', client: 'RestaurantDashboardClient' },
  { key: 'saas & web apps', routeDir: 'saas', client: 'SaaSDashboardClient' },
  { key: 'travel & tourism', routeDir: 'travel', client: 'TravelDashboardClient' },
  { key: 'service provider', routeDir: 'serviceprovider', client: 'ServiceProviderDashboard' },
  { key: 'booking & appointments', routeDir: 'booking', client: 'BookingAppointmentsDashboard' },
  { key: 'delivery & logistics', routeDir: 'logistics', client: 'LogisticsDashboard' },
  { key: 'educator', routeDir: 'educator', client: 'TutorDashboard' },
  { key: 'student', routeDir: 'student', client: 'StudentDashboard' },
  { key: 'parent', routeDir: 'parent', client: 'ParentDashboard' },
  { key: 'principle', routeDir: 'principle', client: 'PrincipalDashboard' },
];

console.log('--- VERTICAL ROUTE FILE INSPECTION ---');
verticals.forEach(v => {
  const dirPath = path.join(dashboardApiDir, v.routeDir);
  let routeFile = null;
  if (fs.existsSync(path.join(dirPath, 'route.ts'))) routeFile = path.join(dirPath, 'route.ts');
  else if (fs.existsSync(path.join(dirPath, '[slug]', 'route.ts'))) routeFile = path.join(dirPath, '[slug]', 'route.ts');
  else if (fs.existsSync(path.join(dirPath, '[companyId]', 'route.ts'))) routeFile = path.join(dirPath, '[companyId]', 'route.ts');

  if (!routeFile) {
    console.log(`[NO ROUTE] ${v.key} (${v.routeDir})`);
    return;
  }

  const content = fs.readFileSync(routeFile, 'utf-8');
  const hasPrisma = content.includes('prisma') || content.includes('server/db');
  const hasMock = /mock|dummy/i.test(content);
  const routeSize = (content.length / 1024).toFixed(1);

  // Check client props vs route response
  const clientPath = path.join(rootDir, 'components/admin', `${v.client}.tsx`);
  let clientProps = 'no client';
  if (fs.existsSync(clientPath)) {
    const clientContent = fs.readFileSync(clientPath, 'utf-8');
    const m = clientContent.match(/(?:interface|type)\s+([A-Za-z0-9_]*Props)[\s\S]*?\{([\s\S]*?)\n\}/);
    if (m) clientProps = m[1];
  }

  console.log(`${v.key.padEnd(30)} -> ${v.routeDir.padEnd(16)} (size: ${routeSize}KB, prisma: ${hasPrisma}, mock: ${hasMock}) | Client: ${v.client} (${clientProps})`);
});
