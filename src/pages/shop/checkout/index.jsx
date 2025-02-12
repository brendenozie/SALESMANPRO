import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStateContext } from '../../../contexts/ContextProvider';
import Confetti from 'react-confetti';
import { CreditCardIcon, TruckIcon, TrashIcon, CheckCircleIcon,CalendarIcon } from '@heroicons/react/24/outline';
import { formatCreditCardNumber, formatExpirationDate, formatCVC } from "../../../data/cardFormatter";
import Image from 'next/image';

const CheckoutPage = () => {
  const { cart, removeItem } = useStateContext();
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
    paymentMethod: 'card',
    shipping: 'standard'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [error, setError] = useState({});
  const [discount, setDiscount] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  
  useEffect(() => {
    const today = new Date();
    let deliveryDate = new Date();
    deliveryDate.setDate(today.getDate() + (formData.shipping === 'express' ? 2 : 5));
    setEstimatedDelivery(deliveryDate.toDateString());
  }, [formData.shipping]);

  useEffect(() => {
    const updateSize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === "cardNumber") formattedValue = formatCreditCardNumber(value);
    if (name === "expiry") formattedValue = formatExpirationDate(value);
    if (name === "cvv") formattedValue = formatCVC(value);
    
    setFormData({ ...formData, [name]: formattedValue });
    if (error[name]) setError({ ...error, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    ['name', 'email', 'address', 'city', 'zip'].forEach(field => {
      if (!formData[field]) newErrors[field] = `${field} is required.`;
    });
    if (formData.paymentMethod === 'card') {
      ['cardNumber', 'expiry', 'cvv'].forEach(field => {
        if (!formData[field]) newErrors[field] = `${field} is required.`;
      });
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const subtotal = cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
  const shippingCost = formData.shipping === 'express' ? 15 : 5;
  const total = (subtotal + shippingCost) * (1 - discount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 md:p-12 flex justify-center items-center">
      {isOrderPlaced && <Confetti width={windowSize.width} height={windowSize.height} />}  
      <motion.div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-8 grid md:grid-cols-2 gap-8 overflow-hidden">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-gray-800">Order Summary</h2>
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-semibold text-gray-700">{item.newName}</h3>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-gray-700">${(item.sellingPrice * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 transition"><TrashIcon className="w-5 h-5" /></button>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-4 text-lg font-bold text-gray-800">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>Estimated Delivery: {estimatedDelivery}</span>
          </div>
          <div className="mt-4 text-xl font-bold flex justify-between text-gray-800">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-3xl font-extrabold text-gray-800">Billing Details</h2>
          {['name', 'email', 'address', 'city', 'zip'].map(field => (
            <input key={field} type="text" name={field} value={formData[field]} onChange={handleChange} placeholder={field} className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200" />
          ))}
          
          <div>
            <h3 className="font-semibold text-gray-700">Payment Method</h3>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg shadow-sm cursor-pointer">
                <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} />
                <CreditCardIcon className="w-6 h-6 text-indigo-600" /> Credit/Debit Card
              </label>
              <label className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg shadow-sm cursor-pointer">
                <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} />
                <TruckIcon className="w-6 h-6 text-indigo-600" /> Cash on Delivery
              </label>
            </div>
          </div>
          
          {formData.paymentMethod === 'card' && (
            <div className="space-y-3">
              <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="Card Number" className="w-full p-3 border rounded-lg shadow-sm" />
              <div className="flex gap-3">
                <input type="text" name="expiry" value={formData.expiry} onChange={handleChange} placeholder="MM/YY" className="w-1/2 p-3 border rounded-lg shadow-sm" />
                <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="CVV" className="w-1/2 p-3 border rounded-lg shadow-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="saveCard" onChange={(e) => setSaveCard(e.target.checked)} />
                <span>Save card for future purchases</span>
              </label>

            </div>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full py-3 rounded-lg text-lg font-semibold shadow-lg transition ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {isSubmitting ? 'Processing...' : <>Place Order <CheckCircleIcon className="inline w-6 h-6 ml-2" /></>}
          </button>
       </form>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
