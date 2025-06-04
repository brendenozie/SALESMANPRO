import React from "react";
import { motion } from "framer-motion";
import {
  TagIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

const SectionCard: React.FC<{
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
  >
    <div className="flex items-center mb-4">
      <Icon className="w-6 h-6 text-blue-500 mr-2" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-2 text-gray-700">{children}</div>
  </motion.div>
);

const KeyValue: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between">
    <span className="font-medium">{label}:</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

const FinalReview = ({ formData }: any) => {
  // Helper to format N/A if missing or empty
  const displayValue = (val: any) =>
    val !== undefined && val !== "" ? val : "N/A";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl font-bold text-gray-800">Final Review</h2>
          <p className="text-gray-600">
            Double-check all details before submitting your listing.
          </p>
        </motion.div>

        {/* Grid of Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <SectionCard icon={TagIcon} title="Basic Information">
            <KeyValue label="Title" value={displayValue(formData.name || formData.title)} />
            <KeyValue label="Description" value={displayValue(formData.description)} />
            <KeyValue
              label="Category"
              value={displayValue(formData.category?.name)}
            />
            <KeyValue label="Status" value={displayValue(formData.status)} />
            <KeyValue label="Option" value={displayValue(formData.option)} />
          </SectionCard>

          {/* Studios & Bedrooms */}
          {(formData.studios?.length > 0 || formData.bedrooms?.length > 0) && (
            <SectionCard icon={HomeIcon} title="Unit Types">
              {formData.studios?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Studios</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-800">
                    {formData.studios.map((unit: any, idx: number) => (
                      <li key={idx}>
                        {unit.type} - {unit.size} sq m - Ksh {unit.price}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.bedrooms?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Bedrooms</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-800">
                    {formData.bedrooms.map((unit: any, idx: number) => (
                      <li key={idx}>
                        {unit.type} - {unit.size} sq m - Ksh {unit.price}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </SectionCard>
          )}

          {/* Amenities */}
          {formData.amenities?.length > 0 && (
            <SectionCard icon={SparklesIcon} title="Amenities">
              <ul className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity: string, idx: number) => (
                  <li
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {amenity}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {/* Pricing Information */}
          <SectionCard icon={CurrencyDollarIcon} title="Pricing Information">
            <KeyValue
              label="Cost Price"
              value={displayValue(formData.costPrice || formData.buyingPrice)}
            />
            <KeyValue
              label="Selling Price"
              value={displayValue(
                formData.salesPrice || formData.sellingPrice || formData.buyingPrice
              )}
            />
            <KeyValue label="Discount (%)" value={displayValue(formData.discount)} />
            <KeyValue label="Final Price" value={displayValue(formData.finalPrice)} />
            <KeyValue
              label="Profit Margin (%)"
              value={displayValue(formData.profitMargin)}
            />
          </SectionCard>

          {/* Availability & Features */}
          <SectionCard icon={CheckCircleIcon} title="Availability & Features">
            <KeyValue
              label="Availability"
              value={formData.isAvailable ? "In Stock" : "Out of Stock"}
            />
            <KeyValue
              label="Featured"
              value={formData.isFeatured ? "Yes" : "No"}
            />
            <KeyValue
              label="New Arrival"
              value={formData.isNewArrival ? "Yes" : "No"}
            />
            <KeyValue
              label="On Offer"
              value={formData.isOnOffer ? "Yes" : "No"}
            />
            <KeyValue
              label="On Discount"
              value={formData.isDiscounted ? "Yes" : "No"}
            />
            <KeyValue
              label="Flash Deal"
              value={formData.isFlashDeal ? "Yes" : "No"}
            />
          </SectionCard>

          {/* Category-Specific Details */}
          {formData.category?.name === "Books" && (
            <SectionCard icon={BookOpenIcon} title="Book Details">
              <KeyValue label="Author" value={displayValue(formData.author)} />
              <KeyValue label="Publisher" value={displayValue(formData.publisher)} />
              <KeyValue label="ISBN" value={displayValue(formData.isbn)} />
            </SectionCard>
          )}

          {["Clothing", "Fashion"].includes(formData.category?.name) && (
            <SectionCard icon={ShoppingBagIcon} title="Clothing Details">
              <KeyValue
                label="Fabric Composition"
                value={displayValue(formData.fabricComposition)}
              />
              <KeyValue
                label="Care Instructions"
                value={displayValue(formData.careInstructions)}
              />
            </SectionCard>
          )}

          {formData.category?.name === "Home Appliances" && (
            <SectionCard icon={WrenchScrewdriverIcon} title="Appliance Details">
              <KeyValue
                label="Energy Rating"
                value={displayValue(formData.energyRating)}
              />
              <KeyValue
                label="Warranty Period"
                value={displayValue(formData.warrantyPeriod)}
              />
              <KeyValue label="Dimensions" value={displayValue(formData.dimensions)} />
            </SectionCard>
          )}

          {["Beauty Products", "Skincare", "Haircare"].includes(
            formData.category?.name
          ) && (
            <SectionCard icon={SparklesIcon} title="Beauty Product Details">
              <KeyValue
                label="Ingredients"
                value={displayValue(formData.ingredients)}
              />
              <KeyValue
                label="Usage Instructions"
                value={displayValue(formData.usageInstructions)}
              />
              <KeyValue
                label="Expiration Date"
                value={displayValue(formData.expirationDate)}
              />
            </SectionCard>
          )}

          {["Automotive", "Cars", "Car Accessories", "Tools", "Hardware"].includes(
            formData.category?.name
          ) && (
            <SectionCard icon={WrenchScrewdriverIcon} title="Vehicle Details">
              <KeyValue label="Make" value={displayValue(formData.make)} />
              <KeyValue label="Model" value={displayValue(formData.model)} />
              <KeyValue label="Year" value={displayValue(formData.year)} />
              <KeyValue label="Trim" value={displayValue(formData.trim)} />
              <KeyValue label="Type" value={displayValue(formData.type)} />
              <KeyValue
                label="Mileage"
                value={displayValue(formData.mileage)}
              />
              <KeyValue
                label="Condition"
                value={displayValue(formData.condition)}
              />
            </SectionCard>
          )}

          {/* Contact & Location */}
          <SectionCard icon={MapPinIcon} title="Contact & Location">
            <KeyValue label="Location" value={displayValue(formData.location)} />
            <KeyValue
              label="Contact Number"
              value={displayValue(formData.contact)}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default FinalReview;
