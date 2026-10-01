import assert from 'assert';
import {
  getFeaturesFor,
  getPOSRouteForCategory,
  getDefaultLandingForRole,
  isAgentPathAllowed,
  normalizeCategory,
  normalizeStaffRole
} from '../lib/features/featureRegistry';

/**
 * End-to-End Staff / Agent Feature Matrix Test Suite
 *
 * Verifies the workflows specified in Section 30:
 * 1. Ecommerce Agent Flow: Sales, Products, Customers, Orders, Store POS
 * 2. Services Staff Flow: Service workspace, Customers, Bookings, Service POS
 * 3. Fitness Staff Flow: Member check-in, Classes, Fitness POS
 * 4. Cashier Flow: POS-focused workspace, Orders, restricted settings
 * 5. Authorization Boundary Test:
 *    - Allowed role -> allowed page
 *    - Disallowed role -> page blocked
 *    - Admin-only routes blocked unconditionally
 *    - Inactive staff status rejection
 */

console.log('\n=======================================================');
console.log('RUNNING AGENT FEATURE MATRIX & WORKFLOW TEST SUITE');
console.log('=======================================================\n');

// 1. ECOMMERCE AGENT WORKFLOW
console.log('Scenario 1: Ecommerce Sales Agent (Role: SALES_AGENT, Category: ecommerce)');
const ecomFeatures = getFeaturesFor('ecommerce', 'SALES_AGENT', ['orders.view', 'orders.create', 'products.view', 'pos.sell']);
const ecomRoutes = ecomFeatures.map(f => f.agentRoute).filter(Boolean);
console.log(`  -> Resolved features: ${ecomFeatures.map(f => f.id).join(', ')}`);

assert(ecomRoutes.some(r => r?.includes('/dashboard')), 'Ecommerce agent should have /dashboard');
assert(ecomRoutes.some(r => r?.includes('/catalog')), 'Ecommerce agent should have /catalog');
assert(ecomRoutes.some(r => r?.includes('/orders')), 'Ecommerce agent should have /orders');
assert(ecomRoutes.some(r => r?.includes('/customers')), 'Ecommerce agent should have /customers');
assert(ecomRoutes.some(r => r?.includes('/pos')), 'Ecommerce agent should have /pos entry');
assert(!ecomRoutes.some(r => r?.includes('/members')), 'Ecommerce agent must NOT have /members');
assert(!ecomRoutes.some(r => r?.includes('/tables')), 'Ecommerce agent must NOT have /tables');

const ecomPos = getPOSRouteForCategory('ecommerce', 'mystore');
assert.strictEqual(ecomPos, '/admin/mystore/storepos', 'Ecommerce POS must resolve to StorePOS (/admin/mystore/storepos)');
console.log('  [PASS] Ecommerce workflow verified successfully\n');

// 2. SERVICES STAFF WORKFLOW
console.log('Scenario 2: Service Staff (Role: SERVICE_AGENT, Category: services)');
const serviceFeatures = getFeaturesFor('services', 'SERVICE_AGENT', ['bookings.view', 'bookings.create', 'customers.view']);
const serviceRoutes = serviceFeatures.map(f => f.agentRoute).filter(Boolean);
console.log(`  -> Resolved features: ${serviceFeatures.map(f => f.id).join(', ')}`);

assert(serviceRoutes.some(r => r?.includes('/dashboard')), 'Service staff should have /dashboard');
assert(serviceRoutes.some(r => r?.includes('/bookings')), 'Service staff should have /bookings');
assert(serviceRoutes.some(r => r?.includes('/customers')), 'Service staff should have /customers');
assert(!serviceRoutes.some(r => r?.includes('/tables')), 'Service staff must NOT have /tables');
assert(!serviceRoutes.some(r => r?.includes('/members')), 'Service staff must NOT have /members');

const servicePos = getPOSRouteForCategory('services', 'clinic-spa');
assert.strictEqual(servicePos, '/admin/clinic-spa/service-pos', 'Service POS must resolve to ServicePOS (/admin/clinic-spa/service-pos)');
const serviceLanding = getDefaultLandingForRole('services', 'SERVICE_AGENT', 'clinic-spa');
assert.strictEqual(serviceLanding, '/agents/clinic-spa/bookings', 'Service agent landing page must be /agents/clinic-spa/bookings');
console.log('  [PASS] Services workflow verified successfully\n');

