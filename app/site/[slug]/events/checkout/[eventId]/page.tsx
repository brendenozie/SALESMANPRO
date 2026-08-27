import { loadStore } from '@/lib/loadStore';
import { getEnabledPaymentMethods } from '@/utils/payment-utils';
import EventCheckoutClient from './EventCheckoutClient';
import prisma from '@/server/db/prismadb';

interface PageProps {
  params: { slug: string; eventId: string };
}

export default async function EventCheckoutPage({ params }: PageProps) {
  const { slug, eventId } = params;

  const { raw } = await loadStore(slug);
  const paymentMethods = getEnabledPaymentMethods(raw.PaymentSettings);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      tickets: {
        where: {
          isActive: true,
          isVisible: true,
        },
      },
    },
  });

  if (!event ) {//|| event.eventStatus !== 'SCHEDULED'
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">Event not found or not available for purchase.</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <EventCheckoutClient
        event={event as any}
        tickets={event.tickets as any}
        paymentMethods={paymentMethods}
      />
    </main>
  );
}