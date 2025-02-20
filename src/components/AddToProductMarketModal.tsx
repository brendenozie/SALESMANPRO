import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Modal from "../components/Modal";
import { useDropzone, Accept } from "react-dropzone";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import { ArrowUpCircleIcon, PhotoIcon, TagIcon, CurrencyDollarIcon, ChevronDownIcon, XMarkIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { ArrowUpTrayIcon, ListBulletIcon } from "@heroicons/react/24/solid";

const AddToProductMarketModal = ({ showRequestProductModal, setShowRequestProductModal, product }:any) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: "",
    productId: "",
    productName: "",
    productCategoryId: "",
    model: "",
    color: "",
    size: "",
    weight: "",
    condition: "",
    dimension: "",
    material: "",
    image: "",
    isAvailable: "",
    isOnOffer: "",
    isFlashDeal: "",
    isNewArrival: "",
    isDiscounted: "",
    isFeatured: "",
    quantity: 1,
    buyingPrice: "",
    sellingPrice: "",
    discount: "",
    finalPrice: 0,
    profitMargin: 0,
    category: {subcategories:[],allBrands:[]},
    subCategories: [],
    brands: [],
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState<string[]>([]);
   const [loading, setLoading] = useState(false);

  useEffect(() => {
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
  }, []);

  // Memoized filtered subcategories and brands
  const filteredSubCategories = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.subcategories;
  }, [formData.category]);

  const filteredBrands = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.allBrands;
  }, [formData.category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newValue = name === "discount" ? Number(value) || 0 : value;
      let updatedData = { ...prev, [name]: newValue };

      if (name === "buyingPrice" || name === "sellingPrice" || name === "discount") {
        const buyingPrice = parseFloat(updatedData.buyingPrice) || 0;
        const sellingPrice = parseFloat(updatedData.sellingPrice) || 0;
        const discount = parseFloat(updatedData.discount) || 0;

        updatedData.profitMargin = buyingPrice
          ? ((sellingPrice - buyingPrice) / buyingPrice) * 100
          : 0;
        updatedData.finalPrice = sellingPrice - (sellingPrice * discount) / 100;
      }
      return updatedData;
    });
  }; 

  const isNextDisabled =
    (step === 1 && !formData.category) ||
    (step === 7 && (!formData.buyingPrice || !formData.sellingPrice));

  const handleCreateListing = () => {
    if (window.confirm("Are you sure you want to create this listing?")) {
      alert("Marketplace listing created successfully.");
      setShowRequestProductModal(false);
    }
  };

  return (
    <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)}>
      <div className="space-y-6 p-6 bg-white rounded-xl shadow-lg text-gray-900 w-full max-w-3xl mx-auto">
        
        {/* Steps Content */}
        <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
          <div className="flex items-center space-x-2">
            <Stepper step={step}/>
          </div>
        
        {step ===1 && (
          <StepOneForm formData={formData} handleInputChange={handleInputChange} categories={categories} subCategories={subCategories} brands={brands} filteredSubCategories={filteredSubCategories} filteredBrands={filteredBrands}/>
        )}
        
        {step === 2 && (
          <ProductDetails formData handleInputChange/>
        )}

        {step === 3 && (
          <PricingDetails formData handleInputChange/>
        )}

        {step === 4 && (
          <ImageUploader images={images} setImages={setImages} />
        )}

        {/* Step 5: Variants */}
        {step === 5  && (
          <ProductVariants formData setFormData/>
        )}
        
        {/* Step 6: Availability */}
        {step === 6 && (
          <ProductAvailability formData setFormData/>
        )}
        
        {/* Step 7: Review & Submit */}
        {step === 7 && (
          <FinalReview formData setFormData/>
        )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button className="bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center" onClick={() => setStep(step - 1)}>
              <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
            </button>
          )}
          {step < 7 ? (
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center" onClick={() => setStep(step + 1)} disabled={isNextDisabled}>
              Next <ArrowRightIcon className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center">
              Submit <CheckIcon className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddToProductMarketModal;

const Stepper = ({ step }: { step: number }) => {
  const steps = [
    "Category",
    "Product Details",
    "Pricing",
    "Images",
    "Product Variants",
    "Availability",
    "Final Review",
  ];

  return (
    <div className="w-full space-y-4">
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-300 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-blue-700 shadow-md rounded-full"
          animate={{ width: `${(step / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Steps Content */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 space-x-4 sm:grid sm:grid-cols-7 sm:gap-3">
        {steps.map((label, index) => {
          const isActive = index + 1 === step;
          const isCompleted = index + 1 < step;

          return (
            <div key={index} className="flex flex-col items-center space-y-1 min-w-[80px]">
              {/* Step Indicator */}
              <motion.div
                className={`w-12 h-12 flex items-center justify-center rounded-full font-bold shadow-md transition-all border-2
                  ${isActive ? "bg-blue-600 text-white border-blue-600 scale-110" :
                  isCompleted ? "bg-blue-400 text-white border-blue-400" : "bg-gray-300 text-gray-500 border-gray-300"}
                `}
                animate={{ scale: isActive ? 1.2 : 1 }}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : index + 1}
              </motion.div>

              {/* Step Label */}
              <p
                className={`text-xs sm:text-sm font-medium text-center truncate w-16
                  ${isActive ? "text-blue-600 font-semibold" :
                  isCompleted ? "text-blue-400" : "text-gray-400"}
                `}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StepOneForm = ({
  formData,
  handleInputChange,
  categories,
  subCategories,
  brands,
  filteredSubCategories,
  filteredBrands,
}: any) => {
  const [selectedCategory, setSelectedCategory] = useState(formData.category || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(formData.subcategory || "");
  const [selectedBrand, setSelectedBrand] = useState(formData.brand || "");

  const handleSelection = (field: any, value: any) => {
    handleInputChange({ target: { name: field, value } });

    if (field === "category") setSelectedCategory(value);
    if (field === "subcategory") setSelectedSubcategory(value);
    if (field === "brand") setSelectedBrand(value);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 space-y-6">
      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Category</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => handleSelection("category", cat)}
              className={`px-4 py-2 h-12 min-w-[120px] flex items-center justify-center rounded-lg border transition-all duration-200 text-sm
                ${
                  selectedCategory.id === cat.id
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300"
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Selection */}
      {filteredSubCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Subcategory</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSubCategories.map((sub: any) => (
              <button
                key={sub.id}
                onClick={() => handleSelection("subcategory", sub.name)}
                className={`px-4 py-2 h-12 rounded-lg border transition-all duration-200 text-sm
                  ${
                    selectedSubcategory === sub.name
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300"
                  }
                `}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand Selection */}
      {filteredBrands.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Brand</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBrands.map((brand: any) => (
              <button
                key={brand}
                onClick={() => handleSelection("brand", brand)}
                className={`px-4 py-2 h-12 rounded-lg border transition-all duration-200 text-sm
                  ${
                    selectedBrand === brand
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300"
                  }
                `}
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

const ImageUploader = ({ images, setImages }:any) => {
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] } as Accept,
    multiple: true,
    onDrop: (acceptedFiles) => {
      setLoading(true);
      setTimeout(() => {
        setImages((prev:any) => {
          const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
          return Array.from(new Set([...prev, ...newImages]));
        });
        setLoading(false);
      }, 1000);
    },
  });

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
      {/* Upload Area */}
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
            <p className="text-gray-500">Drag & drop images here, or <span className="text-orange-500 font-semibold">click to upload</span></p>
          </>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img:any, index:any) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="relative group overflow-hidden rounded-lg shadow-lg">
                <img src={img} alt="Preview" className="h-24 w-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105" />
                <button
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
                  onClick={() => setImages((prev:any) => prev.filter((_:any, i:any) => i !== index))}
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

const ProductDetails = ({ formData, setFormData }: any) => {
  const [tags, setTags] = useState(formData.tags || []);
  const [description, setDescription] = useState(formData.description || "");

  const handleTagInput = (e: any) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      setTags([...tags, e.target.value.trim()]);
      e.target.value = "";
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag:any) => tag !== tagToRemove));
  };

  // useEffect(() => {
  //   setFormData({ ...formData, tags, description });
  // }, [tags, description]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
      
      {/* Product Name */}
      <div className="relative">
        <input
          type="text"
          name="productName"
          className="peer w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder=" "
          value={formData.productName}
          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
        />
        <label
          className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
        >
          Product Name
        </label>
      </div>

      {/* Description with Preview */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Description</label>
        <textarea
          name="description"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
          placeholder="Enter a brief description"
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">{description.length}/500 characters</p>
        {description && (
          <div className="mt-3 p-3 bg-gray-100 border-l-4 border-blue-500 rounded-lg">
            <h4 className="font-semibold text-gray-700">Preview:</h4>
            <p className="text-gray-600">{description}</p>
          </div>
        )}
      </div>

      {/* Tags Input */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Tags</label>
        <div className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none flex flex-wrap gap-2">
          {tags.map((tag:any, index:any) => (
            <span
              key={index}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full flex items-center"
            >
              {tag}
              <button
                type="button"
                className="ml-2 text-white hover:text-gray-300"
                onClick={() => removeTag(tag)}
              >
                ✕
              </button>
            </span>
          ))}
          <input
            type="text"
            className="flex-grow focus:outline-none p-2"
            placeholder="Press Enter to add tags"
            onKeyDown={handleTagInput}
          />
        </div>
      </div>
    </div>
  );
};

const ProductVariants = ({ formData, setFormData }: any) => {
  const options = {
    colors: ["Red", "Blue", "Green", "Black", "White"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["Cotton", "Leather", "Metal", "Plastic"],
    weights: ["Light", "Medium", "Heavy"],
  };

  const handleMultiSelect = (key: any, value: any) => {
    setFormData({
      ...formData,
      [key]: formData[key]?.includes(value)
        ? formData[key].filter((v: any) => v !== value)
        : [...(formData[key] || []), value],
    });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      {/* Color */}
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

      {/* Size */}
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

      {/* Material */}
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

      {/* Input Fields */}
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

      {/* Pricing Summary */}
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

const ProductAvailability = ({ formData, setFormData }: any) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      {/* Availability */}
      <div>
        <label className="block text-gray-800 font-semibold">Availability</label>
        <div className="flex gap-4 mt-2">
          {["In Stock", "Out of Stock"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.availability === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setFormData({ ...formData, availability: status })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-4">
        {[
          { label: "Is Featured?", key: "isFeatured" },
          { label: "Is New Arrival?", key: "isNewArrival" },
          { label: "Is On Offer / Discounted / Flash Deal?", key: "isOnOffer" },
        ].map(({ label, key }) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-800 font-semibold">{label}</span>
            <button
              onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData[key] ? "bg-green-500" : "bg-gray-300"
              }`}
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

const FinalReview = ({ formData, onSubmit }: any) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800">Final Review</h2>
      <p className="text-sm text-gray-600">Double-check all details before submitting.</p>

      <div className="p-4 bg-gray-100 rounded-lg space-y-2">
        <p><strong>Availability:</strong> {formData.availability}</p>
        <p><strong>Is Featured?</strong> {formData.isFeatured ? "Yes" : "No"}</p>
        <p><strong>Is New Arrival?</strong> {formData.isNewArrival ? "Yes" : "No"}</p>
        <p><strong>Is On Offer?</strong> {formData.isOnOffer ? "Yes" : "No"}</p>
      </div>
    </div>
  );
};




