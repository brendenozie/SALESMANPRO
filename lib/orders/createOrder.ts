import prisma from "@/server/db/prismadb";

export async function createOrder(data: any) {
  const {
    consumerId,
    items,
    totalPrice,
    totalTax,
    totalDiscount,
    totalShipping,
    totalFinalPrice,
    paymentOption,
    shippingAddress,
    billingAddress,
    notes,
  } = data;

  return await prisma.customerOrder.create({
    data: {
      consumerId,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      totalPrice,
      totalTax,
      totalDiscount,
      totalShipping,
      totalFinalPrice,
      paymentOption,
      paymentStatus: "PENDING",
      shippingAddress,
      billingAddress,
      notes,
      status: "PENDING",
      orderSource: "WEBSITE",
    },
    include: { items: true },
  });
}
