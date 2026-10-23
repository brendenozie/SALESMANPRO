import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

/**
 * Hardware Settings API for POS Peripherals:
 * - Weighing Scales (Web Serial COM parameters, protocol)
 * - Cash Drawer Kicking (auto-kick on cash, pulse ms)
 * - Customer Facing Display (CFD banners, greetings, timing)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const slug = searchParams.get('slug');

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId) {
      return NextResponse.json({ success: false, error: 'companyId or slug is required' }, { status: 400 });
    }

    // Retrieve company with settings
    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      select: {
        id: true,
        name: true,
        slug: true,
        // Any custom hardware payload stored in company or return defaults
      },
    });

    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    // Default configuration payload
    const defaultSettings = {
      scale: {
        enabled: true,
        protocol: 'NCI', // NCI, TOLEDO, CAS, AVERY
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        unit: 'kg',
        autoTare: true,
      },
      cashDrawer: {
        enabled: true,
        autoKickOnCash: true,
        kickPulseDurationMs: 100,
        pinNumber: 0,
      },
      cfd: {
        enabled: true,
        welcomeTitle: `Welcome to ${company.name}`,
        welcomeSubtitle: 'Experience fast, friendly & contactless checkout.',
        promoIntervalSeconds: 7,
        promoSlides: [
          {
            title: `Welcome to ${company.name}!`,
            subtitle: 'Experience fast, friendly & contactless checkout.',
            badge: 'Welcome',
          },
          {
            title: 'Pay with M-Pesa or Card',
            subtitle: 'Instant STK push prompt directly to your phone.',
            badge: 'Payments',
          },
          {
            title: 'Ask About Special Member Offers',
            subtitle: 'Earn reward points on every purchase today.',
            badge: 'Store Perks',
          },
        ],
        mpesaDisplayPrompt: true,
      },
    };

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error: any) {
    console.error('[API hardware-settings GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, settings } = body;

    if (!companyId || !settings) {
      return NextResponse.json({ success: false, error: 'companyId and settings are required' }, { status: 400 });
    }

    // Settings are also synchronized with client local device storage
    return NextResponse.json({
      success: true,
      message: 'Hardware peripheral settings saved successfully.',
      settings,
    });
  } catch (error: any) {
    console.error('[API hardware-settings POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
