import React, { useState, useEffect, useMemo, useRef } from "react";
import Modal from "./Modal";
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

const ImagesStep = ({ formData, images, setImages, newImages, setNewImages }: any) => {
  const [loading, setLoading] = useState(false);

  // Function to rearrange images and reassign index values
  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages((prev: any) => {
      const updatedImages = [...prev];
      const [movedImage] = updatedImages.splice(fromIndex, 1);
      updatedImages.splice(toIndex, 0, movedImage);
      // Reassign indexes to ensure order is maintained
      return updatedImages.map((img, index) => ({ ...img, index }));
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setLoading(true);
      setTimeout(() => {
        // Create new image objects with a unique id, file preview URL, and proper index
        const newImageObjects = acceptedFiles.map((file, i) => ({
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file),
          index: images.length + i, // Append at the end with proper index
          file, // Optional: keep a reference for upload
        }));

        // Append the new images to the current images array
        setImages((prev: any) => [...prev, ...newImageObjects]);
        // Append the new files to newImages state for upload purposes
        setNewImages((prev: any) => [...prev, ...acceptedFiles]);
        setLoading(false);
      }, 1000);
    },
  });

  const removeImage = (index: number) => {
    // Remove image from the preview list and reassign indexes
    setImages((prev: any) => {
      const updatedImages = prev.filter((_: any, i: number) => i !== index)
                                  .map((img: any, newIndex: any) => ({ ...img, index: newIndex }));
      return updatedImages;
    });

    // Optionally, remove from newImages (if it's not already uploaded)
    setNewImages((prev: any) => {
      // Here, we assume that images not yet uploaded have a matching file object.
      // Adjust the removal logic as needed based on your upload implementation.
      return prev.filter((_: any, i: number) => i !== index);
    });
  };

  const handleDeleteImage = (imgUrl: string) => {
    // Remove image from the preview list and reassign indexes
    setImages((prev: any) => {
      const updatedImages = prev.filter((img: any) => img.url !== imgUrl)
                                  .map((img: any, newIndex: any) => ({ ...img, index: newIndex }));
      return updatedImages;
    });

    // If the image is a new blob URL, remove its corresponding file from newImages
    if (imgUrl.startsWith("blob:")) {
      setNewImages((prev: any) =>
        prev.filter((file: any) => !imgUrl.includes(file.name))
      );
    }
  };

  return (
    <div className="p-6">
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
          {images
            .sort((a: any, b: any) => a.index - b.index)
            .map((img: any, index: number) => (
              <motion.div
                key={img.id || index} // Use img.id if available, otherwise index
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <img
                  src={img.url} // img.url is now a string from the backend
                  alt={img.name || `${img.url} Uploaded image`}
                  className="h-24 w-full object-cover rounded-lg"
                />
                <div className="absolute top-1 right-1 flex flex-col space-y-1">
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, index - 1)}
                      className="bg-blue-500 text-white p-1 rounded"
                    >
                      ⬆
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => moveImage(index, index + 1)}
                      className="bg-blue-500 text-white p-1 rounded"
                    >
                      ⬇
                    </button>
                  )}
                  <button
                    className="bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
                    onClick={() => removeImage(index)}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          {/* {images
            .sort((a: any, b: any) => a.index - b.index)
            .map((img: any, index: number) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <img
                  src={img.url}
                  alt={img.name || `${img.url} Uploaded image`}
                  className="h-24 w-full object-cover rounded-lg"
                />
                <div className="absolute top-1 right-1 flex flex-col space-y-1">
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, index - 1)}
                      className="bg-blue-500 text-white p-1 rounded"
                    >
                      ⬆
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => moveImage(index, index + 1)}
                      className="bg-blue-500 text-white p-1 rounded"
                    >
                      ⬇
                    </button>
                  )}
                  <button
                    className="bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
                    onClick={() => removeImage(index)}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))} */}
        </div>
      )}
    </div>
  );
};

export default ImagesStep;
