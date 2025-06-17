import React from "react";

interface ProductDetailsProps {
  formData: any;
  setFormData: (val: any) => void;
  filteredSubCategories: string[]; // array of subcategory names
  filteredBrands: string[];        // array of brand names
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  formData,
  setFormData,
  filteredSubCategories,
  filteredBrands,
  handleInputChange,
}) => {
  // Derive which “mode” we’re in, based on subCategory name
  const subCat: any = formData.subCategory || {};
  const subCategoryName: string = formData.subCategoryName || "";

  const isService = [
    "Cleaning",
    "Plumbing",
    "Electrical",
    "Landscaping",
    "Catering",
    "Transportation",
    "IT Services",
    "Beauty Services",
    "Tutoring",
    "Event Planning",
    "Landscaping"
  ].includes(subCategoryName || subCat.name);

  const isDigital = [
    "Software Licenses",
    "E-books",
    "Online Courses",
    "Streaming Subscriptions",
    "Mobile App Credits",
  ].includes(subCategoryName || subCat.name);

  const isTravel = [
    "Flight Tickets",
    "Hotel Bookings",
    "Tour Packages",
    "Event Tickets",
    "Travel Insurance",
  ].includes(subCategoryName || subCat.name);

  // const isPhysical = !isService || !isDigital || !isTravel;
  const isPhysical = !isService && !isDigital && !isTravel;

  // Determine the header label based on category name
  const headerLabel = (() => {
    const cat = formData.category?.name || "";
    if (cat === "Books") return "Book Details";
    if (["Clothing", "Fashion"].includes(cat)) return "Clothing Details";
    if (cat === "Home Appliances") return "Appliance Details";
    if (["Beauty Products", "Skincare", "Haircare"].includes(cat))
      return "Beauty Product Details";
    return "Product Details";
  })();

  // The primary “title” field label changes for Books vs. others
  const primaryLabel =
    formData.category?.name === "Books" ? "Book Title" : "Product Title";

  // A single onChange handler for inputs and textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // If the target is a checkbox, we’d cast e.target.checked instead of value
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // A consistent set of Tailwind classes for all inputs
  const inputClasses =
    "mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* ── Header ── */}
      <h2 className="text-2xl font-bold text-gray-800">{headerLabel}</h2>

      {/* ── 1. Primary Title / Name ── */}
      <section className="space-y-2">
        <label className="block text-gray-600 font-medium">
          {isService
            ? "Service Title"
            : isDigital
            ? "Product Title"
            : isTravel
            ? "Experience Title"
            : primaryLabel}
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
          value={formData.name || formData.title || ""}
          onChange={handleChange}
        />
      </section>

      {/* ── 2. Description ── */}
      <section className="space-y-2">
        <label className="block text-gray-600 font-medium">Description</label>
        <textarea
          name="description"
          placeholder="Enter a brief description (max 500 characters)"
          maxLength={500}
          className={`${inputClasses} h-28 resize-none`}
          value={formData.description || ""}
          onChange={handleChange}
        />
        <p className="text-sm text-gray-500">
          {(formData.description || "").length}/500 characters
        </p>
      </section>

      {/* ── 3. Category-Specific Subfields ── */}

      {/* ─── Books ─── */}
      {formData.category?.name === "Books" && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Book Metadata</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Author</label>
              <input
                type="text"
                name="author"
                placeholder="e.g. Chimamanda Ngozi Adichie"
                className={inputClasses}
                value={formData.author || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Publisher</label>
              <input
                type="text"
                name="publisher"
                placeholder="e.g. Penguin Random House"
                className={inputClasses}
                value={formData.publisher || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">ISBN</label>
              <input
                type="text"
                name="isbn"
                placeholder="e.g. 978-0143126560"
                className={inputClasses}
                value={formData.isbn || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── Clothing / Fashion ─── */}
      {["Clothing", "Fashion"].includes(formData.category?.name) && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Clothing Details</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">
                Fabric Composition
              </label>
              <input
                type="text"
                name="fabricComposition"
                placeholder="e.g. 100% Cotton"
                className={inputClasses}
                value={formData.fabricComposition || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Care Instructions</label>
              <textarea
                name="careInstructions"
                placeholder="e.g. Machine wash cold"
                className={`${inputClasses} h-20 resize-none`}
                value={formData.careInstructions || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── Home Appliances ─── */}
      {formData.category?.name === "Home Appliances" && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Appliance Details</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Energy Rating</label>
              <input
                type="text"
                name="energyRating"
                placeholder="e.g. A++"
                className={inputClasses}
                value={formData.energyRating || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Warranty Period</label>
              <input
                type="text"
                name="warrantyPeriod"
                placeholder="e.g. 2 years"
                className={inputClasses}
                value={formData.warrantyPeriod || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Dimensions (L×W×H)</label>
              <input
                type="text"
                name="dimensions"
                placeholder="e.g. 30×20×15 cm"
                className={inputClasses}
                value={formData.dimensions || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── Beauty / Skincare / Haircare ─── */}
      {["Beauty Products", "Skincare", "Haircare"].includes(
        formData.category?.name
      ) && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Beauty Product Details</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Ingredients</label>
              <input
                type="text"
                name="ingredients"
                placeholder="e.g. Aqua, Glycerin, Vitamin E"
                className={inputClasses}
                value={formData.ingredients || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Usage Instructions</label>
              <textarea
                name="usageInstructions"
                placeholder="e.g. Apply twice daily"
                className={`${inputClasses} h-20 resize-none`}
                value={formData.usageInstructions || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Expiration Date</label>
              <input
                type="date"
                name="expirationDate"
                className={inputClasses}
                value={formData.expirationDate || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Service-Specific Fields ── */}
      {/* {isService && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Service Details</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">
                Availability (e.g. Mon–Fri, 9am–5pm)
              </label>
              <input
                type="text"
                name="serviceSchedule"
                placeholder="e.g. Mon–Fri, 9am–5pm"
                className={inputClasses}
                value={formData.serviceSchedule || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>
      )} */}

      {/* ── 5. Digital Good–Specific Fields ── */}
      {isDigital && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Digital Product Details</h3>
          <div className="space-y-3">
            {/* <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Delivery URL</label>
              <input
                type="url"
                name="digitalUrl"
                placeholder="e.g. https://download.example.com/your-file"
                className={inputClasses}
                value={formData.digitalUrl || ""}
                onChange={handleChange}
              />
            </div> */}
            <div className="flex items-center space-x-2">
              <input
                id="autoDeliver"
                name="autoDeliver"
                type="checkbox"
                checked={formData.autoDeliver || false}
                onChange={(e) =>
                  setFormData({ ...formData, autoDeliver: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="autoDeliver" className="text-gray-600 text-sm">
                Auto‐deliver upon purchase
              </label>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Travel-Specific Fields ── */}
      {isTravel && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Travel Details</h3>
          <div className="space-y-3">
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
                placeholder={
                  subCat === "Flight Tickets"
                    ? "e.g. Economy"
                    : subCat === "Hotel Bookings"
                    ? "e.g. Deluxe Suite"
                    : "e.g. 5-day Safari Tour"
                }
                className={inputClasses}
                value={formData.travelDetail || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Physical Goods Fields ── */}
      {isPhysical && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Product Specifications</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Model / SKU</label>
              <input
                type="text"
                name="model"
                placeholder="e.g. HX-200"
                className={inputClasses}
                value={formData.model || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Tags (Common Field) ── */}
      <section className="space-y-2">
        <label className="block text-gray-600 font-medium">Tags (comma‐separated)</label>
        <input
          type="text"
          name="tags"
          placeholder="e.g. new, sale, popular"
          className={inputClasses}
          value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              tags: e.target.value
                .split(",")
                .map((t: string) => t.trim())
                .filter((t: string) => t.length),
            })
          }
        />
      </section>
    </div>
  );
};

export default ProductDetails;
