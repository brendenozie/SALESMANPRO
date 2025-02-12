import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, ClockIcon, CheckCircleIcon, XCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';

const orderStatus = [
  { step: 'Order Placed', icon: CheckCircleIcon, status: 'completed' },
  { step: 'Processing', icon: ClockIcon, status: 'completed' },
  { step: 'Shipped', icon: TruckIcon, status: 'current' },
  { step: 'Out for Delivery', icon: MapPinIcon, status: 'pending' },
  { step: 'Delivered', icon: CheckCircleIcon, status: 'pending' }
];

const TrackMyOrder = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderFound, setOrderFound] = useState(true);
  const [currentStep, setCurrentStep] = useState(2);
  const [timeRemaining, setTimeRemaining] = useState('2h 45m');

  const getStatus = (index) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "pending";
  };

  useEffect(() => {
    if (currentStep < orderStatus.length - 1) {
      const hours = Math.max(0, 2 - currentStep);
      const minutes = Math.max(0, 45 - currentStep * 10);
      setTimeRemaining(`${hours}h ${minutes}m`);
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep < orderStatus.length - 1) {
      const timer = setInterval(() => {
        setCurrentStep((prev) => Math.min(prev + 1, orderStatus.length - 1));
      }, 10000);
      
      return () => clearInterval(timer);
    }
  }, [currentStep]);

  const handleTrack = () => {
    if (!trackingNumber) return;
    setOrderFound(trackingNumber === "123456");
    setCurrentStep(2);
    setTimeRemaining("2h 45m");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-blue-400 p-6 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full transform hover:rotate-1 transition">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">Track My Order</h2>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Enter Tracking Number" 
            value={trackingNumber} 
            onChange={(e) => setTrackingNumber(e.target.value)} 
            className="flex-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200" 
          />
          <button onClick={handleTrack} className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition">Track</button>
        </div>
        {trackingNumber && (
          orderFound ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-6">
              <Progress value={(currentStep / orderStatus.length) * 100} className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" />
              {orderStatus.map(({ step, icon: Icon }, index) => {
                const status = getStatus(index);
                return (
                  <div key={index} className={`flex items-center gap-4 p-4 rounded-lg shadow ${
                    status === "completed" ? "bg-green-100" : status === "current" ? "bg-yellow-100 glow" : "bg-gray-100"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      status === "completed" ? "text-green-600" : status === "current" ? "text-yellow-600" : "text-gray-600"
                    }`} />
                    <span className="font-semibold text-gray-800">{step}</span>
                  </div>
                );
              })}
              <div className="mt-4 flex items-center gap-4 text-gray-700">
                <MapPinIcon className="w-6 h-6 text-indigo-600" />
                <span>Estimated Arrival: {timeRemaining}</span>
              </div>
              <div className="mt-4 h-40 rounded-lg overflow-hidden shadow-lg">
                <Map />
              </div>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow flex flex-col gap-2">
                <h3 className="text-lg font-bold">Delivery Person</h3>
                <p className="text-gray-700">John Doe - 📞 +1 234 567 890</p>
                <p className="text-gray-700">Currently on route 🚚</p>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex items-center gap-4 bg-red-100 p-4 rounded-lg shadow">
              <XCircleIcon className="w-6 h-6 text-red-600" />
              <span className="font-semibold text-red-600">Tracking number not found. Please try again.</span>
            </motion.div>
          )
        )}
      </motion.div>
    </div>
  );
};

export default TrackMyOrder;

const Progress = ({ value }) => {
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full"
        />
    </div>
  );
};

const Map = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;
    if (mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
      });
      const marker = new window.google.maps.Marker({
        position: { lat: 37.7749, lng: -122.4194 },
        map,
        title: "Your Delivery",
        icon: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png",
      });
    }
  }, []);
  return <div ref={mapRef} className="w-full h-40 bg-gray-200" />;
};
