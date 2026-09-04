import { EmailService } from "@/lib/email/emailService";

export async function sendOrderConfirmationEmail(order: any) {
  if (!order || !order.email) {
    console.warn("[OrderEmail] Cannot send confirmation email: missing recipient email");
    return;
  }

  const isGhuba = Boolean(order.isGhuba || order.marketplaceListingId);
  const tenantType = isGhuba ? "GHUBA" : "STORE";

  return EmailService.sendEmail({
    tenantType,
    companyId: order.companyId,
    template: "ORDER_CONFIRMED",
    recipient: order.email,
    data: {
      orderId: order.id,
      totalAmount: order.totalFinalPrice || order.totalPrice || "0.00",
      currency: order.currency || "KES",
      items: order.orderItems || order.items || [],
    },
    async: true,
  });
}
