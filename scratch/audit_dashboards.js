const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('c:/Users/Brenden/Desktop/SalesForce/SalesMan');

// 1. Check all dashboard clients in components/admin/
const dashboardList = [
  'EcomDashboardClient',
  'RealEstateDashboardClient',
  'CoachDashboardClient',
  'AutomotiveDashboardClient',
  'BlogDashboardClient',
  'EventDashboardClient',
  'FinanceDashboardClient',
  'FitnessDashboardClient',
  'HealthcareDashboardClient',
  'MediaDashboardClient',
  'NonprofitDashboardClient',
  'PortfolioDashboardClient',
  'RestaurantDashboardClient',
  'SaaSDashboardClient',
  'TravelDashboardClient',
  'ServiceProviderDashboard',
  'BookingAppointmentsDashboard',
  'TutorDashboard',
  'StudentDashboard',
  'ParentDashboard',
  'PrincipalDashboard',
  'AdminDashClient', // UncategorizedDashboard
  'PlaygroupDashboard',
  'DriverShiftClientDashboard',
  'LogisticsDashboard'
];

console.log('--- DASHBOARD CLIENT COMPONENT AUDIT ---');
const componentsDir = path.join(rootDir, 'components/admin');
dashboardList.forEach(name => {
  const tsxPath = path.join(componentsDir, `${name}.tsx`);
  const exists = fs.existsSync(tsxPath);
  if (!exists) {
    console.log(`[MISSING COMPONENT] ${name} at ${tsxPath}`);
    return;
  }
  const content = fs.readFileSync(tsxPath, 'utf-8');
  const sizeKb = (content.length / 1024).toFixed(1);
  
  // Look for mock/hardcoded indicators
  const hasMock = /mock|dummy|placeholder|sampleData|initialMock/i.test(content);
  const hasFetch = /fetch\(|useSWR|useQuery|axios/i.test(content);
  const hasProps = /interface.*Props|type.*Props/i.test(content);
  
  // Extract props interface if possible
  const propsMatch = content.match(/(?:interface|type)\s+([A-Za-z0-9_]*Props)[\s\S]*?\{([\s\S]*?)\}/);
  const propsFields = propsMatch ? propsMatch[2].replace(/\n\s+/g, ' ').trim().slice(0, 100) : 'no props match';

  console.log(`- ${name} (${sizeKb} KB): hasFetch=${hasFetch}, hasMock=${hasMock}`);
});

// 2. Check dashboard API routes in app/api/admin/dashboard
console.log('\n--- DASHBOARD API ROUTES AUDIT ---');
const dashApiDir = path.join(rootDir, 'app/api/admin/dashboard');
if (fs.existsSync(dashApiDir)) {
  const entries = fs.readdirSync(dashApiDir, { withFileTypes: true });
  entries.forEach(e => {
    if (e.isDirectory()) {
      const sub = path.join(dashApiDir, e.name);
      const hasRoute = fs.existsSync(path.join(sub, 'route.ts')) || 
                        fs.existsSync(path.join(sub, '[slug]', 'route.ts')) ||
                        fs.existsSync(path.join(sub, '[companyId]', 'route.ts'));
      console.log(`Route: /api/admin/dashboard/${e.name} => ${hasRoute ? 'EXISTS' : 'NO ROUTE FILE'}`);
    }
  });
}
