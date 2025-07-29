import ProductDetails from "../components/ProductDetails";
import GeneralDetails from "../components/GeneralDetails";
import EnginePerformance from "../components/EnginePerformance";
import OwnershipPricing from "../components/OwnershipPricing";
import PricingDetails from "../components/PricingDetails";
import ImageUploader from "../components/ImageUploader";
import ProductVariants from "../components/ProductVariants";
import ProductAvailability from "../components/ProductAvailability";
import FinalReview from "../components/FinalReview";
import ContactLocation from "../components/ContactLocation";
import AmenitiesStep from "../components/AmenitiesStep";
import VehicleAmenitiesStep from "../components/VehicleAmenitiesStep";
import { BookingSlot } from "../components/stores/create/BookingSlot/BookingSlot";
import ProductPricingAndTiers  from "../components/stores/create/PricingTiers/PricingTiers";
import { ServiceSpecifics } from "../components/stores/create/ServiceSpecifics/ServiceSpecifics";
import CategoryPicker from "../components/CategoryPicker";
import LocationPicker from "@/components/LocationPicker";


// ..//
// -------------------
// MAPPINGS
// -------------------

export const FORM_COMPONENTS: Record<number, React.FC<any>> = {
  1: CategoryPicker,
  2: ProductDetails,
  3: GeneralDetails,
  4: EnginePerformance,
  5: OwnershipPricing,
  7: PricingDetails,
  8: ImageUploader,
  9: ProductVariants,
  10: ProductAvailability,
  11: FinalReview,
  12: ContactLocation,
  13: AmenitiesStep,
  14: VehicleAmenitiesStep,
  15: ProductPricingAndTiers,
  16: ServiceSpecifics,
  17: BookingSlot,
  // 18: LocationPicker
};


