"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion as Motion } from "framer-motion";
import heroImage from "../assets/hero_image.png";


const CommissionSection = ({ formData, handleChange }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
      <input
        type="number"
        name="commissionRate"
        value={formData.commissionRate || ""}
        onChange={handleChange}
        placeholder="Enter commission rate"
        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Commission Type</label>
      <select
        name="commissionType"
        value={formData.commissionType}
        onChange={handleChange}
        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="COST">COST</option>
        <option value="QUANTITY">QUANTITY</option>
      </select>
    </div>
  </div>
);

export default CommissionSection;
