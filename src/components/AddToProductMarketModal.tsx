import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";

interface Product {
  id?: string;
  productId?: string;
  productName?: string;
  category?: string;
  subCategory?: string;
  tags?: string[];
  brand?: string[];
  model?: string;
  color?: string[];
  size?: string[];
  weight?: string[];
  condition?: string;
  dimension?: string;
  material?: string[];
  image?: string;
  isAvailable?: boolean;
  isOnOffer?: boolean;
  isFlashDeal?: boolean;
  isNewArrival?: boolean;
  isDiscounted?: boolean;
  isFeatured?: boolean;
}

interface AddToProductMarketModalProps {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (value: boolean) => void;
  product: Product;
  sellerId: string;
  sellerType: string;
}

const AddToProductMarketModal: React.FC<AddToProductMarketModalProps> = ({
  showRequestProductModal,
  setShowRequestProductModal,
  product,
  sellerId,
  sellerType,
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const [quantity, setQuantity] = useState(1);
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);

  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(
    product.category || localStorage.getItem("lastCategory") || ""
  );
  const [selectedBrand, setSelectedBrand] = useState(
    product.brand?.[0] || localStorage.getItem("lastBrand") || ""
  );

  const [imagePreview, setImagePreview] = useState<string | null>(product.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/categories`);
        const data = await res.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories & brands when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchSubCategoriesAndBrands = async () => {
      try {
        const res = await fetch(`${apiUrl}/categories/${selectedCategory}`);
        const data = await res.json();
        setSubCategories(data.subCategories);
        setBrands(data.brands);
      } catch (error) {
        console.error("Error fetching subcategories/brands:", error);
      }
    };
    fetchSubCategoriesAndBrands();
  }, [selectedCategory]);

  // Calculate final price & profit margin
  useEffect(() => {
    if (buyingPrice > 0 && sellingPrice > 0) {
      const margin = ((sellingPrice - buyingPrice) / buyingPrice) * 100;
      setProfitMargin(margin);
    }
    const discountAmount = (sellingPrice * discount) / 100;
    setFinalPrice(sellingPrice - discountAmount);
  }, [buyingPrice, sellingPrice, discount]);

  // Save category & brand selections
  useEffect(() => {
    localStorage.setItem("lastCategory", selectedCategory);
    localStorage.setItem("lastBrand", selectedBrand);
  }, [selectedCategory, selectedBrand]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreateListing = async () => {
    if (quantity <= 0 || buyingPrice <= 0 || sellingPrice <= 0) {
      alert("Please enter valid values for quantity and prices.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("sellerId", sellerId);
      formData.append("sellerType", sellerType);
      formData.append("productId", product.id || product.productId || "");
      formData.append("quantity", quantity.toString());
      formData.append("buyingPrice", buyingPrice.toString());
      formData.append("sellingPrice", sellingPrice.toString());
      formData.append("discount", discount.toString());
      formData.append("finalPrice", finalPrice.toString());
      formData.append("category", selectedCategory);
      formData.append("brand", selectedBrand);
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch(`${apiUrl}/clients/addToMarketList`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create marketplace listing.");

      alert("Marketplace listing created successfully.");
      setShowRequestProductModal(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Modal
      isOpen={showRequestProductModal}
      onClose={() => setShowRequestProductModal(false)}
      title={`Create Listing for ${product.productName || "Product"}`}
    >
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-md text-black">
        {/* Category Selection */}
        <label>Category</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Brand Selection */}
        <label>Brand</label>
        <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} disabled={!brands.length}>
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        {/* Image Upload */}
        <label>Product Image</label>
        <input type="file" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 mt-2" />}

        {/* Prices & Discounts */}
        <input type="number" placeholder="Selling Price" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} />
        <input type="number" placeholder="Discount (%)" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        <p>Final Price: ${finalPrice.toFixed(2)}</p>
        <p>Profit Margin: {profitMargin.toFixed(2)}%</p>

        <button onClick={handleCreateListing} className="bg-blue-600 text-white py-2 px-4 rounded-lg">
          Submit Listing
        </button>
      </div>
    </Modal>
  );
};

export default AddToProductMarketModal;
