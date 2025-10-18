import { NextResponse } from "next/server";

// Establish connection with Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_SIGNING_SECRET;
// API Request to Post Hotel Booking to DB
const fulfillBooking = async (session: any) => {
  console.log("FULFILLING ORDER:", session);
  try {
    const body = {
      userEmail: session.metadata.email,
      sessionId: session.id,
      amountTotal: session.amount_total / 100,
      images: JSON.parse(session.metadata.images),
      hotelId: session.metadata.hotelId,
      description: session.metadata.description,
      img: session.metadata.img,
      location: session.metadata.location,
      lat: session.metadata.lat,
      long: session.metadata.long,
      price: session.metadata.price,
      star: session.metadata.star,
      title: session.metadata.title,
      total: session.metadata.total,
      cityId: session.metadata.cityId,
      startDate: session.metadata.startDate,
      endDate: session.metadata.endDate,
    };
    await fetch(`${process.env.NEXTAUTH_URL}/api/post-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log(`SUCCESS: Booking ${session.id} has been added to the DB`);
  } catch (error) {
    console.error(error);
  }
};

export default async (req: Request) => {
export default async (req: Request) => {
  // Connect Webhooks to be notified of Stripe Activity
  // more info: https://stripe.com/docs/connect/webhooks
  if (req.method === "POST") {
    // Read raw body from the Request (web-standard API) and convert to Buffer
    const buf = Buffer.from(await req.arrayBuffer());
    const payload = buf.toString();
    const sig = req.headers.get("stripe-signature");
    let event;
    // Verify the Event posted came from Stripe
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
      console.log("ERROR", err.message);
      return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
    }
    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // Fulfill Hotel Booking
      try {
        await fulfillBooking(session);
        return NextResponse.json({ received: true }, { status: 200 });
      } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 500 });
      }
    }
    return NextResponse.json({ received: true }, { status: 200 });
  }
  return NextResponse.next();
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
