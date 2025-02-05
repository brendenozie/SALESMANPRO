import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProfileSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    username: 'johndoe123',
    email: 'johndoe@example.com',
    phone: '+1234567890',
    bio: 'Passionate about tech and design.',
    address: '123 Main Street, City, Country',
    profilePicture: 'https://via.placeholder.com/150'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  return ( 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-2xl p-6 backdrop-blur-md bg-opacity-60"
        >          
            <div>
              <div className="flex items-center gap-6">
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover shadow-md"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
          <p className="text-gray-500">@{profile.username}</p>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-2 px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-300 transition-transform transform hover:scale-105"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isEditing ? (
          <form className="space-y-4">
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-400"
              placeholder="Full Name"
            />
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-400"
              placeholder="Username"
            />
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-400"
              placeholder="Email"
            />
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-400"
              placeholder="Phone Number"
            />
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-400"
              placeholder="Bio"
            ></textarea>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-400"
              placeholder="Address"
            />
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-full bg-yellow-400 text-white py-3 rounded-md hover:bg-yellow-300 transition-transform transform hover:scale-105"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Bio:</strong> {profile.bio}</p>
            <p><strong>Address:</strong> {profile.address}</p>
          </div>
        )}
      </div>
    </div>
        </motion.div>
)};

export default ProfileSettings;
