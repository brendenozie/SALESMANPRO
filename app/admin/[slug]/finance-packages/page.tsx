"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TagIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

import { useParams } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


const packageStatusOptions = ["ACTIVE", "INACTIVE", "FEATURED"] as const;

type PackageStatus = (typeof packageStatusOptions)[number];

interface ServicePackage {
  id: string;
  title: string;
  price: string;
  frequency: string;
  features: string[];
  status: PackageStatus;
  isFeatured: boolean;
}

interface FormState {
  title: string;
  price: string;
  frequency: string;
  features: string[];
  status: PackageStatus;
  isFeatured: boolean;
}

interface PageProps {
  params:Promise<{ slug: string }>
}

const PackagesPage = () => {
  const { slug: companyId } = useParams() as { slug: string };

  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<ServicePackage | null>(
    null
  );
  const [formState, setFormState] = useState<FormState>({
    title: "",
    price: "",
    frequency: "",
    features: [""],
    status: "ACTIVE",
    isFeatured: false,
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/packages?companyId=${companyId}`,
        { headers: { "Credentials" : "include" } }
      );
      const data = (await res.json()).data;
      setPackages(data.packages as ServicePackage[]);
    } catch (error) {
      // console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenModal = (pkg: ServicePackage | null = null) => {
    if (pkg) {
      setIsEditing(true);
      setCurrentPackage(pkg);
      setFormState({
        title: pkg.title,
        price: pkg.price,
        frequency: pkg.frequency,
        features: pkg.features.length > 0 ? pkg.features : [""],
        status: pkg.status,
        isFeatured: pkg.isFeatured,
      });
    } else {
      setIsEditing(false);
      setCurrentPackage(null);
      setFormState({
        title: "",
        price: "",
        frequency: "",
        features: [""],
        status: "ACTIVE",
        isFeatured: false,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof FormState;

    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;

    setFormState((prev) => ({
      ...prev,
      [fieldName]: newValue as FormState[typeof fieldName],
    }));
  };


  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formState.features];
    newFeatures[index] = value;
    setFormState((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleAddFeature = () => {
    setFormState((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = formState.features.filter((_, i) => i !== index);
    setFormState((prev) => ({
      ...prev,
      features: newFeatures.length > 0 ? newFeatures : [""],
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const packageData = {
      ...formState,
      features: formState.features.filter((f) => f.trim() !== ""),
    };

    try {
      const res = await fetch(
        isEditing
          ? `${apiBaseUrl}/admin/packages/${currentPackage?.id}`
          : `${apiBaseUrl}/admin/packages`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", "Credentials" : "include" },
          body: JSON.stringify({ ...packageData, companyId }),
        }
      );

      if (!res.ok) throw new Error("Failed to save package");

      await fetchPackages();
      setShowModal(false);
    } catch (error) {
      // console.error("Error saving package:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/admin/packages/${id}`, {
          method: "DELETE",
          headers: { "Credentials" : "include" },
        });
        if (!res.ok) throw new Error("Failed to delete package");
        await fetchPackages();
      } catch (error) {
        // console.error("Error deleting package:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
     <div className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100 font-sans">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Service Packages</h1>
              <p className="text-gray-400">Manage pricing, features, and status for your service offerings.</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New Package
            </button>
          </div>
    
          {loading ? (
            <div className="flex items-center justify-center p-10 text-gray-400">
              <ArrowPathIcon className="h-8 w-8 animate-spin mr-3" />
              Loading packages...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {packages.length > 0 && packages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700
                      ${pkg.isFeatured ? 'border-green-500 ring-4 ring-green-500/30' : ''}`}
                  >
                    {pkg.isFeatured && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 -mt-4 -mr-4 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center"
                      >
                        <StarIcon className="h-4 w-4 mr-1 text-yellow-300" /> Featured
                      </motion.div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-3xl font-bold text-white leading-tight">{pkg.title}</h4>
                    </div>
                    <p className="text-5xl font-extrabold text-green-400 mb-2">{pkg.price}</p>
                    <p className="text-blue-300 text-sm mb-6">{pkg.frequency}</p>
    
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-gray-300">
                          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
    
                    <div className="flex justify-end space-x-4">
                      <motion.button
                        onClick={() => handleOpenModal(pkg)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 rounded-full bg-gray-700 text-blue-400 hover:bg-gray-600 transition-colors"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(pkg.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 rounded-full bg-gray-700 text-red-400 hover:bg-gray-600 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
    
          {/* Modal for Creating/Editing a Package */}
          <AnimatePresence>
            {showModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-gray-100 border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-400">{isEditing ? 'Edit Package' : 'Create New Package'}</h2>
                    <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-700">
                      <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-400">Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formState.title}
                        onChange={handleFormChange}
                        required
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-400">Price</label>
                        <input
                          type="text"
                          id="price"
                          name="price"
                          value={formState.price}
                          onChange={handleFormChange}
                          required
                          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-400">Frequency</label>
                        <input
                          type="text"
                          id="frequency"
                          name="frequency"
                          value={formState.frequency}
                          onChange={handleFormChange}
                          required
                          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Features</label>
                      <div className="space-y-2">
                        {formState.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => handleFeatureChange(index, e.target.value)}
                              placeholder="e.g., Unlimited consultations"
                              className="flex-grow rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                            {formState.features.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(index)}
                                className="text-red-400 hover:text-red-300 p-1 transition-colors"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="mt-2 text-sm text-green-400 hover:text-green-300 transition-colors flex items-center"
                      >
                        <PlusCircleIcon className="h-4 w-4 mr-1" /> Add Feature
                      </button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          id="isFeatured"
                          name="isFeatured"
                          type="checkbox"
                          checked={formState.isFeatured}
                          onChange={handleFormChange}
                          className="h-4 w-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                        />
                        <label htmlFor="isFeatured" className="ml-2 block text-sm font-medium text-gray-300">
                          Mark as Featured
                        </label>
                      </div>
                      <div>
                        <label htmlFor="status" className="sr-only">Status</label>
                        <select
                          id="status"
                          name="status"
                          value={formState.status}
                          onChange={handleFormChange}
                          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          {packageStatusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        {isEditing ? 'Save Changes' : 'Create Package'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
  );
};

export default PackagesPage;
