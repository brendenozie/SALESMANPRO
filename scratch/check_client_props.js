const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('c:/Users/Brenden/Desktop/SalesForce/SalesMan');

const clients = [
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
  'LogisticsDashboard',
  'TutorDashboard',
  'StudentDashboard',
  'ParentDashboard',
  'PrincipalDashboard',
  'AdminDashClient',
  'PlaygroupDashboard',
  'DriverShiftClientDashboard'
];

clients.forEach(c => {
  const filePath = path.join(rootDir, 'components/admin', `${c}.tsx`);
  if (!fs.existsSync(filePath)) {
    console.log(`[MISSING] ${c}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  // Find component declaration
  const funcMatch = content.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/) ||
                    content.match(/const\s+([A-Za-z0-9_]+)\s*:\s*React\.FC<([^>]+)>\s*=\s*\(([^)]*)\)/) ||
                    content.match(/export\s+default\s+([A-Za-z0-9_]+)/);

  // Look for how props are destructured
  const matchDestructure = content.match(/export\s+default\s+function\s+[A-Za-z0-9_]+\s*\(\s*\{([^}]+)\}/s);
  const destructured = matchDestructure ? matchDestructure[1].replace(/\s+/g, ' ').trim().slice(0, 150) : 'none';

  console.log(`\n=== ${c} ===`);
  console.log(`Destructured props: ${destructured}`);
});
