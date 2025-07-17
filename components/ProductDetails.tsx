import React from "react";

interface ProductDetailsProps {
  formData: any;
  setFormData: (name: string, value: any) => void;
  filteredSubCategories: string[];
  filteredBrands: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  formData,
  setFormData,
  filteredSubCategories,
  filteredBrands,
  handleInputChange,
}) => {
  const subCat: any = formData.subCategory || {};
  const subCategoryName: string = formData.subCategoryName || "";

  const isService = [
    "Cleaning", "Plumbing", "Electrical", "Landscaping", "Catering", "Transportation",
    "IT Services", "Beauty Services", "Tutoring", "Event Planning", "Landscaping"
  ].includes(subCategoryName || subCat.name);

  const isDigital = [
    "Software Licenses", "E-books", "Online Courses", "Streaming Subscriptions", "Mobile App Credits"
  ].includes(subCategoryName || subCat.name);

  const isTravel = [
    "Flight Tickets", "Hotel Bookings", "Tour Packages", "Event Tickets", "Travel Insurance"
  ].includes(subCategoryName || subCat.name);

  const isPhysical = !isService && !isDigital && !isTravel;

  const headerLabel = (() => {
    const cat = formData.category?.name || "";
    if (cat === "Books") return "Book Details";
    if (["Clothing", "Fashion"].includes(cat)) return "Clothing Details";
    if (cat === "Home Appliances") return "Appliance Details";
    if (["Beauty Products", "Skincare", "Haircare"].includes(cat)) return "Beauty Product Details";
    return "Product Details";
  })();

  const primaryLabel = formData.category?.name === "Books" ? "Book Title" : "Product Title";

  const inputClasses =
    "mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">{headerLabel}</h2>

      <section className="space-y-2">
        <label className="block text-gray-600 font-medium">
          {isService ? "Service Title" : isDigital ? "Product Title" : isTravel ? "Experience Title" : primaryLabel}
        </label>
        <input
          type="text"
          name="name"
          placeholder={
            isService
              ? "e.g. House Cleaning"
              : isDigital
              ? "e.g. Photoshop License"
              : isTravel
              ? "e.g. Nairobi to Paris Return Ticket"
              : "e.g. Wireless Headphones"
          }
          className={inputClasses}
          value={formData.name || ""}
          onChange={handleInputChange}
        />
      </section>

      <section className="space-y-2">
        <label className="block text-gray-600 font-medium">Description</label>
        <textarea
          name="description"
          placeholder="Enter a brief description (max 500 characters)"
          maxLength={500}
          className={`${inputClasses} h-28 resize-none`}
          value={formData.description || ""}
          onChange={handleInputChange}
        />
        <p className="text-sm text-gray-500">{(formData.description || "").length}/500 characters</p>
      </section>

      {formData.category?.name === "Books" && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Book Metadata</h3>
          <div className="space-y-3">
            {["author", "publisher", "isbn"].map((field) => (
              <div className="space-y-1" key={field}>
                <label className="block text-gray-600 text-sm capitalize">{field}</label>
                <input
                  type="text"
                  name={field}
                  placeholder={`Enter ${field}`}
                  className={inputClasses}
                  value={formData[field] || ""}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {["Clothing", "Fashion"].includes(formData.category?.name) && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Clothing Details</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Fabric Composition</label>
              <input
                type="text"
                name="fabricComposition"
                className={inputClasses}
                value={formData.fabricComposition || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Care Instructions</label>
              <textarea
                name="careInstructions"
                className={`${inputClasses} h-20 resize-none`}
                value={formData.careInstructions || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </section>
      )}

      {formData.category?.name === "Home Appliances" && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Appliance Details</h3>
          {["energyRating", "warrantyPeriod", "dimensions"].map((field) => (
            <div className="space-y-1" key={field}>
              <label className="block text-gray-600 text-sm capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
              <input
                type="text"
                name={field}
                className={inputClasses}
                value={formData[field] || ""}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </section>
      )}

      {["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.name) && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Beauty Product Details</h3>
          {["ingredients", "usageInstructions"].map((field) => (
            <div className="space-y-1" key={field}>
              <label className="block text-gray-600 text-sm capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
              <textarea
                name={field}
                className={`${inputClasses} h-20 resize-none`}
                value={formData[field] || ""}
                onChange={handleInputChange}
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="block text-gray-600 text-sm">Expiration Date</label>
            <input
              type="date"
              name="expirationDate"
              className={inputClasses}
              value={formData.expirationDate || ""}
              onChange={handleInputChange}
            />
          </div>
        </section>
      )}

      {isDigital && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Digital Product Details</h3>
          <div className="flex items-center space-x-2">
            <input
              id="autoDeliver"
              name="autoDeliver"
              type="checkbox"
              checked={formData.autoDeliver || false}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="autoDeliver" className="text-gray-600 text-sm">
              Auto‐deliver upon purchase
            </label>
          </div>
        </section>
      )}

      {isTravel && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Travel Details</h3>
          <div className="space-y-1">
            <label className="block text-gray-600 text-sm">
              {subCat === "Flight Tickets"
                ? "Seat Class"
                : subCat === "Hotel Bookings"
                ? "Room Type"
                : "Package Details"}
            </label>
            <input
              type="text"
              name="travelDetail"
              className={inputClasses}
              value={formData.travelDetail || ""}
              onChange={handleInputChange}
            />
          </div>
        </section>
      )}

      {isPhysical && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Product Specifications</h3>
          <div className="space-y-1">
            <label className="block text-gray-600 text-sm">Model / SKU</label>
            <input
              type="text"
              name="model"
              className={inputClasses}
              value={formData.model || ""}
              onChange={handleInputChange}
            />
          </div>
        </section>
      )}

      <section className="space-y-2">
        <label className="block text-gray-600 font-medium">Tags (comma‐separated)</label>
        <input
          type="text"
          name="tags"
          placeholder="e.g. new, sale, popular"
          className={inputClasses}
          value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
          onChange={(e) => {
            const tags = e.target.value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            setFormData("tags", tags);
          }}
        />
      </section>
    </div>
  );
};

export default ProductDetails;
