import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Modal from "../components/Modal";
import { useDropzone, Accept } from "react-dropzone";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import { ArrowUpCircleIcon, PhotoIcon, TagIcon, CurrencyDollarIcon, ChevronDownIcon, XMarkIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, CheckCircleIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { ArrowUpOnSquareIcon, ArrowUpTrayIcon, CameraIcon, ListBulletIcon, PhoneIcon } from "@heroicons/react/24/solid";

const AddToProductMarketModal = ({ showRequestProductModal, setShowRequestProductModal, product, marketListItem }:any) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: marketListItem?.id || "",
    productId: marketListItem?.productId || product?.product?.id || "",
    title: marketListItem?.title || product?.product?.name || "",
    description: marketListItem?.description || product?.product?.description || "",
    productCategoryId: marketListItem?.productCategoryId || product?.product?.productCategoryId || "",
    model: marketListItem?.model || product?.product?.model || "",////Corolla, Civic, X5, etc.
    color: marketListItem?.color || product?.product?.color || "",
    size: marketListItem?.size || product?.product?.size || "",
    weight: marketListItem?.weight || product?.product?.weight || "",
    condition: marketListItem?.condition || product?.product?.condition || "", //New, Used, Certified Pre-Owned
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
    sellingPrice: marketListItem?.sellingPrice ||  0,
    discount: marketListItem?.discount || 0,
    finalPrice: marketListItem?.finalPrice ||  0,
    profitMargin: marketListItem?.profitMargin || 0,
    category: marketListItem?.productCategory || product?.product?.productCategory || { subcategories: [], allBrands: [] },
    subCategories: marketListItem?.subCategories || product?.product?.subCategories || [],
    brands: marketListItem?.brands || product?.product?.brands || [],//Toyota, Honda, BMW, etc.
  

    
    year: "",
    trim: "",//Specific edition (e.g., XLE, Sport, Limited)
    type: "",//Sedan, SUV, Truck, Motorcycle, etc.
    mileage: "",
    engineType: "",//Petrol, Diesel, Hybrid, Electric
    engineSize: "",
    transmission: "",// Manual, Automatic, CVT, Dual-Clutch
    drivetrain: "",//FWD (Front-Wheel Drive), AWD (All-Wheel Drive), RWD (Rear-Wheel Drive), 4WD
    vin: "",
    logbookStatus: "Available",// Available, Missing, Pending
    serviceHistory: "Full",//Full, Partial, None
    price: "",
    negotiable: false,
    financingAvailable: false,
    tradeIn:false,
    features: [],// Leather seats, Sunroof, Heated seats, Touchscreen, etc
    location: "",//ABS, Airbags, Blind Spot Monitoring, Lane Assist,  Apple CarPlay, Android Auto, Navigation System, Alloy Wheels, LED Headlights, Fog Lights, Spoiler
    contact: "",
    video: null,
  });
  
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
}, [categories]);  // Depend only on `categories`

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
    let newValue = name === "discount" || name === "buyingPrice" || name === "sellingPrice" 
      ? parseFloat(value) || 0 
      : value;

    let updatedData = { ...prev, [name]: newValue };

    if (["buyingPrice", "sellingPrice", "discount"].includes(name)) {
      const buyingPrice = parseFloat(updatedData.buyingPrice) || 0;
      const sellingPrice = parseFloat(updatedData.sellingPrice) || 0;
      const discount = parseFloat(updatedData.discount) || 0;

      updatedData.finalPrice = sellingPrice - (sellingPrice * discount) / 100;
      updatedData.profitMargin = buyingPrice > 0 
        ? ((sellingPrice - buyingPrice) / buyingPrice) * 100 
        : 0;
    }
    
    return updatedData;
  });
};


  const isNextDisabled = (step === 1 && !formData.category) || (step === 7 && (!formData.buyingPrice || !formData.sellingPrice));

  const handleCreateListing = () => {
    if (window.confirm("Are you sure you want to create this listing?")) {
      alert("Marketplace listing created successfully.");
      setShowRequestProductModal(false);
    }
  };

  return (
    <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)}>
  <div className="p-6 bg-white rounded-xl shadow-lg text-gray-900 w-full max-w-4xl mx-auto 
                  h-[90vh] max-h-[90vh] flex flex-col">
    
    {/* Steps Content */}
    <motion.div 
      key={step} 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }} 
      className="flex-grow overflow-y-auto"
    >
      <Stepper step={step} />

      {/* Ensure this wrapper scrolls correctly */}
      <div className="overflow-y-auto flex-grow p-4">
        {step === 1 && (
          <CategoryPicker 
            formData={formData} 
            handleInputChange={handleInputChange} 
            categories={categories} 
            filteredSubCategories={filteredSubCategories} 
            filteredBrands={filteredBrands} 
          />
        )}
        {step === 2 && <VehicleProductForm formData={formData} setFormData={setFormData} />}
        {step === 3 && <PricingDetails formData={formData} handleInputChange={handleInputChange} />}
        {step === 4 && <ImageUploader images={images} setImages={setImages} />}
        {step === 5 && <ProductVariants formData={formData} setFormData={setFormData} />}
        {step === 6 && <ProductAvailability formData={formData} setFormData={setFormData} />}
        {step === 7 && <FinalReview formData={formData} setFormData={setFormData} />}
      </div>
    </motion.div>

    {/* Navigation Buttons - Fixed at Bottom */}
    <div className="flex justify-between pt-4 border-t">
      {step > 1 && (
        <button 
          className="bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center" 
          onClick={() => setStep(step - 1)}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
        </button>
      )}
      {step < 7 ? (
        <button 
          className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center" 
          onClick={() => setStep(step + 1)} 
          disabled={isNextDisabled}
        >
          Next <ArrowRightIcon className="h-5 w-5 ml-1" />
        </button>
      ) : (
        <button 
          onClick={handleCreateListing} 
          className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center"
        >
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
      <div className="flex items-center justify-between overflow-x-auto py-2 space-x-4 sm:grid sm:grid-cols-7 sm:gap-3">
        {steps.map((label, index) => {
          const isActive = index + 1 === step;
          const isCompleted = index + 1 < step;

          return (
            <div key={index} className="flex flex-col items-center space-y-0 min-w-[80px]">
              {/* Step Indicator */}
              <motion.div
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-md transition-all border-2
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

const CategoryPicker = ({
  formData,
  handleInputChange,
  categories,
  filteredSubCategories,
  filteredBrands,
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
      {/* Category Selection */}
      <div>
        {(selectedCategory || selectedSubcategory || selectedBrand) && (
          <div className="flex flex-wrap items-center space-x-3 p-3 bg-gray-100 rounded-lg text-sm">
            {selectedCategory && selectedCategory!.name && (
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
                  className={`snap-start px-4 py-2 h-12 min-w-[120px] flex items-center justify-center rounded-lg border text-sm transition-all duration-200
                    ${
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
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-all duration-200
                  ${
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

      {/* Brand Selection */}
      {filteredBrands.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Brand</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBrands.map((brand: any) => (
              <button
                key={brand}
                onClick={() => handleSelection("brand", brand)}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-all duration-200
                  ${
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
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <p className="text-sm text-gray-500 mt-1">{formData.description?.length}/500 characters</p>
        {formData.description && (
          <div className="mt-3 p-3 bg-gray-100 border-l-4 border-blue-500 rounded-lg">
            <h4 className="font-semibold text-gray-700">Preview:</h4>
            <p className="text-gray-600">{formData.description}</p>
          </div>
        )}
      </div>

      {/* Product Name */}
      <div className="relative">
        <input
          type="text"
          name="model"
          className="peer w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder=" "
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
        />
        <label
          className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
        >
          Model
        </label>
      </div>

      {/* Tags Input */}
      {/* <div>
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
      </div> */}
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

const VehicleProductForm = ({ formData, setFormData }: any) => {
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e: any) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Vehicle Product Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="make" placeholder="Make" value={formData.make} onChange={handleChange} className="input-field" required />
          <input type="text" name="model" placeholder="Model" value={formData.model} onChange={handleChange} className="input-field" required />
          <input type="number" name="year" placeholder="Year" value={formData.year} onChange={handleChange} className="input-field" required />
          <input type="text" name="trim" placeholder="Trim" value={formData.trim} onChange={handleChange} className="input-field" />
          <input type="text" name="type" placeholder="Type (SUV, Sedan)" value={formData.type} onChange={handleChange} className="input-field" required />
          <input type="text" name="color" placeholder="Color" value={formData.color} onChange={handleChange} className="input-field" />
          <input type="number" name="mileage" placeholder="Mileage (km)" value={formData.mileage} onChange={handleChange} className="input-field" />
          <select name="condition" value={formData.condition} onChange={handleChange} className="input-field">
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Certified Pre-Owned">Certified Pre-Owned</option>
          </select>
        </div>

        {/* Engine & Performance */}
        <h3 className="section-title">Engine & Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="engineType" placeholder="Engine Type" value={formData.engineType} onChange={handleChange} className="input-field" />
          <input type="text" name="engineSize" placeholder="Engine Size" value={formData.engineSize} onChange={handleChange} className="input-field" />
          <input type="text" name="transmission" placeholder="Transmission" value={formData.transmission} onChange={handleChange} className="input-field" />
          <input type="text" name="drivetrain" placeholder="Drivetrain (AWD, FWD)" value={formData.drivetrain} onChange={handleChange} className="input-field" />
        </div>

        {/* Ownership & Pricing */}
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
            <input type="checkbox" name="negotiable" checked={formData.negotiable} onChange={handleChange} className="w-5 h-5" />
            <span>Price Negotiable</span>
          </label>
        </div>

        {/* Media Uploads */}
        <h3 className="section-title">Media Uploads</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="upload-label">
            <ArrowUpOnSquareIcon className="icon w-6 h-6" />
            <span>Upload Images</span>
            <input type="file" name="images" multiple onChange={handleFileChange} className="hidden" />
          </label>
          <label className="upload-label">
            <CameraIcon className="icon w-6 h-6" />
            <span>Upload Video</span>
            <input type="file" name="video" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {/* Contact & Location */}
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

        {/* Submit Button */}
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};



