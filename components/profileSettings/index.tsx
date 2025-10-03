import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PencilIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

const ProfileSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = useSession();

  const [profile, setProfile] = useState({
    name: session?.user?.name || "",
    username: session?.user?.username || "",
    email: session?.user?.email || "",
    phone: session?.user?.phone || "",
    bio: session?.user?.bio || "",
    address: session?.user?.address || "",
    profilePicture: session?.user?.image || "https://via.placeholder.com/150",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleUpdateProfile = async () => {
    try {
      const role = session?.user?.role?.toLowerCase() || "consumer"; // fallback to consumer
      const endpoint = `${apiBaseUrl}/shop/${role}/updateProfile`;

      const response = await axios.put(endpoint, profile);
      alert(response.data.message);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 backdrop-blur-md bg-opacity-70 dark:bg-opacity-60"
    >
      <div className="flex items-center gap-6">
        <div className="relative group">
          <img
            src={profile.profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PencilIcon className="text-white w-6 h-6" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">{profile.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-transform transform hover:scale-105 flex items-center gap-2"
          >
            {isEditing ? <CheckCircleIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isEditing ? (
          <form className="space-y-4">
            {(["name", "username", "email", "phone", "address"] as Array<keyof typeof profile>).map((field) => (
              <input
                key={field}
                type={field === "email" ? "email" : "text"}
                name={field}
                value={profile[field]}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Bio"
            ></textarea>
            <button
              type="button"
              onClick={handleUpdateProfile}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-3 rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-transform transform hover:scale-105"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Bio:</strong> {profile.bio}</p>
            <p><strong>Address:</strong> {profile.address}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
