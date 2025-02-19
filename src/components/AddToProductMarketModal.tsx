import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Modal from "../components/Modal";
import { useDropzone, Accept } from "react-dropzone";
import { debounce } from "lodash";
import { motion } from "framer-motion";
// import { Loader, Image, Tag, DollarSign } from "lucide-react";4
import { ArrowUpCircleIcon, PhotoIcon, TagIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

const AddToProductMarketModal = ({
  showRequestProductModal,
  setShowRequestProductModal,
  product,
}: any) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    quantity: 1,
    buyingPrice: "",
    sellingPrice: "",
    discount: "",
    finalPrice: 0,
    profitMargin: 0,
    category: product.category || localStorage.getItem("lastCategory") || "",
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
    if (!formData.category.length) return [];
    return Array.from(
      new Set(formData.category.flatMap((category : any) => category?.subcategories || []))
    );
  }, [formData.category]);

  const filteredBrands = useMemo(() => {
    if (!formData.category.length) return [];
    return Array.from(
      new Set(formData.category.flatMap((category:any) => category?.allBrands || []))
    );
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
    (step === 3 && (!formData.buyingPrice || !formData.sellingPrice));

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] } as Accept,
    multiple: true,
    onDrop: (acceptedFiles) => {
      setLoading(true);
      setTimeout(() => {
        setImages((prev) => {
          const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
          return Array.from(new Set([...prev, ...newImages]));
        });
        setLoading(false);
      }, 1000);
    },
  });

  const handleCreateListing = () => {
    if (window.confirm("Are you sure you want to create this listing?")) {
      alert("Marketplace listing created successfully.");
      setShowRequestProductModal(false);
    }
  };

  return (
    <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)}>
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-md text-black">
        <div className="relative w-full h-2 bg-gray-300 rounded-full overflow-hidden">
          <motion.div className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
        <div className="flex items-center space-x-2">
          {["Category", "Images", "Pricing"].map((label, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                  index + 1 <= step ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
              <p className={`text-xs ${index + 1 <= step ? "text-blue-600" : "text-gray-400"}`}>{label}</p>
            </div>
          ))}
        </div>
        

        {step === 1 && (
          <>
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleInputChange}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          

            {/* Subcategory Selection */}
            <label>Subcategory</label>
            <select  value={filteredSubCategories} onChange={handleInputChange} disabled={!subCategories.length}>
              <option value="">Select Subcategory</option>
              {filteredSubCategories.map((sub) => (
                <option key={sub.id} value={sub}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* Brand Selection */}
            <label>Brand</label>
            <select value={brands} onChange={handleInputChange} disabled={!brands.length}>
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
              </>
            )}

        {step === 2 && (
            <div {...getRootProps()} className="border-2 border-dashed p-6 rounded-lg cursor-pointer">
              <input {...getInputProps()} />
              {loading ? <ArrowUpCircleIcon className="animate-spin w-4 h-4" /> : <p>Drag & drop images here, or click to upload</p>}
              <div className="flex space-x-2 mt-2">
                {images.map((img, index) => (
                  <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="relative">
                      <img src={img} alt="Preview" className="h-20 rounded-lg shadow" />
                      <button className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full" onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}>✕</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        {step === 3 && (
          <>
            <label>Pricing Details</label>
            <input type="number" name="buyingPrice" value={formData.buyingPrice} onChange={handleInputChange} placeholder="Buying Price" />
            <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} placeholder="Selling Price" />
            <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} placeholder="Discount (%)" />
            <p>Final Price: ${formData.finalPrice.toFixed(2)}</p>
            <p>Profit Margin: {formData.profitMargin.toFixed(2)}%</p>
          </>
        )}

        <div className="flex justify-between">
          {step > 1 && <button className="bg-gray-400 text-white py-2 px-4 rounded-lg" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 3 && <button className="bg-blue-600 text-white py-2 px-4 rounded-lg" onClick={() => setStep(step + 1)} disabled={!formData.category && step === 1}>Next</button>}
          {step === 3 && <button className="bg-green-600 text-white py-2 px-4 rounded-lg" onClick={handleCreateListing}>Create Listing</button>}
        </div>
      </motion.div>      
      </div>
    </Modal>
  );
};

export default AddToProductMarketModal;
