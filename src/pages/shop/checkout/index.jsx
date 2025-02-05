import { useState,useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStateContext } from '../../../contexts/ContextProvider';
import Confetti from 'react-confetti';

const CheckoutPage = () => {
  
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem,cartSubtotal } = useStateContext();

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
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (error[name]) setError({ ...error, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.address) newErrors.address = 'Address is required.';
    if (!formData.city) newErrors.city = 'City is required.';
    if (!formData.zip) newErrors.zip = 'ZIP code is required.';
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required.';
    if (!formData.expiry) newErrors.expiry = 'Expiry date is required.';
    if (!formData.cvv) newErrors.cvv = 'CVV is required.';
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyPromoCode = () => {
    if (formData.promoCode === 'DISCOUNT10') {
      setDiscount(0.1); // 10% discount
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto bg-white backdrop-blur-md bg-opacity-60 rounded-2xl shadow-xl p-6 grid md:grid-cols-3 gap-6"
      >
        {/* Sticky Order Summary */}
        <div className="md:col-span-1 sticky top-4 self-start">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Order Summary</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                  <div>
                    <h3 className="font-semibold text-gray-700">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <input 
              type="text" 
              name="promoCode" 
              value={formData.promoCode} 
              onChange={handleChange} 
              placeholder="Promo Code" 
              className="w-full p-2 border rounded-md" 
            />
            <button 
              type="button" 
              onClick={applyPromoCode} 
              className="w-full mt-2 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-400 transition-transform transform hover:scale-105"
            >Apply</button>
          </div>
          <div className="mt-4 flex justify-between items-center text-lg font-bold text-gray-900">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Billing Details</h2>
          {['name', 'email', 'address', 'city', 'zip', 'cardNumber', 'expiry', 'cvv'].map((field) => (
            <div key={field}>
              <input
                type={field.includes('email') ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className={`w-full p-3 rounded-md border ${error[field] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-yellow-400`}
              />
              {error[field] && <p className="text-red-500 text-sm mt-1">{error[field]}</p>}
            </div>
          ))}

          <div>
            <label className="font-semibold">Shipping Options:</label>
            <select name="shipping" value={formData.shipping} onChange={handleChange} className="w-full p-2 border rounded-md">
              <option value="standard">Standard - $5</option>
              <option value="express">Express - $15</option>
              <option value="nextDay">Next Day - $25</option>
            </select>
          </div>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Order Notes (Optional)"
            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400"
          />

          <label className="flex items-center gap-2">
            <input type="checkbox" name="saveInfo" checked={formData.saveInfo} onChange={handleChange} />
            Save this information for next time
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-yellow-400 hover:bg-yellow-300 text-white font-bold py-3 rounded-md transition-transform transform hover:scale-105 shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
