import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStateContext } from '../../../contexts/ContextProvider';
import Confetti from 'react-confetti';
import { CreditCardIcon, EnvelopeIcon,MapPinIcon, UserIcon, BeakerIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCreditCardNumber, formatExpirationDate, formatCVC } from "../../../data/cardFormatter";

import Image from 'next/image';

const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width || 800}`]; // Default width to 800 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join("&")}`;
};

const CheckoutPage = () => {
  const { cart, updateQuantity, removeItem, cartSubtotal } = useStateContext();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    promoCode: '',
    notes: '',
    saveInfo: false,
    shipping: 'standard'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [error, setError] = useState({});
  const [discount, setDiscount] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;
    if (name === "cardNumber") formattedValue = formatCreditCardNumber(value);
    if (name === "expiry") formattedValue = formatExpirationDate(value);
    if (name === "cvv") formattedValue = formatCVC(value);

    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : formattedValue });
    if (error[name]) setError({ ...error, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    ['name', 'email', 'address', 'city', 'zip', 'cardNumber', 'expiry', 'cvv'].forEach(field => {
      if (!formData[field]) newErrors[field] = `${field} is required.`;
    });
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyPromoCode = () => {
    if (formData.promoCode === 'DISCOUNT10') {
      setDiscount(0.1);
    } else {
      alert('Invalid promo code');
      setDiscount(0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsOrderPlaced(true);
        setIsSubmitting(false);
      }, 2000);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = formData.shipping === 'express' ? 15 : formData.shipping === 'nextDay' ? 25 : 5;
  const total = (subtotal + shippingCost) * (1 - discount);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {isOrderPlaced && <Confetti width={windowSize.width} height={windowSize.height} />}  
      <motion.div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 sticky top-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b pb-2">
              {/* <Image src={item.image} loader={loaderProp} alt={item.name} width={64} height={64} className="rounded-md" /> */}
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm">Qty: {item.quantity}</p>
              </div>
              <p>${(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeItem(item.id)} className="text-red-500"><TrashIcon /></button>
            </div>
          ))}
          <div className="mt-4">
            <input type="text" name="promoCode" value={formData.promoCode} onChange={handleChange} placeholder="Promo Code" className="w-full p-2 border rounded-md" />
            <button onClick={applyPromoCode} className="w-full mt-2 bg-blue-500 text-white py-2 rounded-md">Apply</button>
          </div>
          <div className="mt-4 text-lg font-bold flex justify-between">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Billing Details</h2>
          {['name', 'email', 'address', 'city', 'zip'].map(field => (
            <input key={field} type="text" name={field} value={formData[field]} onChange={handleChange} placeholder={field} className="w-full p-3 border rounded-md" />
          ))}
          <div>
            <label>Card Details</label>
            <div className="flex gap-2">
              <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="Card Number" className="w-2/3 p-3 border rounded-md" />
              <input type="text" name="expiry" value={formData.expiry} onChange={handleChange} placeholder="MM/YY" className="w-1/3 p-3 border rounded-md" />
              <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="CVV" className="w-1/4 p-3 border rounded-md" />
            </div>
          </div>
          <button type="submit" className="w-full bg-yellow-400 text-white py-3 rounded-md">Place Order</button>
        </form>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;

