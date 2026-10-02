/**
 * lib/notifications/deliveryNotificationAdapter.ts
 *
 * Role-aware delivery notifications integrated with SalesmanPro NotificationService.
 * Handles dispatching push, in-app, and SMS/email notifications for stores, riders, and customers.
 */

import { NotificationService } from "./notificationService";
import { NotificationEventContract } from "./types";

export class DeliveryNotificationAdapter {
  /**
   * Notifies nearby riders of a new delivery opportunity.
   */
  public static async notifyRidersNewOffer(opts: {
    riderUserIds: string[];
    pickupAddress: string;
    deliveryFee: number;
    trackingNumber: string;
    deliveryRequestId: string;
  }) {
    const { riderUserIds, pickupAddress, deliveryFee, trackingNumber, deliveryRequestId } = opts;

    for (const userId of riderUserIds) {
      await NotificationService.publishEvent({
        scope: "GHUBA",
        eventType: "NEARBY_DELIVERY_OFFER",
        title: "⚡ New Delivery Opportunity!",
        message: `Delivery available near ${pickupAddress}. Earn KSH ${deliveryFee.toLocaleString()} (Ref: ${trackingNumber})`,
        severity: "INFO",
        recipientPolicy: { type: "SPECIFIC_USERS", userIds: [userId] },
        channels: ["IN_APP", "PUSH"],
        actionUrl: `/ghuba/rider/dashboard?request=${deliveryRequestId}`,
        metadata: { deliveryRequestId, trackingNumber, deliveryFee },
      }).catch((err) => console.error("[NOTIF_ERROR] Failed to notify rider of offer:", err));
    }
  }

  /**
   * Notifies store owner when a rider accepts their delivery request.
   */
  public static async notifyStoreRiderAssigned(opts: {
    companyId: string;
    riderName: string;
    riderPhone: string;
    trackingNumber: string;
    deliveryRequestId: string;
  }) {
    const { companyId, riderName, riderPhone, trackingNumber, deliveryRequestId } = opts;

    await NotificationService.publishEvent({
      scope: "STORE",
      companyId,
      eventType: "RIDER_ASSIGNED",
      title: "🛵 Rider Confirmed for Delivery",
      message: `${riderName} (${riderPhone}) has accepted delivery ${trackingNumber} and is en route to pickup.`,
      severity: "INFO",
      recipientPolicy: { type: "STORE_ADMINS" },
      channels: ["IN_APP", "PUSH"],
      actionUrl: `/admin/deliveries?tracking=${trackingNumber}`,
      metadata: { deliveryRequestId, trackingNumber, riderName, riderPhone },
    }).catch((err) => console.error("[NOTIF_ERROR] Failed to notify store of rider assignment:", err));
  }

  /**
   * Notifies store when a new bid is placed.
   */
  public static async notifyStoreNewBid(opts: {
    companyId: string;
    riderName: string;
    proposedFee: number;
    trackingNumber: string;
    deliveryRequestId: string;
  }) {
    const { companyId, riderName, proposedFee, trackingNumber, deliveryRequestId } = opts;

    await NotificationService.publishEvent({
      scope: "STORE",
      companyId,
      eventType: "RIDER_BID_RECEIVED",
      title: "💰 New Rider Bid Received",
      message: `${riderName} submitted a delivery bid of KSH ${proposedFee.toLocaleString()} for ${trackingNumber}.`,
      severity: "INFO",
      recipientPolicy: { type: "STORE_ADMINS" },
      channels: ["IN_APP"],
      actionUrl: `/admin/deliveries?tracking=${trackingNumber}&tab=bids`,
      metadata: { deliveryRequestId, trackingNumber, proposedFee, riderName },
    }).catch((err) => console.error("[NOTIF_ERROR] Failed to notify store of bid:", err));
  }

  /**
   * Notifies rider when their bid is accepted.
   */
  public static async notifyRiderBidAccepted(opts: {
    riderUserId: string;
    agreedFee: number;
    pickupAddress: string;
    trackingNumber: string;
    deliveryRequestId: string;
  }) {
    const { riderUserId, agreedFee, pickupAddress, trackingNumber, deliveryRequestId } = opts;

    await NotificationService.publishEvent({
      scope: "GHUBA",
      eventType: "BID_ACCEPTED",
      title: "🎉 Your Delivery Bid Was Accepted!",
      message: `Your bid of KSH ${agreedFee.toLocaleString()} for delivery ${trackingNumber} was accepted! Head to ${pickupAddress}.`,
      severity: "INFO",
      recipientPolicy: { type: "SPECIFIC_USERS", userIds: [riderUserId] },
      channels: ["IN_APP", "PUSH"],
      actionUrl: `/ghuba/rider/dashboard?active=${deliveryRequestId}`,
      metadata: { deliveryRequestId, trackingNumber, agreedFee },
    }).catch((err) => console.error("[NOTIF_ERROR] Failed to notify rider of accepted bid:", err));
  }

  /**
   * Notifies store and rider when a delivery is completed.
   */
  public static async notifyDeliveryCompleted(opts: {
    companyId: string;
    riderUserId: string;
    riderName: string;
    trackingNumber: string;
    netEarning: number;
  }) {
    const { companyId, riderUserId, riderName, trackingNumber, netEarning } = opts;

    // Notify store
    await NotificationService.publishEvent({
      scope: "STORE",
      companyId,
      eventType: "DELIVERY_COMPLETED",
      title: "✅ Delivery Successfully Completed",
      message: `Delivery ${trackingNumber} was marked completed by ${riderName}.`,
      severity: "INFO",
      recipientPolicy: { type: "STORE_ADMINS" },
      channels: ["IN_APP"],
      actionUrl: `/admin/deliveries?tracking=${trackingNumber}`,
    }).catch((err) => console.error("[NOTIF_ERROR] Failed to notify store:", err));

    // Notify rider
    await NotificationService.publishEvent({
      scope: "GHUBA",
      eventType: "EARNING_CREDITED",
      title: "💵 Delivery Earnings Credited",
      message: `You earned KSH ${netEarning.toLocaleString()} for completing delivery ${trackingNumber}. Added to your wallet!`,
      severity: "INFO",
      recipientPolicy: { type: "SPECIFIC_USERS", userIds: [riderUserId] },
      channels: ["IN_APP", "PUSH"],
      actionUrl: `/ghuba/rider/dashboard?tab=earnings`,
    }).catch((err) => console.error("[NOTIF_ERROR] Failed to notify rider:", err));
  }
}
