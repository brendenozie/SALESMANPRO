import React from "react";

interface ProductDetailsProps {
  formData: any;
  setFormData: (val: any) => void;
  categories: any[];
  filteredSubCategories: any[];
  filteredBrands: any[];
  handleInputChange: (e: any) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  formData,
  setFormData,
  filteredSubCategories,
  filteredBrands,
  handleInputChange,
}) => {
  const subCat = formData.subCategory;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const headerLabel = (() => {
    if (formData.category?.name === "Books") return "Book Details";

    if (["Clothing", "Fashion"].includes(formData.category?.name)) return "Clothing Details";

    if (formData.category?.name === "Home Appliances") return "Appliance Details";

    if (["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.name)) return "Beauty Product Details";

    return "Product Details";
  })();

  const primaryLabel = formData.category?.name === "Books" ? "Book Title" : "Product Title";

  // Determine type of subcategory to show special fields
  const isService =
    ["Cleaning", "Plumbing", "Electrical", "Landscaping", "Catering", "Transportation", "IT Services", "Beauty Services", "Tutoring", "Event Planning"].includes(
      subCat
    );
  const isDigital =
    ["Software Licenses", "E-books", "Online Courses", "Streaming Subscriptions", "Mobile App Credits"].includes(
      subCat
    );
  const isTravel =
    ["Flight Tickets", "Hotel Bookings", "Tour Packages", "Event Tickets", "Travel Insurance"].includes(
      subCat
    );
  const isPhysicalGood = !isService && !isDigital && !isTravel;

  return (
    <div className="space-y-4">
      
      <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">

      <h3 className="text-xl font-bold text-gray-800">{headerLabel}</h3>

      <div>        
        <label className="block text-gray-500 text-sm transition-all">
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
          className="peer w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={
            isService
              ? "e.g. House Cleaning"
              : isDigital
              ? "e.g. Photoshop License"
              : isTravel
              ? "e.g. Nairobi to Paris Return Ticket"
              : "e.g. Wireless Headphones"
          }
          value={formData.name || formData.title}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">Description</label>
        <textarea
          name="description"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
          placeholder="Enter a brief description"
          maxLength={500}
          value={formData.description}
          onChange={handleChange}
        />
        <p className="text-sm text-gray-500 mt-1">{formData.description?.length}/500 characters</p>
      </div>

      {formData.category?.name === "Books" && (
        <div className="space-y-4">
          <input type="text" name="author" placeholder="Author" value={formData.author} onChange={handleChange} className="input-field" />
          <input type="text" name="publisher" placeholder="Publisher" value={formData.publisher} onChange={handleChange} className="input-field" />
          <input type="text" name="isbn" placeholder="ISBN" value={formData.isbn} onChange={handleChange} className="input-field" />
        </div>
      )}

      {["Clothing", "Fashion"].includes(formData.category?.name) && (
        <div className="space-y-4">
          <input
            type="text"
            name="fabricComposition"
            placeholder="Fabric Composition (e.g., 100% Cotton)"
            value={formData.fabricComposition}
            onChange={handleChange}
            className="input-field"
          />
          <textarea
            name="careInstructions"
            placeholder="Care Instructions (e.g., Machine wash cold)"
            value={formData.careInstructions}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      )}
      {formData.category?.name === "Home Appliances" && (
        <div className="space-y-4">
          <input
            type="text"
            name="energyRating"
            placeholder="Energy Rating (e.g., A++)"
            value={formData.energyRating}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="warrantyPeriod"
            placeholder="Warranty Period (e.g., 2 years)"
            value={formData.warrantyPeriod}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="dimensions"
            placeholder="Dimensions (LxWxH)"
            value={formData.dimensions}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      )}
      {["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.name) && (
        <div className="space-y-4">
          <input
            type="text"
            name="ingredients"
            placeholder="Ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            className="input-field"
          />
          <textarea
            name="usageInstructions"
            placeholder="Usage Instructions"
            value={formData.usageInstructions}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="date"
            name="expirationDate"
            placeholder="Expiration Date"
            value={formData.expirationDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      )}
      

      {/* Conditional: Service-specific fields */}
      {isService && (
        <>
          <div>
            <label className="block text-sm font-medium">Availability (e.g. Mon–Fri)</label>
            <input
              name="serviceSchedule"
              type="text"
              value={formData.serviceSchedule || ""}
              onChange={(e) => setFormData({ ...formData, serviceSchedule: e.target.value })}
              placeholder="e.g. Mon–Fri, 9am–5pm"
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
        </>
      )}

      {/* Conditional: Digital Good-specific fields */}
      {isDigital && (
        <>
          <div>
            <label className="block text-sm font-medium">Digital Delivery URL</label>
            <input
              name="digitalUrl"
              type="text"
              value={formData.digitalUrl || ""}
              onChange={(e) => setFormData({ ...formData, digitalUrl: e.target.value })}
              placeholder="e.g. https://download.example.com/your-file"
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-center">
            <input
              id="autoDeliver"
              name="autoDeliver"
              type="checkbox"
              checked={formData.autoDeliver || false}
              onChange={(e) => setFormData({ ...formData, autoDeliver: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="autoDeliver" className="ml-2 block text-sm">
              Auto‐deliver upon purchase
            </label>
          </div>
        </>
      )}

      {/* Conditional: Travel-specific fields */}
      {isTravel && (
        <>
          <div>
            <label className="block text-sm font-medium">
              {subCat === "Flight Tickets" ? "Seat Class" : subCat === "Hotel Bookings" ? "Room Type" : "Package Details"}
            </label>
            <input
              name="travelDetail"
              type="text"
              value={formData.travelDetail || ""}
              onChange={(e) => setFormData({ ...formData, travelDetail: e.target.value })}
              placeholder={
                subCat === "Flight Tickets"
                  ? "e.g. Economy"
                  : subCat === "Hotel Bookings"
                  ? "e.g. Deluxe Suite"
                  : "e.g. 5-day Safari Tour"
              }
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
        </>
      )}

      {/* Conditional: Physical goods-specific fields */}
      {isPhysicalGood && (
        <>
          <div>
            <label className="block text-sm font-medium">Model / SKU</label>
            <input
              name="model"
              type="text"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="e.g. HX-200"
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>          
        </>
      )}

      {/* Common: Tags (comma‐separated) */}
      <div>
        <label className="block text-sm font-medium">Tags (comma‐separated)</label>
        <input
          name="tags"
          type="text"
          value={formData.tags.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, tags: e.target.value.split(",").map((t) => t.trim()) })
          }
          placeholder="e.g. new, sale, popular"
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>


    </div>

    </div>
  );
};

export default ProductDetails;
