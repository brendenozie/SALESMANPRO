import React, { useState, useEffect, useMemo, useRef } from "react";
import Modal from "../components/Modal";
import { useDropzone, Accept } from "react-dropzone";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import {
  ArrowUpCircleIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CheckCircleIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import {
  ArrowUpOnSquareIcon,
  ArrowUpTrayIcon,
  CameraIcon,
  ListBulletIcon,
  PhoneIcon
} from "@heroicons/react/24/solid";

// -------------------
// STEP PER COMPONENT
// -------------------

interface StepperProps {
  step: number;
  stepsForCategory: number[];
  onStepClick?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ step, stepsForCategory, onStepClick }) => {
  const labels = stepsForCategory.map((num) => STEP_LABELS[num]);
  const stepCount = labels.length;
  const progressWidth = `${((step - 1) / (stepCount - 1)) * 100}%`;

  const scrollRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (stepRefs.current[step - 1] && scrollRef.current) {
      stepRefs.current[step - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [step]);

  return (
    <div className="relative w-full px-4 pt-4">
      <div
        ref={scrollRef}
        className="flex items-center justify-between overflow-x-auto no-scrollbar space-x-6 pb-4 snap-x snap-mandatory"
      >
        {labels.map((label, index) => {
          const isActive = index + 1 === step;
          const isCompleted = index + 1 < step;
          return (
            <div
              key={index}
              ref={(el) => (stepRefs.current[index] = el)}
              className="flex flex-col items-center min-w-[70px] cursor-pointer snap-center"
              onClick={() => isCompleted && onStepClick?.(index + 1)}
            >
              <motion.div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold shadow-md border-2 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 scale-110 shadow-lg"
                    : isCompleted
                    ? "bg-blue-400 text-white border-blue-400"
                    : "bg-gray-300 text-gray-500 border-gray-300"
                }`}
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {isCompleted ? (
                  <CheckCircleIcon className="w-5 h-5 animate-pulse" />
                ) : (
                  index + 1
                )}
              </motion.div>
              <p
                className={`mt-2 text-xs font-medium truncate w-16 text-center ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : isCompleted
                    ? "text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {label}
              </p>
              <div className={`w-2 h-2 rounded-full mt-2 ${isActive ? "bg-blue-600" : "bg-gray-300"}`} />
            </div>
          );
        })}
      </div>
      <div className="relative w-full h-[2px] bg-gray-300 rounded-full">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
          animate={{ width: progressWidth }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

const CategoryPicker = ({
  formData,
  handleInputChange,
  categories,
  filteredSubCategories,
  filteredBrands
}: any) => {
  const [selectedCategory, setSelectedCategory] = useState(formData.category || null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(formData.subcategory || null);
  const [selectedBrand, setSelectedBrand] = useState(formData.brand || null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedSubcategory(null);
      setSelectedBrand(null);
    }
  }, [selectedCategory]);

  const handleSelection = (field: string, value: any) => {
    handleInputChange({ target: { name: field, value } });
    if (field === "category") {
      setSelectedCategory(value);
      setSelectedSubcategory(null);
      setSelectedBrand(null);
    }
    if (field === "subcategory") setSelectedSubcategory(value);
    if (field === "brand") setSelectedBrand(value);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 space-y-6">
      {(selectedCategory || selectedSubcategory || selectedBrand) && (
        <div className="flex flex-wrap items-center space-x-3 p-3 bg-gray-100 rounded-lg text-sm">
          {selectedCategory && selectedCategory.name && (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-md flex items-center space-x-2">
              <span>{selectedCategory.name}</span>
              <button onClick={() => setSelectedCategory(null)}>❌</button>
            </span>
          )}
          {selectedSubcategory && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center space-x-2">
              <span>{selectedSubcategory}</span>
              <button onClick={() => setSelectedSubcategory(null)}>❌</button>
            </span>
          )}
          {selectedBrand && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center space-x-2">
              <span>{selectedBrand}</span>
              <button onClick={() => setSelectedBrand(null)}>❌</button>
            </span>
          )}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-700 mb-3">Category</h3>
      <input
        type="text"
        placeholder="Search categories..."
        className="w-full px-4 py-2 mb-3 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="relative">
        <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex">
          ◀️
        </button>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {categories
            .filter((cat: any) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => handleSelection("category", cat)}
                className={`snap-start px-4 py-2 h-12 min-w-[120px] flex items-center justify-center rounded-lg border text-sm transition-all duration-200 ${
                  selectedCategory?.id === cat.id
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex">
          ▶️
        </button>
      </div>

      {filteredSubCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Subcategory</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSubCategories.map((sub: any) => (
              <button
                key={sub.id}
                onClick={() => handleSelection("subcategory", sub.name)}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-all duration-200 ${
                  selectedSubcategory === sub.name
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredBrands.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Brand</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBrands.map((brand: any) => (
              <button
                key={brand}
                onClick={() => handleSelection("brand", brand)}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-all duration-200 ${
                  selectedBrand === brand
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------
// UPDATED PRODUCT DETAILS
// -------------------

const ProductDetails = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const headerLabel = (() => {
    if (formData.category?.name === "Books") return "Book Details";
    if (["Clothing", "Fashion"].includes(formData.category?.name)) return "Clothing Details";
    if (formData.category?.name === "Home Appliances") return "Appliance Details";
    if (["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.name))
      return "Beauty Product Details";
    return "Product Details";
  })();

  const primaryLabel = formData.category?.name === "Books" ? "Book Title" : "Product Name";

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800">{headerLabel}</h3>
      <div className="relative">
        <input
          type="text"
          name="title"
          className="peer w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder=" "
          value={formData.title}
          onChange={handleChange}
        />
        <label className="absolute left-3 top-3 text-gray-500 text-sm transition-all">
          {primaryLabel}
        </label>
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
    </div>
  );
};

// -------------------
// GENERAL DETAILS (Vehicles)
// -------------------

const GeneralDetails = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="make" placeholder="Make" value={formData.make || ""} onChange={handleChange} className="input-field" required />
        <input type="text" name="model" placeholder="Model" value={formData.model || ""} onChange={handleChange} className="input-field" required />
        <input type="number" name="year" placeholder="Year" value={formData.year || ""} onChange={handleChange} className="input-field" required />
        <input type="text" name="trim" placeholder="Trim" value={formData.trim || ""} onChange={handleChange} className="input-field" />
        <input type="text" name="type" placeholder="Type (SUV, Sedan)" value={formData.type || ""} onChange={handleChange} className="input-field" required />
        <input type="text" name="color" placeholder="Color" value={formData.color || ""} onChange={handleChange} className="input-field" />
        <input type="number" name="mileage" placeholder="Mileage (km)" value={formData.mileage || ""} onChange={handleChange} className="input-field" />
        <select name="condition" value={formData.condition || ""} onChange={handleChange} className="input-field">
          <option value="New">New</option>
          <option value="Used">Used</option>
          <option value="Certified Pre-Owned">Certified Pre-Owned</option>
        </select>
      </div>
    </div>
  );
};

// -------------------
// OTHER COMPONENTS (PricingDetails, ProductVariants, ImageUploader, etc.)
// -------------------

const PricingDetails = ({ formData, handleInputChange }: any) => {
  const [finalPrice, setFinalPrice] = useState(formData.finalPrice || 0);
  const [profitMargin, setProfitMargin] = useState(formData.profitMargin || 0);

  useEffect(() => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const buyingPrice = parseFloat(formData.buyingPrice) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const discountedPrice = sellingPrice - (sellingPrice * discount) / 100;
    const margin = buyingPrice ? ((discountedPrice - buyingPrice) / buyingPrice) * 100 : 0;
    setFinalPrice(discountedPrice);
    setProfitMargin(margin);
  }, [formData.sellingPrice, formData.buyingPrice, formData.discount]);

  return (
    <div className="p-6 bg-white shadow-xl rounded-2xl border border-gray-200 space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Pricing Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Buying Price</label>
          <input
            type="number"
            name="buyingPrice"
            value={formData.buyingPrice}
            onChange={handleInputChange}
            placeholder="$0.00"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Selling Price</label>
          <input
            type="number"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleInputChange}
            placeholder="$0.00"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Discount (%)</label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleInputChange}
            placeholder="0%"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="p-5 bg-gray-100 rounded-lg flex justify-between shadow-sm">
        <p className="text-gray-800 font-semibold">Final Price:</p>
        <p className="text-blue-600 font-extrabold text-lg">${finalPrice.toFixed(2)}</p>
      </div>
      <div className="p-5 bg-gray-100 rounded-lg flex justify-between shadow-sm">
        <p className="text-gray-800 font-semibold">Profit Margin:</p>
        <p className="text-green-600 font-extrabold text-lg">{profitMargin.toFixed(2)}%</p>
      </div>
    </div>
  );
};

const ProductVariants = ({ formData, setFormData }: any) => {
  const options = {
    colors: ["Red", "Blue", "Green", "Black", "White"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["Cotton", "Leather", "Metal", "Plastic"],
    weights: ["Light", "Medium", "Heavy"]
  };

  const handleMultiSelect = (key: any, value: any) => {
    setFormData({
      ...formData,
      [key]: formData[key]?.includes(value)
        ? formData[key].filter((v: any) => v !== value)
        : [...(formData[key] || []), value]
    });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <div>
        <label className="block text-gray-800 font-semibold">Color</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {options.colors.map((color) => (
            <button
              key={color}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.color?.includes(color)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handleMultiSelect("color", color)}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-gray-800 font-semibold">Size</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {options.sizes.map((size) => (
            <button
              key={size}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.size?.includes(size)
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handleMultiSelect("size", size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-gray-800 font-semibold">Material</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {options.materials.map((material) => (
            <button
              key={material}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.material?.includes(material)
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handleMultiSelect("material", material)}
            >
              {material}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ImageUploader = ({ images, setImages }: any) => {
  const [loading, setLoading] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] } as Accept,
    multiple: true,
    onDrop: (acceptedFiles) => {
      setLoading(true);
      setTimeout(() => {
        setImages((prev: any) => {
          const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
          return Array.from(new Set([...prev, ...newImages]));
        });
        setLoading(false);
      }, 1000);
    }
  });

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-8 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all flex flex-col items-center justify-center"
      >
        <input {...getInputProps()} />
        {loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <ArrowUpTrayIcon className="w-10 h-10 text-gray-500 animate-pulse" />
          </motion.div>
        ) : (
          <>
            <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">
              Drag & drop images here, or{" "}
              <span className="text-orange-500 font-semibold">click to upload</span>
            </p>
          </>
        )}
      </div>
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img: any, index: any) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="relative group overflow-hidden rounded-lg shadow-lg">
                <img src={img} alt="Preview" className="h-24 w-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105" />
                <button
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
                  onClick={() => setImages((prev: any) => prev.filter((_: any, i: any) => i !== index))}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductAvailability = ({ formData, setFormData }: any) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <div>
        <label className="block text-gray-800 font-semibold">Availability</label>
        <div className="flex gap-4 mt-2">
          {["In Stock", "Out of Stock"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.availability === status ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setFormData({ ...formData, availability: status })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {[
          { label: "Is Featured?", key: "isFeatured" },
          { label: "Is New Arrival?", key: "isNewArrival" },
          { label: "Is On Offer / Discounted / Flash Deal?", key: "isOnOffer" }
        ].map(({ label, key }) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-800 font-semibold">{label}</span>
            <button
              onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData[key] ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform transform ${
                  formData[key] ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FinalReview = ({ formData }: any) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800">Final Review</h2>
      <p className="text-sm text-gray-600">Double-check all details before submitting.</p>
      
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Basic Information</h3>
          <p><strong>Title:</strong> {formData.title || "N/A"}</p>
          <p><strong>Description:</strong> {formData.description || "N/A"}</p>
          <p><strong>Category:</strong> {formData.category?.name || "N/A"}</p>
        </div>

        {/* Pricing Information */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Pricing Information</h3>
          <p><strong>Buying Price:</strong> {formData.buyingPrice || "N/A"}</p>
          <p><strong>Selling Price:</strong> {formData.sellingPrice || "N/A"}</p>
          <p><strong>Discount (%):</strong> {formData.discount || "0"}</p>
          <p><strong>Final Price:</strong> {formData.finalPrice || "N/A"}</p>
          <p><strong>Profit Margin (%):</strong> {formData.profitMargin || "N/A"}</p>
        </div>

        {/* Availability & Feature Toggles */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Availability & Features</h3>
          <p><strong>Availability:</strong> {formData.availability || "N/A"}</p>
          <p><strong>Featured:</strong> {formData.isFeatured ? "Yes" : "No"}</p>
          <p><strong>New Arrival:</strong> {formData.isNewArrival ? "Yes" : "No"}</p>
          <p><strong>On Offer:</strong> {formData.isOnOffer ? "Yes" : "No"}</p>
        </div>

        {/* Category-Specific Details */}
        {formData.category?.name === "Books" && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Book Details</h3>
            <p><strong>Author:</strong> {formData.author || "N/A"}</p>
            <p><strong>Publisher:</strong> {formData.publisher || "N/A"}</p>
            <p><strong>ISBN:</strong> {formData.isbn || "N/A"}</p>
          </div>
        )}

        {["Clothing", "Fashion"].includes(formData.category?.name) && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Clothing Details</h3>
            <p><strong>Fabric Composition:</strong> {formData.fabricComposition || "N/A"}</p>
            <p><strong>Care Instructions:</strong> {formData.careInstructions || "N/A"}</p>
          </div>
        )}

        {formData.category?.name === "Home Appliances" && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Home Appliance Details</h3>
            <p><strong>Energy Rating:</strong> {formData.energyRating || "N/A"}</p>
            <p><strong>Warranty Period:</strong> {formData.warrantyPeriod || "N/A"}</p>
            <p><strong>Dimensions:</strong> {formData.dimensions || "N/A"}</p>
          </div>
        )}

        {["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.name) && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Beauty Product Details</h3>
            <p><strong>Ingredients:</strong> {formData.ingredients || "N/A"}</p>
            <p><strong>Usage Instructions:</strong> {formData.usageInstructions || "N/A"}</p>
            <p><strong>Expiration Date:</strong> {formData.expirationDate || "N/A"}</p>
          </div>
        )}

        {/* Vehicle Details (if applicable) */}
        {["Automotive", "Cars", "Car Accessories", "Tools", "Hardware"].includes(formData.category?.name) && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Vehicle Details</h3>
            <p><strong>Make:</strong> {formData.make || "N/A"}</p>
            <p><strong>Model:</strong> {formData.model || "N/A"}</p>
            <p><strong>Year:</strong> {formData.year || "N/A"}</p>
            <p><strong>Trim:</strong> {formData.trim || "N/A"}</p>
            <p><strong>Type:</strong> {formData.type || "N/A"}</p>
            <p><strong>Mileage:</strong> {formData.mileage || "N/A"}</p>
            <p><strong>Condition:</strong> {formData.condition || "N/A"}</p>
          </div>
        )}

        {/* Contact & Location */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Contact & Location</h3>
          <p><strong>Location:</strong> {formData.location || "N/A"}</p>
          <p><strong>Contact Number:</strong> {formData.contact || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};


const EnginePerformance = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="section-title">Engine & Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="engineType" placeholder="Engine Type" value={formData.engineType} onChange={handleChange} className="input-field" />
        <input type="text" name="engineSize" placeholder="Engine Size" value={formData.engineSize} onChange={handleChange} className="input-field" />
        <input type="text" name="transmission" placeholder="Transmission" value={formData.transmission} onChange={handleChange} className="input-field" />
        <input type="text" name="drivetrain" placeholder="Drivetrain (AWD, FWD)" value={formData.drivetrain} onChange={handleChange} className="input-field" />
      </div>
    </div>
  );
};

const OwnershipPricing = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="section-title">Ownership & Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="vin" placeholder="VIN Number" value={formData.vin} onChange={handleChange} className="input-field" />
        <select name="logbookStatus" value={formData.logbookStatus} onChange={handleChange} className="input-field">
          <option value="Available">Available</option>
          <option value="Missing">Missing</option>
          <option value="Pending">Pending</option>
        </select>
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="input-field" required />
        <label className="flex items-center space-x-2 text-gray-700">
          <input type="checkbox" name="negotiable" checked={formData.negotiable} onChange={(e) => setFormData({ ...formData, negotiable: e.target.checked })} className="w-5 h-5" />
          <span>Price Negotiable</span>
        </label>
      </div>
    </div>
  );
};

const ContactLocation = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="section-title">Contact & Location</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <MapPinIcon className="input-icon w-6 h-6" />
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="input-field pl-10" required />
        </div>
        <div className="relative">
          <PhoneIcon className="input-icon w-6 h-6" />
          <input type="text" name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleChange} className="input-field pl-10" required />
        </div>
      </div>
    </div>
  );
};

// -------------------
// MAPPINGS
// -------------------

const FORM_COMPONENTS: Record<number, React.FC<any>> = {
  1: CategoryPicker,
  2: ProductDetails,      // Extended for Books, Clothing, Home Appliances, Beauty Products
  3: GeneralDetails,
  4: EnginePerformance,
  5: OwnershipPricing,
  7: PricingDetails,
  8: ImageUploader,
  9: ProductVariants,
  10: ProductAvailability,
  11: FinalReview,
  12: ContactLocation
};

const STEP_LABELS: Record<number, string> = {
  1: "Category",
  2: "Product Details",
  3: "General Details",
  4: "Engine Performance",
  5: "Ownership Pricing",
  7: "Pricing",
  8: "Images",
  9: "Product Variants",
  10: "Availability",
  11: "Final Review",
  12: "Contact Location"
};

// Example CATEGORY_STEPS mapping (update as needed)
const CATEGORY_STEPS: any = {
  "Electronics": [1, 2, 7, 8, 9, 10, 12, 11],
  "Clothing": [1, 2, 7, 8, 9, 10, 12, 11],
  "Fashion": [1, 2, 7, 8, 9, 10, 12, 11],
  "Smartphones": [1, 2, 7, 8, 9, 10, 12, 11],
  "Laptops": [1, 2, 7, 8, 9, 10, 12, 11],
  "Tablets": [1, 2, 7, 8, 9, 10, 12, 11],
  "Wearables": [1, 2, 7, 8, 9, 10, 12, 11],
  "Home Appliances": [1, 2, 7, 8, 9, 10, 12, 11],
  "Cameras": [1, 2, 7, 8, 9, 10, 12, 11],
  "Gaming Consoles": [1, 2, 7, 8, 9, 10, 12, 11],
  "Televisions": [1, 2, 7, 8, 9, 10, 12, 11],
  "Audio Systems": [1, 2,  7, 8, 9, 10, 12, 11],
  "Music": [1, 2, 7, 8, 9, 10, 12, 11],
  "Books": [1, 2, 7, 8, 9, 10, 12, 11],
  "Stationery": [1, 2, 7, 8, 9, 10, 12, 11],
  "Shoes": [1, 2, 7, 8, 9, 10, 12, 11],
  "Watches": [1, 2, 7, 8, 9, 10, 12, 11],
  "Jewelry": [1, 2, 7, 8, 9, 10, 12, 11],
  "Beauty Products": [1, 2, 7, 8, 9, 10, 12, 11],
  "Skincare": [1, 2, 7, 8, 9, 10, 12, 11],
  "Haircare": [1, 2, 7, 8, 9, 10, 12, 11],
  "Toys": [1, 2, 7, 8, 9, 10, 12, 11],
  "Baby Toys": [1, 2, 7, 8, 9, 10, 12, 11],
  "Sports Equipment": [1, 2, 7, 8, 9, 10, 12, 11],
  "Fitness Gear": [1, 2, 7, 8, 9, 10, 12, 11],
  "Outdoor Gear": [1, 2, 7, 8, 9, 10, 12, 11],
  "Bicycles": [1, 2, 7, 8, 9, 10, 12, 11],
  "Musical Instruments": [1, 2, 7, 8, 9, 10, 12, 11],
  "Furniture": [1, 2, 7, 8, 9, 10, 12, 11],
  "Decor": [1, 2, 7, 8, 9, 10, 12, 11],
  "Kitchenware": [1, 2, 7, 8, 9, 10, 12, 11],
  "Dining": [1, 2, 7, 8, 9, 10, 12, 11],
  "Bedding": [1, 2, 7, 8, 9, 10, 12, 11],
  "Pet Supplies": [1, 2, 7, 8, 9, 10, 12, 11],
  "Pets": [1, 2, 7, 8, 9, 10, 12, 11],
  "Automotive": [1, 3, 4, 5, 7, 8, 10, 10, 12, 11],
  "Cars": [1, 3, 4, 5, 7, 8, 10, 12, 11],
  "Car Accessories": [1, 3, 4, 5, 7, 8, 10, 12, 11],
  "Tools": [1, 3, 4, 5, 7, 8, 10, 12, 11],
  "Hardware": [1, 3, 4, 5, 7, 8, 10, 12, 11],
  "Lighting": [1, 2, 7, 8, 9, 10, 12, 11],
  "Gardening": [1, 2, 7, 8, 9, 10, 12, 11],
  "Home & Garden": [1, 2, 7, 8, 9, 10, 12, 11],
  "Office Supplies": [1, 2, 7, 8, 9, 10, 12, 11],
  "Art Supplies": [1, 2, 7, 8, 9, 10, 12, 11],
  "Health Products": [1, 2, 7, 8, 9, 10, 12, 11],
  "Health & Beauty": [1, 2, 7, 8, 9, 10, 12, 11],
  "Supplements": [1, 2, 7, 8, 9, 10, 12, 11],
  "Baby Products": [1, 2, 7, 8, 9, 10, 12, 11],
  "Maternity": [1, 2, 7, 8, 9, 10, 12, 11],
  "Groceries": [1, 2, 7, 8, 9, 10, 12, 11],
  "Snacks": [1, 2, 7, 8, 9, 10, 12, 11],
  "Beverages": [1, 2, 7, 8, 9, 10, 12, 11],
  "Alcohol": [1, 2, 7, 8, 9, 10, 12, 11],
  "Gourmet Foods": [1, 2, 7, 8, 9, 10, 12, 11],
  "Cleaning Supplies": [1, 2, 7, 8, 9, 10, 12, 11],
  "Safety Equipment": [1, 2, 7, 8, 9, 10, 12, 11],
  "Party Supplies": [1, 2, 7, 8, 9, 10, 12, 11],
  "Gifts": [1, 2, 7, 8, 9, 10, 12, 11],
  "Travel Gear": [1, 2, 7, 8, 9, 10, 12, 11]
};

// -------------------
// MAIN MODAL COMPONENT
// -------------------

const AddToProductMarketModal = ({ showRequestProductModal, setShowRequestProductModal, product, marketListItem }: any) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: marketListItem?.id || "",
    productId: marketListItem?.productId || product?.product?.id || "",
    title: marketListItem?.title || product?.product?.name || "",
    description: marketListItem?.description || product?.product?.description || "",
    productCategoryId: marketListItem?.productCategoryId || product?.product?.productCategoryId || "",
    model: marketListItem?.model || product?.product?.model || "",
    color: marketListItem?.color || product?.product?.color || "",
    size: marketListItem?.size || product?.product?.size || "",
    weight: marketListItem?.weight || product?.product?.weight || "",
    condition: marketListItem?.condition || product?.product?.condition || "",
    dimension: marketListItem?.dimension || product?.product?.dimension || "",
    material: marketListItem?.material || product?.product?.material || "",
    images: marketListItem?.image || product?.product?.image || "",
    isAvailable: marketListItem?.isAvailable || product?.product?.isAvailable || "",
    isOnOffer: marketListItem?.isOnOffer || product?.product?.isOnOffer || "",
    isFlashDeal: marketListItem?.isFlashDeal || product?.product?.isFlashDeal || "",
    isNewArrival: marketListItem?.isNewArrival || product?.product?.isNewArrival || "",
    isDiscounted: marketListItem?.isDiscounted || product?.product?.isDiscounted || "",
    isFeatured: marketListItem?.isFeatured || product?.product?.isFeatured || "",
    quantity: product?.quantityPurchased || 1,
    buyingPrice: marketListItem?.buyingPrice || product?.product?.salesPrice || "",
    sellingPrice: marketListItem?.sellingPrice || 0,
    discount: marketListItem?.discount || 0,
    finalPrice: marketListItem?.finalPrice || 0,
    profitMargin: marketListItem?.profitMargin || 0,
    category: marketListItem?.productCategory || product?.product?.productCategory || { subcategories: [], allBrands: [] },
    subCategories: marketListItem?.subCategories || product?.product?.subCategories || [],
    brands: marketListItem?.brands || product?.product?.brands || [],
    tags:marketListItem?.tags || product?.product?.tags || [],
    // Vehicle-specific keys
    make: "",
    trim: "",
    type: "",
    mileage: "",
    engineType: "",
    engineSize: "",
    transmission: "",
    drivetrain: "",
    vin: "",
    logbookStatus: "Available",
    serviceHistory: "Full",
    price: "",
    negotiable: false,
    financingAvailable: false,
    tradeIn: false,
    features: [],
    location: "",
    contact: "",
    video: null,
    // Extra fields for Books:
    author: "",
    publisher: "",
    isbn: "",
    // Extra fields for Clothing/Fashion:
    fabricComposition: "",
    careInstructions: "",
    // Extra fields for Home Appliances:
    energyRating: "",
    warrantyPeriod: "",
    dimensions: "",
    // Extra fields for Beauty Products:
    ingredients: "",
    usageInstructions: "",
    expirationDate: ""
  });

  const stepsForCategory: number[] = useMemo(() => {
    return CATEGORY_STEPS[formData.category?.name] || [];
  }, [formData.category]);

  const currentDynamicStep = stepsForCategory[step - 1];
  const FormComponent = currentDynamicStep ? FORM_COMPONENTS[currentDynamicStep] : null;

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredSubCategories = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.subcategories;
  }, [formData.category]);

  useEffect(() => {
    if (categories.length > 0) return;
    const cachedCategories = localStorage.getItem("categories");
    if (cachedCategories) {
      setCategories(JSON.parse(cachedCategories));
    } else {
      fetch(`${apiUrl}/shop/categories?limit=100`)
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.categories);
          localStorage.setItem("categories", JSON.stringify(data.categories));
        })
        .catch(console.error);
    }
  }, [categories]);

  const filteredBrands = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.allBrands;
  }, [formData.category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let newValue = ["discount", "buyingPrice", "sellingPrice"].includes(name)
        ? parseFloat(value) || 0
        : value;
      let updatedData = { ...prev, [name]: newValue };
      if (["buyingPrice", "sellingPrice", "discount"].includes(name)) {
        const buyingPrice = parseFloat(updatedData.buyingPrice) || 0;
        const sellingPrice = parseFloat(updatedData.sellingPrice) || 0;
        const discount = parseFloat(updatedData.discount) || 0;
        updatedData.finalPrice = sellingPrice - (sellingPrice * discount) / 100;
        updatedData.profitMargin = buyingPrice > 0 ? ((sellingPrice - buyingPrice) / buyingPrice) * 100 : 0;
      }
      return updatedData;
    });
  };

  // const handleCreateListing = () => {
  //   if (window.confirm("Are you sure you want to create this listing?")) {
  //     alert("Marketplace listing created successfully.");
  //     setShowRequestProductModal(false);
  //   }
  // };

  const handleCreateListingV1 = () => {
  if (window.confirm("Are you sure you want to create this listing?")) {
    // Create a listing object conforming to the MarketplaceListing model
    const listing = {
      id: formData.id, // If updating, otherwise your backend may auto-generate this
      sellerId: "CURRENT_SELLER_ID", // Replace with actual seller ID from context
      sellerType: "CLIENT", // Or "CONSUMER", as appropriate
      productId: formData.productId,
      title: formData.title,
      description: formData.description,
      quantity: formData.quantity,
      image: images[0] || "", // Use the first uploaded image
      productCategoryId: formData.category?.id || "", // Assuming category is an object with an id
      // Use the category's name as a string for the listing's "category" field
      category: formData.category?.name || "",
      // If multiple subcategories were selected, you might choose the first
      subCategory: formData.subCategories && formData.subCategories.length > 0 ? formData.subCategories[0] : "",
      tags:  [],//formData.tags ||
      brand: formData.brands,
      model: formData.model,
      color: formData.color,
      size: formData.size,
      weight: formData.weight,
      condition: formData.condition,
      dimension: formData.dimension,
      // Ensure material is an array (if a single value was provided, wrap it in an array)
      material: Array.isArray(formData.material)
        ? formData.material
        : formData.material
        ? [formData.material]
        : [],
      // Map selling price to salesPrice as per the model
      salesPrice: parseFloat(formData.sellingPrice) || 0,
      discount: formData.discount,
      isAvailable: formData.isAvailable,
      isOnOffer: formData.isOnOffer,
      isFlashDeal: formData.isFlashDeal,
      isNewArrival: formData.isNewArrival,
      isDiscounted: formData.isDiscounted,
      isFeatured: formData.isFeatured,
      buyingPrice: parseFloat(formData.buyingPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      // For deal dates, if not provided, you can leave these as null
      startDealDate: null,
      endDealDate: null
    };

    // You can now send 'listing' to your API or update your state
    console.log("Listing to be created:", listing);
    alert("Marketplace listing created successfully.");
    setShowRequestProductModal(false);
  }
};

const handleCreateListing = async () => {
  if (window.confirm("Are you sure you want to create this listing?")) {
    // Build a listing object conforming to the updated MarketplaceListing model
    const listing = {
      id: formData.id, // If updating; otherwise backend auto-generates
      sellerId: "CURRENT_SELLER_ID", // Replace with actual seller ID
      sellerType: "CLIENT", // Or "CONSUMER", as appropriate
      productId: formData.productId,
      title: formData.title,
      description: formData.description,
      quantity: formData.quantity,
      image: images[0] || "", // Use the first uploaded image
      productCategoryId: formData.category?.id || "", // Assuming category is an object with an id
      category: formData.category?.name || "",
      subCategory:
        formData.subCategories && formData.subCategories.length > 0
          ? formData.subCategories[0]
          : "",
      tags: formData.tags || [],
      brand: formData.brands,
      model: formData.model,
      color: formData.color,
      size: formData.size,
      weight: formData.weight,
      condition: formData.condition,
      dimension: formData.dimension,
      material: Array.isArray(formData.material)
        ? formData.material
        : formData.material
        ? [formData.material]
        : [],
      salesPrice: parseFloat(formData.sellingPrice) || 0,
      discount: formData.discount,
      isAvailable: formData.isAvailable,
      isOnOffer: formData.isOnOffer,
      isFlashDeal: formData.isFlashDeal,
      isNewArrival: formData.isNewArrival,
      isDiscounted: formData.isDiscounted,
      isFeatured: formData.isFeatured,
      buyingPrice: parseFloat(formData.buyingPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      startDealDate: null,
      endDealDate: null,
      // Category-specific fields for Books
      author: formData.author || "",
      publisher: formData.publisher || "",
      isbn: formData.isbn || "",
      // Category-specific fields for Clothing/Fashion
      fabricComposition: formData.fabricComposition || "",
      careInstructions: formData.careInstructions || "",
      // Category-specific fields for Home Appliances
      energyRating: formData.energyRating || "",
      warrantyPeriod: formData.warrantyPeriod || "",
      applianceDimensions: formData.dimensions || "",
      // Category-specific fields for Beauty Products
      ingredients: formData.ingredients || "",
      usageInstructions: formData.usageInstructions || "",
      expirationDate: formData.expirationDate
        ? new Date(formData.expirationDate)
        : null
    };

    try {
      const response = await fetch(`${apiUrl}/marketplace/listing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(listing)
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Listing created:", data);
        alert("Marketplace listing created successfully.");
        setShowRequestProductModal(false);
      } else {
        console.error("Error creating listing:", response.statusText);
        alert("Error creating listing. Please try again.");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Error creating listing. Please try again.");
    }
  }
};


  return (
    <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)}>
      <div className="p-6 bg-white rounded-xl shadow-lg text-gray-900 w-full max-w-4xl mx-auto h-[90vh] flex flex-col">
        <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-grow overflow-y-auto">
          <Stepper step={step} stepsForCategory={stepsForCategory} />
          <div className="overflow-y-auto flex-grow p-4">
            {FormComponent ? (
              <FormComponent
                formData={formData}
                setFormData={setFormData}
                images={images}
                setImages={setImages}
                categories={categories}
                filteredSubCategories={filteredSubCategories}
                filteredBrands={filteredBrands}
                handleInputChange={handleInputChange}
              />
            ) : (
              <p>No form available for this step.</p>
            )}
          </div>
        </motion.div>
        <div className="flex justify-between pt-4 border-t">
          {step > 1 && (
            <button className="bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center" onClick={() => setStep(step - 1)}>
              <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
            </button>
          )}
          {step < stepsForCategory.length ? (
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center" onClick={() => setStep(step + 1)}>
              Next <ArrowRightIcon className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button onClick={handleCreateListing} className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center">
              Submit <CheckCircleIcon className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddToProductMarketModal;
