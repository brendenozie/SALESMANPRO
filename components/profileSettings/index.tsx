import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PencilIcon,
  CheckCircleIcon,
  CameraIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import axios from "axios";

const ProfileSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session, update: updateSession } = useSession();

  const [profile, setProfile] = useState({
    name: session?.user?.name || "",
    username: (session?.user as any)?.username || "",
    email: session?.user?.email || "",
    phone: (session?.user as any)?.phone || "",
    bio: (session?.user as any)?.bio || "",
    address: (session?.user as any)?.address || "",
    profilePicture: session?.user?.image || (session?.user as any)?.profilePicture || "",
  });

  // Fetch full user record from database on mount
  useEffect(() => {
    let mounted = true;
    axios
      .get("/api/user/profile")
      .then((res) => {
        if (mounted && res.data?.user) {
          const u = res.data.user;
          setProfile((prev) => ({
            ...prev,
            name: u.name || prev.name,
            username: u.username || prev.username,
            email: u.email || prev.email,
            phone: u.phone || prev.phone,
            bio: u.bio || prev.bio,
            address: u.address || prev.address,
            profilePicture: u.profilePicture || u.image || prev.profilePicture,
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch fresh user profile:", err);
      });
    return () => {
      mounted = false;
    };
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const localUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, profilePicture: localUrl }));
    setUploadingImage(true);

    try {
      // 1. Request presigned upload URL from /api/upload-url
      const presignRes = await axios.get("/api/upload-url", {
        params: {
          filename: file.name,
          type: "image",
          contentType: file.type,
        },
      });

      const { uploadUrl, publicUrl } = presignRes.data;

      // 2. Upload file directly to S3
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      // 3. Update state and immediately persist avatar to profile
      setProfile((prev) => ({ ...prev, profilePicture: publicUrl }));
      await axios.put("/api/user/profile", {
        avatarUrl: publicUrl,
        profilePicture: publicUrl,
      });

      if (updateSession) {
        await updateSession({ image: publicUrl });
      }

      setStatusMessage({ type: "success", text: "Profile picture updated!" });
    } catch (err) {
      console.warn("S3 direct upload failed, fallback to local preview:", err);
      // Fallback: convert to base64 if S3 upload failed
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          await axios.put("/api/user/profile", {
            avatarUrl: base64data,
            profilePicture: base64data,
          });
          setProfile((prev) => ({ ...prev, profilePicture: base64data }));
          setStatusMessage({ type: "success", text: "Avatar saved successfully." });
        } catch {
          setStatusMessage({
            type: "error",
            text: "Failed to save profile picture.",
          });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const response = await axios.put("/api/user/profile", {
        name: profile.name,
        username: profile.username,
        phone: profile.phone,
        bio: profile.bio,
        address: profile.address,
        avatarUrl: profile.profilePicture,
      });

      if (updateSession) {
        await updateSession({
          name: profile.name,
          image: profile.profilePicture,
        });
      }

      setStatusMessage({
        type: "success",
        text: response.data.message || "Profile updated successfully!",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setStatusMessage({
        type: "error",
        text: error?.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const avatarDisplay =
    profile.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.name || "User"
    )}&background=EAB308&color=fff&bold=true`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700/60"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 dark:border-gray-700/60 pb-6">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <img
            src={avatarDisplay}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-yellow-400/30 shadow-md transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
            {uploadingImage ? (
              <ArrowPathIcon className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <CameraIcon className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">Change</span>
              </>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {profile.name || "Anonymous Member"}
          </h2>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
            {profile.username ? `@${profile.username}` : profile.email}
          </p>
          <div className="mt-3 flex items-center justify-center sm:justify-start gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-bold rounded-xl shadow-md hover:from-yellow-500 hover:to-yellow-600 transition-all transform active:scale-95 flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <CheckCircleIcon className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <PencilIcon className="w-4 h-4" /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800"
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
            }`}
          >
            {statusMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 space-y-4">
        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProfile();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700/80 dark:border-gray-600 dark:text-white outline-none transition-all"
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700/80 dark:border-gray-600 dark:text-white outline-none transition-all"
                  placeholder="e.g. johndoe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700/80 dark:border-gray-600 dark:text-white outline-none transition-all"
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Delivery / Street Address
              </label>
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700/80 dark:border-gray-600 dark:text-white outline-none transition-all"
                placeholder="e.g. Westlands, Nairobi"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Bio / Preferences
              </label>
              <textarea
                name="bio"
                rows={3}
                value={profile.bio}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700/80 dark:border-gray-600 dark:text-white outline-none transition-all"
                placeholder="Tell sellers about your delivery preferences or notes..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white py-3.5 rounded-xl font-bold transition-all transform active:scale-98 shadow-md flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60">
              <span className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Email Address</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.email || "Not provided"}</span>
            </div>
            <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60">
              <span className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Phone Number</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.phone || "Not set"}</span>
            </div>
            <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 sm:col-span-2">
              <span className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Primary Delivery Address</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.address || "No address set (Use Addresses tab to pick on map)"}</span>
            </div>
            {profile.bio && (
              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 sm:col-span-2">
                <span className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Bio</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{profile.bio}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
