import {
  POST as createServiceOrder,
  OPTIONS as serviceOptions,
} from "@/app/api/shop/serviceOrders/route";

export const POST = createServiceOrder;

export const OPTIONS = serviceOptions;
