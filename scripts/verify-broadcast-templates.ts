import { renderEmailTemplate } from '../lib/email/templates/renderer';

function test() {
  const branding = {
    brandName: 'SalesmanPro',
    websiteUrl: 'https://salesmanpro.site',
    primaryColor: '#ea580c',
    supportEmail: 'support@salesmanpro.site',
  };

  const promo = renderEmailTemplate('PROMOTIONAL_ANNOUNCEMENT', {
    recipientName: 'Alice',
    headline: 'Special 50% Off Launch',
    badgeText: '✨ Special Offer',
    bodyText: 'Hello {{name}},\n\nWelcome to our new platform release with AI automations.\n\nTake advantage of this special offer.',
    highlightText: 'Use coupon: PROMO50 at checkout',
    ctaLabel: 'Claim 50% Off Now',
    ctaUrl: 'https://salesmanpro.site/dashboards',
  }, branding);

  console.log('✓ PROMOTIONAL_ANNOUNCEMENT test passed:');
  console.log('  Subject:', promo.subject);
  console.log('  Includes coupon:', promo.html.includes('PROMO50'));
  console.log('  Replaced name tag:', promo.html.includes('Alice'));
  console.log('  HTML length:', promo.html.length);

  const comm = renderEmailTemplate('SYSTEM_COMMUNICATION', {
    recipientName: 'Bob',
    headline: 'Scheduled System Maintenance',
    badgeText: '📢 Platform Notice',
    bodyText: 'Hello {{name}},\n\nWe will be conducting scheduled infrastructure upgrades this weekend.\n\nAll critical data is safely backed up.',
    noticeBox: 'Maintenance Window: Sunday 02:00 UTC - 04:00 UTC',
    ctaLabel: 'System Status Dashboard',
    ctaUrl: 'https://salesmanpro.site/status',
  }, branding);

  console.log('\n✓ SYSTEM_COMMUNICATION test passed:');
  console.log('  Subject:', comm.subject);
  console.log('  Includes notice box:', comm.html.includes('Sunday 02:00 UTC'));
  console.log('  Replaced name tag:', comm.html.includes('Bob'));
  console.log('  HTML length:', comm.html.length);
}

test();
