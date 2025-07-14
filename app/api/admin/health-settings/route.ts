// app/api/admin/[adminSlug]/settings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: {
        id: true,
        name: true,
        address: true,
        contactEmail: true,
        contactPhone: true,
        openingHours: true, // JSON field
        themeSettings: true, // JSON field
        AnalyticsConfig: { select: { isActive: true, googleTag: true, facebookTag: true, hotjarSiteId: true } },
        PaymentSettings: { select: { stripeKey: true, paypalKey: true, mpesaShortcode: true } },
        SocialLink: { select: { channel: true, url: true } },
      }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const settings = {
      clinicName: company.name,
      clinicAddress: company.address,
      clinicEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      openingHours: company.openingHours,
      notificationsEnabled: company.AnalyticsConfig?.isActive || false, // Mocking from AnalyticsConfig.isActive
      themeSettings: company.themeSettings,
      paymentSettings: {
        stripeKey: company.PaymentSettings?.stripeKey,
        paypalKey: company.PaymentSettings?.paypalKey,
        mpesaShortcode: company.PaymentSettings?.mpesaShortcode,
      },
      socialLinks: company.SocialLink,
      // Add other settings as needed from Company or related models
    };

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const {
    clinicName,
    clinicAddress,
    clinicEmail,
    contactPhone,
    openingHours,
    notificationsEnabled,
    themeSettings,
    paymentSettings,
    socialLinks,
  } = body;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true, analyticsConfigId: true, paymentSettingsId: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const companyId = company.id;

    // Update Company main fields
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: clinicName,
        address: clinicAddress,
        contactEmail: clinicEmail,
        contactPhone: contactPhone,
        openingHours: openingHours, // JSON field
        themeSettings: themeSettings, // JSON field
        updatedAt: new Date(),
      },
    });

    // Update AnalyticsConfig (mocking notificationsEnabled here)
    if (company.analyticsConfigId) {
      await prisma.analyticsConfig.update({
        where: { id: company.analyticsConfigId },
        data: { isActive: notificationsEnabled },
      });
    } else if (notificationsEnabled !== undefined) {
        // Create AnalyticsConfig if it doesn't exist and notifications are being set
        await prisma.analyticsConfig.create({
            data: { isActive: notificationsEnabled, Company: { connect: { id: companyId } } }
        });
    }

    // Update PaymentSettings
    if (company.paymentSettingsId && paymentSettings) {
      await prisma.paymentSettings.update({
        where: { id: company.paymentSettingsId },
        data: {
          stripeKey: paymentSettings.stripeKey,
          paypalKey: paymentSettings.paypalKey,
          mpesaShortcode: paymentSettings.mpesaShortcode,
        },
      });
    } else if (paymentSettings) {
        // Create PaymentSettings if it doesn't exist
        await prisma.paymentSettings.create({
            data: {
                stripeKey: paymentSettings.stripeKey,
                paypalKey: paymentSettings.paypalKey,
                mpesaShortcode: paymentSettings.mpesaShortcode,
                Company: { connect: { id: companyId } }
            }
        });
    }

    // Update Social Links (complex: requires deleting and recreating or finding/updating each)
    // For simplicity, this example just demonstrates updating main company fields.
    // A full implementation would iterate over socialLinks array and perform upserts/deletes.
    if (socialLinks) {
        // Delete existing social links for the company
        await prisma.socialLink.deleteMany({
            where: { companyId: companyId }
        });
        // Create new social links
        for (const link of socialLinks) {
            await prisma.socialLink.create({
                data: {
                    companyId: companyId,
                    channel: link.channel, // Ensure link.channel is a valid SocialChannel enum value
                    url: link.url,
                }
            });
        }
    }


    return NextResponse.json(
      { message: "Settings updated successfully", updatedCompany },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}