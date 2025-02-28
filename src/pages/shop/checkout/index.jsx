import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStateContext } from '../../../contexts/ContextProvider';
import Confetti from 'react-confetti';
import { CreditCardIcon, TruckIcon, TrashIcon, CheckCircleIcon, CalendarIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatCreditCardNumber, formatExpirationDate, formatCVC } from "../../../data/cardFormatter";
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";

const CheckoutPage = () => {

  const router = useRouter();
  const { data: session } = useSession();
  const { cart, removeItem, clearCart } = useStateContext();
  const [myOrder, setMyOrder] = useState({});
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
    address: session?.user?.address || '',
    cardNumber: session?.user?.cardNumber || '',
    expiry: session?.user?.expiry || '',
    cvv: '',
    promoCode: '',
    paymentMethod: 'card',
    shipping: 'Standard'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [error, setError] = useState({});
  const [discount, setDiscount] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Update estimated delivery date based on shipping method
  useEffect(() => {
    const today = new Date();
    let deliveryDate = new Date();
    deliveryDate.setDate(today.getDate() + (formData.shipping === 'Express' ? 2 : 5));
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

  const subtotal = cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
  const shippingCost = formData.shipping === 'Express' ? 15 : 5;
  const total = (subtotal + shippingCost) * (1 - discount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError({});

    try {
      const orderData = {
        consumerId: "67ac87b2b2663c53961ea0ff",
        items: cart.map(item => ({
          marketplaceListingId: item.id,
          quantity: item.quantity,
          price: item.sellingPrice,
        })),
        totalPrice: parseFloat(total.toFixed(2)),
        shippingAddress: formData.address,
        shippingMethod: formData.shipping,
      };

      const response = await fetch('/api/shop/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY,
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Order failed');

      const data = await response.json();
      setIsOrderPlaced(true);
      setMyOrder(data);
      console.log('Order placed successfully:', data);
      clearCart();
    } catch (error) {
      console.error('Error submitting order:', error);
      setError({ submit: 'Failed to place order. Try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 md:p-12 flex justify-center items-center">
      {isOrderPlaced ? (
        <OrderStatus 
          success={true} 
          orderId={myOrder?.trackingNumber ? myOrder?.trackingNumber : "RANDOM"} 
          onContinueShopping={() => router.push('/shop')} 
          onTrackOrder={() => router.push('/shop/orderTracking')} 
        />
      ) : (
        <motion.div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-8 grid md:grid-cols-2 gap-8 overflow-hidden">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-800">Order Summary</h2>
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-semibold text-gray-700">{item.title}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-700">${(item.finalPrice * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 transition">
                  <TrashIcon className="w-5 h-5" />
                </button>
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
            {['name', 'email', 'phone', 'address'].map(field => (
              <input 
                key={field} 
                type="text" 
                name={field} 
                value={formData[field]} 
                onChange={handleChange} 
                placeholder={field} 
                className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200" 
              />
            ))}

            <div>
              <h3 className="font-semibold text-gray-700">Payment Method</h3>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg shadow-sm cursor-pointer">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="card" 
                    checked={formData.paymentMethod === 'card'} 
                    onChange={handleChange} 
                  />
                  <CreditCardIcon className="w-6 h-6 text-indigo-600" /> Credit/Debit Card
                </label>
                <label className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg shadow-sm cursor-pointer">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cod" 
                    checked={formData.paymentMethod === 'cod'} 
                    onChange={handleChange} 
                  />
                  <TruckIcon className="w-6 h-6 text-indigo-600" /> Cash on Delivery
                </label>
              </div>
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="space-y-3">
                <input 
                  type="text" 
                  name="cardNumber" 
                  value={formData.cardNumber} 
                  onChange={handleChange} 
                  placeholder="Card Number" 
                  className="w-full p-3 border rounded-lg shadow-sm" 
                />
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    name="expiry" 
                    value={formData.expiry} 
                    onChange={handleChange} 
                    placeholder="MM/YY" 
                    className="w-1/2 p-3 border rounded-lg shadow-sm" 
                  />
                  <input 
                    type="text" 
                    name="cvv" 
                    value={formData.cvv} 
                    onChange={handleChange} 
                    placeholder="CVV" 
                    className="w-1/2 p-3 border rounded-lg shadow-sm" 
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="saveCard" 
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)} 
                  />
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
      )}
    </div>
  );
};

export default CheckoutPage;

const OrderStatus = ({ success, orderId, onContinueShopping, onTrackOrder }) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      {success && <Confetti width={windowSize.width} height={windowSize.height} />}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full"
      >
        {success ? (
          <>
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mt-2">Your order ID is <span className="font-semibold">{orderId}</span>.</p>
          </>
        ) : (
          <>
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Order Failed</h2>
            <p className="text-gray-600 mt-2">Something went wrong. Please try again later.</p>
          </>
        )}
        <div className="mt-6 flex flex-col gap-4">
          {success && (
            <a href="/shop/orderTracking">
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition">
                Track Order
              </button>
            </a>
          )}
          <a href="/">
            <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-300 transition flex items-center justify-center gap-2">
              <ArrowLeftIcon className="w-5 h-5" /> Continue Shopping
            </button>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
