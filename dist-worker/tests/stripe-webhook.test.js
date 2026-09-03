// import { describe, it, expect, vi } from "vitest";
// import request from "supertest";
// import app from "@/test-server";
// import Stripe from "stripe";
// vi.mock("stripe");
// describe("Stripe Webhook", () => {
//   it("rejects invalid signature", async () => {
//     const res = await request(app)
//       .post("/api/webhooks/stripe")
//       .set("stripe-signature", "invalid")
//       .send("{}");
//     expect(res.status).toBe(400);
//   });
//   it("handles payment_intent.succeeded", async () => {
//     const mockConstruct = vi.fn().mockReturnValue({
//       type: "payment_intent.succeeded",
//       data: { object: { id: "pi_123" } }
//     });
//     Stripe.prototype.webhooks = { constructEvent: mockConstruct };
//     const res = await request(app)
//       .post("/api/webhooks/stripe")
//       .set("stripe-signature", "valid")
//       .send(JSON.stringify({}));
//     expect(res.status).toBe(200);
//   });
// });
