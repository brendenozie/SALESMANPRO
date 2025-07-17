"use client";
import React from "react";



interface CommissionSectionProps {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

const CommissionSection: React.FC<CommissionSectionProps> = ({ formData, onChange }) => {
  const inputClasses =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (KES)
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price ?? ""}
          onChange={(e) => onChange("price", parseFloat(e.target.value) || "")}
          placeholder="e.g. 25000"
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
          Discount (%)
        </label>
        <input
          type="number"
          id="discount"
          name="discount"
          value={formData.discount ?? ""}
          onChange={(e) => onChange("discount", parseFloat(e.target.value) || "")}
          placeholder="e.g. 10"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">
          Commission Rate (%)
        </label>
        <input
          type="number"
          id="commissionRate"
          name="commissionRate"
          value={formData.commissionRate ?? ""}
          onChange={(e) => onChange("commissionRate", parseFloat(e.target.value) || "")}
          placeholder="e.g. 15"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
          Tax Rate (%)
        </label>
        <input
          type="number"
          id="taxRate"
          name="taxRate"
          value={formData.taxRate ?? ""}
          onChange={(e) => onChange("taxRate", parseFloat(e.target.value) || "")}
          placeholder="e.g. 5"
          className={inputClasses}
        />
      </div>
    </div>
  );
};

export default CommissionSection;


// import { useSession } from "next-auth/react";
// import Image from "next/image";
// import { motion as Motion } from "framer-motion";
// import heroImage from "../assets/hero_image.png";


// const CommissionSection = ({ formData, handleChange }: any) => (
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//     <div>
//       <label className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
//       <input
//         type="number"
//         name="commissionRate"
//         value={formData.commissionRate || ""}
//         onChange={handleChange}
//         placeholder="Enter commission rate"
//         className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//       />
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700">Commission Type</label>
//       <select
//         name="commissionType"
//         value={formData.commissionType}
//         onChange={handleChange}
//         className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//       >
//         <option value="COST">COST</option>
//         <option value="QUANTITY">QUANTITY</option>
//       </select>
//     </div>
//   </div>
// );

// export default CommissionSection;
