import React,{ useState } from 'react';
import { PlusIcon, MinusIcon,PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '../../contexts/ContextProvider';
import { useRouter } from 'next/router';

const ShippingAddress = () => {
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddAddress = () => {
    if (newAddress.trim() !== '') {
      setAddresses([...addresses, { address: newAddress, isDefault: addresses.length === 0 }]);
      setNewAddress('');
    }
  };

  const handleEditAddress = (index, updatedAddress) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index].address = updatedAddress;
    setAddresses(updatedAddresses);
    setEditingIndex(null);
  };

  const handleDeleteAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  };

  const handleSetDefault = (index) => {
    const updatedAddresses = addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }));
    setAddresses(updatedAddresses);
  };

  return (
    <div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow"
        onClick={() => setIsAddressBookOpen(true)}
      >
        Manage Addresses
      </button>

      <AnimatePresence>
        {isAddressBookOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddressBookOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 w-96 p-6 rounded-xl shadow-2xl overflow-y-auto"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Address Book</h2>
                <XMarkIcon
                  className="w-6 h-6 text-gray-500 hover:text-red-500 cursor-pointer"
                  onClick={() => setIsAddressBookOpen(false)}
                />
              </div>

              <div className="space-y-4">
                {addresses.map((addr, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    {editingIndex === index ? (
                      <input
                        className="flex-1 mr-2 p-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        value={addr.address}
                        onChange={(e) => handleEditAddress(index, e.target.value)}
                      />
                    ) : (
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{addr.address}</p>
                        {addr.isDefault && <span className="text-sm text-green-500">Default</span>}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {editingIndex === index ? (
                        <CheckIcon
                          className="w-5 h-5 text-green-500 cursor-pointer"
                          onClick={() => setEditingIndex(null)}
                        />
                      ) : (
                        <PencilIcon
                          className="w-5 h-5 text-blue-500 cursor-pointer"
                          onClick={() => setEditingIndex(index)}
                        />
                      )}
                      <TrashIcon
                        className="w-5 h-5 text-red-500 cursor-pointer"
                        onClick={() => handleDeleteAddress(index)}
                      />
                      {!addr.isDefault && (
                        <button
                          className="text-xs text-blue-500 hover:underline"
                          onClick={() => handleSetDefault(index)}
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    placeholder="Add new address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    onClick={handleAddAddress}
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShippingAddress;