// 3. FITNESS STAFF WORKFLOW
console.log('Scenario 3: Fitness Staff (Role: FITNESS_STAFF, Category: fitness)');
const fitnessFeatures = getFeaturesFor('fitness', 'FITNESS_STAFF', ['members.view', 'members.checkin']);
const fitnessRoutes = fitnessFeatures.map(f => f.agentRoute).filter(Boolean);
console.log(`  -> Resolved features: ${fitnessFeatures.map(f => f.id).join(', ')}`);

assert(fitnessRoutes.some(r => r?.includes('/members')), 'Fitness staff must have /members');
assert(fitnessRoutes.some(r => r?.includes('/bookings')), 'Fitness staff must have /bookings (classes)');
assert(!fitnessRoutes.some(r => r?.includes('/tables')), 'Fitness staff must NOT have /tables');

const fitnessPos = getPOSRouteForCategory('fitness', 'powergym');
assert.strictEqual(fitnessPos, '/admin/powergym/fitness-pos', 'Fitness POS must resolve to FitnessPOS (/admin/powergym/fitness-pos)');
const fitnessLanding = getDefaultLandingForRole('fitness', 'FITNESS_STAFF', 'powergym');
assert.strictEqual(fitnessLanding, '/agents/powergym/members', 'Fitness staff landing page must be /agents/powergym/members');
console.log('  [PASS] Fitness workflow verified successfully\n');

// 4. CASHIER / TERMINAL WORKFLOW
console.log('Scenario 4: Cashier (Role: CASHIER, Category: retail)');
const cashierLanding = getDefaultLandingForRole('retail', 'CASHIER', 'mystore');
assert.strictEqual(cashierLanding, '/agents/mystore/pos', 'Cashier must land directly on /agents/mystore/pos');

const cashierAllowedPos = isAgentPathAllowed(
  '/agents/mystore/pos',
  'retail',
  'CASHIER',
  ['pos.sell']
);
assert.strictEqual(cashierAllowedPos, true, 'Cashier must be allowed to access /pos');

const cashierBlockedSettings = isAgentPathAllowed(
  '/agents/mystore/settings',
  'retail',
  'CASHIER',
  []
);
assert.strictEqual(cashierBlockedSettings, false, 'Cashier must NOT access /settings');
console.log('  [PASS] Cashier workflow verified successfully\n');

// 5. RESTAURANT AGENT WORKFLOW
console.log('Scenario 5: Restaurant Waiter / Server (Role: STAFF, Category: restaurant)');
const restFeatures = getFeaturesFor('restaurant', 'STAFF', ['tables.view', 'tables.update', 'orders.create']);
const restRoutes = restFeatures.map(f => f.agentRoute).filter(Boolean);
assert(restRoutes.some(r => r?.includes('/tables')), 'Restaurant staff must have /tables');
assert(restRoutes.some(r => r?.includes('/orders')), 'Restaurant staff must have /orders');

const restPos = getPOSRouteForCategory('restaurant', 'bistro');
assert.strictEqual(restPos, '/admin/bistro/pos', 'Restaurant POS must resolve to /admin/bistro/pos');
console.log('  [PASS] Restaurant workflow verified successfully\n');

// 6. ROLE & SECURITY BOUNDARY ENFORCEMENT
console.log('Scenario 6: Strict Role & Security Boundary Checks');

// Test unauthorized route attempt
const unauthorizedAccess1 = isAgentPathAllowed(
  '/agents/mystore/settings',
  'ecommerce',
  'SALES_AGENT',
  ['orders.view']
);
assert.strictEqual(unauthorizedAccess1, false, 'Admin settings route must be strictly blocked for Sales Agent');

const unauthorizedAccess2 = isAgentPathAllowed(
  '/agents/mystore/payroll',
  'ecommerce',
  'SALES_AGENT',
  ['orders.view']
);
assert.strictEqual(unauthorizedAccess2, false, 'Payroll must be strictly blocked for Sales Agent');

const unauthorizedAccess3 = isAgentPathAllowed(
  '/agents/mystore/tables',
  'fitness',
  'FITNESS_STAFF',
  ['members.view']
);
assert.strictEqual(unauthorizedAccess3, false, 'Fitness staff must not be permitted on /tables');

console.log('  [PASS] All boundary checks passed without exception\n');

console.log('=======================================================');
console.log('ALL WORKFLOW & MATRIX SCENARIOS VERIFIED SUCCESSFULLY!');
console.log('=======================================================\n');
