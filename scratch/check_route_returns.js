const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('c:/Users/Brenden/Desktop/SalesForce/SalesMan');

function checkRouteReturn(routeRelPath) {
  const fullPath = path.join(rootDir, routeRelPath);
  if (!fs.existsSync(fullPath)) return 'File not found';
  const content = fs.readFileSync(fullPath, 'utf-8');
  const returnMatch = content.match(/NextResponse\.json\(\s*\{\s*(?:success:\s*true,\s*)?data:\s*(\{[\s\S]*?\})\s*\}\s*\)/);
  if (returnMatch) {
    const lines = returnMatch[1].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && l.includes(':'));
    return lines.map(l => l.split(':')[0].trim()).join(', ');
  }
  // Try alternative format
  const match2 = content.match(/data:\s*([A-Za-z0-9_]+)/);
  if (match2) return `variable: ${match2[1]}`;
  return 'Could not parse return data';
}

const comparisons = [
  { name: 'serviceprovider', route: 'app/api/admin/dashboard/serviceprovider/[slug]/route.ts', client: 'components/admin/ServiceProviderDashboard.tsx' },
  { name: 'logistics', route: 'app/api/admin/dashboard/logistics/[slug]/route.ts', client: 'components/admin/LogisticsDashboard.tsx' },
  { name: 'fitness', route: 'app/api/admin/dashboard/fitness/[slug]/route.ts', client: 'components/admin/FitnessDashboardClient.tsx' },
  { name: 'travel', route: 'app/api/admin/dashboard/travel/[slug]/route.ts', client: 'components/admin/TravelDashboardClient.tsx' },
  { name: 'events', route: 'app/api/admin/dashboard/events/[slug]/route.ts', client: 'components/admin/EventDashboardClient.tsx' },
  { name: 'booking', route: 'app/api/admin/dashboard/booking/[slug]/route.ts', client: 'components/admin/BookingAppointmentsDashboard.tsx' },
  { name: 'real-estate', route: 'app/api/admin/dashboard/real-estate/[slug]/route.ts', client: 'components/admin/RealEstateDashboardClient.tsx' },
  { name: 'automotive', route: 'app/api/admin/dashboard/automotive/[slug]/route.ts', client: 'components/admin/AutomotiveDashboardClient.tsx' },
  { name: 'healthcare', route: 'app/api/admin/dashboard/healthcare/[slug]/route.ts', client: 'components/admin/HealthcareDashboardClient.tsx' },
  { name: 'media', route: 'app/api/admin/dashboard/media/[slug]/route.ts', client: 'components/admin/MediaDashboardClient.tsx' },
  { name: 'nonprofit', route: 'app/api/admin/dashboard/nonprofit/[slug]/route.ts', client: 'components/admin/NonprofitDashboardClient.tsx' },
  { name: 'portfolio', route: 'app/api/admin/dashboard/portfolio/[slug]/route.ts', client: 'components/admin/PortfolioDashboardClient.tsx' },
  { name: 'restaurant', route: 'app/api/admin/dashboard/restaurent/[slug]/route.ts', client: 'components/admin/RestaurantDashboardClient.tsx' },
  { name: 'finance-legal', route: 'app/api/admin/dashboard/finance-legal/[slug]/route.ts', client: 'components/admin/FinanceDashboardClient.tsx' },
  { name: 'blog', route: 'app/api/admin/dashboard/blog/[slug]/route.ts', client: 'components/admin/BlogDashboardClient.tsx' },
];

comparisons.forEach(c => {
  const returnedKeys = checkRouteReturn(c.route);
  console.log(`\n=== ${c.name} ===`);
  console.log(`Route returns: ${returnedKeys}`);
});
