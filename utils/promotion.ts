import { IPromotion } from "@/types/typings";

export const createEmptyPromotion = (): IPromotion => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  bannerUrl: null,
  code: "",
  companyId: "",
  ctaText: "",
  ctaLink: "",
  startsAt: null,
  endsAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});
