"use client";

import React, { useEffect, useCallback } from "react";
import InputField from "./InputField";

// A generic pricing details component supporting both ProductForm and MarketListingForm
export interface PropertyTypeDetailsProps<T> {
  formData: T;
  setFormData: (name: keyof T, value: any) => void;
}

function PropertyTypeDetails<T extends Record<string, any>>({ formData, setFormData }: PropertyTypeDetailsProps<T>){
  // Change handler
    const handleChange = useCallback(
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        const { name, value, type } = e.target;
        const parsed = type === "number" ? (value === "" ? "" : parseFloat(value)) : value;
        setFormData(name as keyof T, parsed);
      },
      [setFormData]
    );

  const handleBedroomChange = (index: number, field: string, value: string) => {
    const updatedBedrooms = formData.bedrooms.map((bedroom: any, i: number) =>
      i === index ? { ...bedroom, [field]: value } : bedroom
    );
    setFormData("bedrooms" as keyof T, updatedBedrooms);
    
  };

  const handleAddBedroom = () => {
    const updatedBedrooms = [
      ...formData.bedrooms,
      { type: "", size: "", price: "" },
    ];
    setFormData("bedrooms" as keyof T, updatedBedrooms);
  };

  const handleRemoveBedroom = (index: number) => {
    const updatedBedrooms = formData.bedrooms.filter((_: any, i: number) => i !== index);
    setFormData("bedrooms" as keyof T, updatedBedrooms);
  };

  //studio 
  //studio 
  const handleStudioChange = (index: number, field: string, value: string) => {
    const updatedStudios = formData.studios.map((studio: any, i: number) =>
      i === index ? { ...studio, [field]: value } : studio
    );
    setFormData("studios" as keyof T, updatedStudios);
  };

  const handleAddStudio = () => {
    const updatedStudios = [
      ...formData.studios,
      { type: "", size: "", price: "" },
    ];
    setFormData("studios" as keyof T, updatedStudios);
  };

  const handleRemoveStudio = (index: number) => {
    const updatedStudios = formData.studios.filter((_: any, i: number) => i !== index);
    setFormData("studios" as keyof T, updatedStudios);
  };
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Additional Property Details</h3>
      {formData.studios?.map((studio: any, index: number) => (
        <div key={index} className="mb-4 border p-3 rounded-lg">
          <label className="block text-sm font-medium">Studio Type</label>
          <input
            type="text"
            value={studio.type}
            onChange={(e) => handleStudioChange(index, "type", `${e.target.value}`)}
            className="w-full p-2 border rounded mt-1"
            placeholder="e.g. Studio A, Studio B, Studio c"
          />
          {/* <input 
            type="text"
            min="1"
            value={studio.type.replace(/\D/g, "")} // Ensure only the number is shown
            onChange={(e) => {
              const value = parseInt(e.target.value, 10) || 1; // Ensure a valid number
              const formattedValue = value === 1 ? "1 Bedroom" : `${value} Bedrooms`;
              handleBedroomChange(index, "type", formattedValue);
            }}
            className="w-full p-2 border rounded mt-1"
            placeholder="Enter Studio Type"
          /> */}

          <label className="block text-sm font-medium mt-2">size in sq m</label>
          <input
            type="number"
            value={studio.size}
            onChange={(e) => handleStudioChange(index, "size", e.target.value)}
            className="w-full p-2 border rounded mt-1"
            placeholder="Enter the property size"
          />
          <label className="block text-sm font-medium mt-2">Price (Ksh)</label>
          {/* <input
            type="number"
            value={bedroom.price}
            onChange={(e) => handleBedroomChange(index, "price", e.target.value)}
            className="w-full p-2 border rounded mt-1"
            placeholder="Enter lowest price"
          /> */}
          <input
            type="text"
            value={studio.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} // Format with commas
            onChange={(e) => {
              const rawValue = e.target.value.replace(/,/g, ""); // Remove commas
              if (!isNaN(Number(rawValue)) && Number(rawValue) >= 0) {
                handleStudioChange(index, "price", rawValue);
              }
            }}
            className="w-full p-2 border rounded mt-1"
            placeholder="Enter lowest price"
          />

          
          {formData.studios.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveStudio(index)}
              className="mt-2 text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddStudio}
        className="text-blue-500 text-sm hover:underline"
      >
        + Add More Studios
      </button>

      {formData.bedrooms.map((bedroom: any, index: number) => (
        <div key={index} className="mb-4 border p-3 rounded-lg">
          <label className="block text-sm font-medium">Bedroom Type</label>
          {/* <input
            type="text"
            value={bedroom.type}
            onChange={(e) => handleBedroomChange(index, "type", `${e.target.value} +" Bedroom"`)}
            className="w-full p-2 border rounded mt-1"
            placeholder="e.g. 1 Bedroom, 2 Bedroom..."
          /> */}
          <input 
            type="number"
            min="1"
            value={bedroom.type.replace(/\D/g, "")} // Ensure only the number is shown
            onChange={(e) => {
              const value = parseInt(e.target.value, 10) || 1; // Ensure a valid number
              const formattedValue = value === 1 ? "1 Bedroom" : `${value} Bedrooms`;
              handleBedroomChange(index, "type", formattedValue);
            }}
            className="w-full p-2 border rounded mt-1"
            placeholder="Enter number of bedrooms"
          />

          <label className="block text-sm font-medium mt-2">size in sq m</label>
          <input
            type="number"
            value={bedroom.size}
            onChange={(e) => handleBedroomChange(index, "size", e.target.value)}
            className="w-full p-2 border rounded mt-1"
            placeholder="Enter the property size"
          />
          <label className="block text-sm font-medium mt-2">Price (Ksh)</label>
          {/* <input
            type="number"
            value={bedroom.price}
            onChange={(e) => handleBedroomChange(index, "price", e.target.value)}
            className="w-full p-2 border rounded mt-1"
            placeholder="Enter lowest price"
          /> */}
          <input
            type="text"
            value={bedroom.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} // Format with commas
            onChange={(e) => {
              const rawValue = e.target.value.replace(/,/g, ""); // Remove commas
              if (!isNaN(Number(rawValue)) && Number(rawValue) >= 0) {
                handleBedroomChange(index, "price", rawValue);
              }
            }}
            className="w-full p-2 border rounded mt-1"
            placeholder="Enter lowest price"
          />

          
          {formData.bedrooms.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveBedroom(index)}
              className="mt-2 text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddBedroom}
        className="text-blue-500 text-sm hover:underline"
      >
        + Add More Bedrooms
      </button>
      {/* <input
        type="text"
        name="bathrooms"
        placeholder="1,2,3 Bathrooms, comma separated"
        value={formData.bathrooms}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, bathrooms: e.target.value }))}
        className="input-field"
      />
      <input
        type="text"
        name="area"
        placeholder="Area (sq ft)"
        value={formData.area}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, area: e.target.value }))}
        className="input-field"
      /> */}
    </div>
  );
};

export default PropertyTypeDetails;
