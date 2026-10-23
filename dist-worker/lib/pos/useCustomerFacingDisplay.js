"use strict";
/**
 * Customer-Facing Display (CFD) Synchronization Client
 *
 * Uses the browser BroadcastChannel API to mirror POS cart, checkout,
 * and payment status in real-time to a secondary customer-facing monitor.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.openCustomerFacingDisplay = exports.broadcastToCFD = void 0;
const CFD_CHANNEL_NAME = 'salesmanpro_pos_cfd_channel';
/**
 * Broadcasts an update from the cashier terminal to the customer-facing screen.
 */
function broadcastToCFD(payload) {
    if (typeof window === 'undefined')
        return;
    try {
        const channel = new BroadcastChannel(CFD_CHANNEL_NAME);
        channel.postMessage(payload);
        channel.close();
    }
    catch (err) {
        console.warn('[CFD Broadcaster] BroadcastChannel error:', err);
    }
}
exports.broadcastToCFD = broadcastToCFD;
/**
 * Opens the CFD window on the secondary display or pops up a new tab/window.
 */
function openCustomerFacingDisplay() {
    if (typeof window === 'undefined')
        return null;
    const url = '/pos/cfd';
    const features = 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no';
    const win = window.open(url, 'SalesmanPro_CFD_Window', features);
    if (win) {
        win.focus();
    }
    return win;
}
exports.openCustomerFacingDisplay = openCustomerFacingDisplay;
