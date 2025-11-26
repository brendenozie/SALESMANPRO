'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircleIcon, ScissorsIcon, SparklesIcon, ClockIcon, 
  CreditCardIcon, MapPinIcon, BellIcon, ArrowRightIcon, 
  CalendarDaysIcon, ChevronLeftIcon, CheckCircleIcon,
  FingerPrintIcon, ShieldCheckIcon, WalletIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

// --- Mock Data ---
const USER = {
  name: "Alex Sterling",
  email: "alex.sterling@example.com",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
  memberSince: "Jan 2023",
  membership: "Gold Tier"
};

const SERVICES_LIST = [
  { id: 's1', name: 'Premium Haircut', price: '45', duration: '45m', icon: ScissorsIcon },
  { id: 's2', name: 'Dry Cleaning', price: '30', duration: '24h', icon: SparklesIcon },
  { id: 's3', name: 'House Keeping', price: '120', duration: '3h', icon: UserCircleIcon },
  { id: 's4', name: 'Shoe Repair', price: '35', duration: '48h', icon: ClockIcon },
];

const TIME_SLOTS = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '05:00 PM'];

const STATS = [
  { label: 'Total Orders', value: '24', icon: SparklesIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Pending', value: '2', icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-100' },
  { label: 'Spent this Mo.', value: '$340', icon: CreditCardIcon, color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

const ACTIVE_ORDER = {
  id: '#ORD-7782',
  service: 'Premium Laundry & Dry Clean',
  provider: 'Sparkle Cleaners',
  status: 'In Progress',
  progress: 65, // Percentage
  eta: 'Today, 4:00 PM',
  items: ['2 Suits', '5 Shirts', '1 Comforter']
};

const HISTORY = [
  { id: 1, service: 'Gentleman\'s Haircut', provider: 'Blade & Fade', date: 'Oct 24, 2023', price: '$45.00', status: 'Completed', rating: 5 },
  { id: 2, service: 'House Deep Clean', provider: 'Urban Maid', date: 'Oct 10, 2023', price: '$120.00', status: 'Completed', rating: 4 },
  { id: 3, service: 'Sneaker Restoration', provider: 'Kicks Fix', date: 'Sep 28, 2023', price: '$35.00', status: 'Cancelled', rating: 0 },
];


// --- Animation Variants ---
const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.5 } },
  exit: { opacity: 0, scale: 0.95 }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};


// --- Sub-Components ---

// 1. The Booking Modal
const BookingModal = ({ isOpen, onClose }:{isOpen: boolean; onClose: () => void}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
      }, 300);
    }
  }, [isOpen]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // Generate next 5 days
  const dates = [...Array(5)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { 
      day: d.toLocaleDateString('en-US', { weekday: 'short' }), 
      date: d.getDate(),
      full: d 
    };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
          />
          <motion.div 
            variants={modalVariants} initial="hidden" animate="visible" exit="exit"
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {step === 3 ? 'Booking Confirmed!' : 'Book a Service'}
                </h3>
                {step < 3 && <p className="text-sm text-slate-500">Step {step} of 3</p>}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Select Service */}
                {step === 1 && (
                  <motion.div key="step1" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    <h4 className="font-semibold text-slate-700 mb-4">Choose a Service</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {SERVICES_LIST.map((service) => (
                        <div 
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center text-center gap-3
                            ${selectedService?.id === service.id 
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' 
                              : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'}`}
                        >
                          <service.icon className="w-8 h-8" />
                          <div>
                            <div className="font-bold text-sm">{service.name}</div>
                            <div className="text-xs opacity-70">{service.price} • {service.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Date & Time */}
                {step === 2 && (
                  <motion.div key="step2" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Select Date</h4>
                      <div className="flex justify-between gap-2">
                        {dates.map((d, i) => (
                          <button 
                            key={i}
                            onClick={() => setSelectedDate(d.date)}
                            className={`flex-1 py-3 rounded-xl border flex flex-col items-center transition-all ${
                              selectedDate === d.date 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                              : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                            }`}
                          >
                            <span className="text-xs uppercase font-medium opacity-80">{d.day}</span>
                            <span className="text-lg font-bold">{d.date}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Available Time</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {TIME_SLOTS.map((t) => (
                          <button 
                            key={t}
                            onClick={() => setSelectedTime(t as string)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                              selectedTime === t 
                              ? 'bg-indigo-100 text-indigo-700 border-indigo-300' 
                              : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Success */}
                {step === 3 && (
                  <motion.div key="step3" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center text-center h-full pt-4">
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} 
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">You're All Set!</h2>
                    <p className="text-slate-500 max-w-xs mx-auto mb-6">
                      Your <strong>{selectedService?.name}</strong> has been scheduled for <strong>{selectedTime}</strong>. A confirmation email has been sent.
                    </p>
                    <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-sm text-slate-600">
                      <div className="flex justify-between mb-2"><span>Service</span><span className="font-semibold">{selectedService?.name}</span></div>
                      <div className="flex justify-between mb-2"><span>Total</span><span className="font-semibold">{selectedService?.price}</span></div>
                      <div className="flex justify-between"><span>Provider</span><span className="font-semibold">Sparkle Inc.</span></div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-between">
              {step === 1 && (
                <button onClick={onClose} className="text-slate-500 font-medium hover:text-slate-800">Cancel</button>
              )}
              {step === 2 && (
                <button onClick={handleBack} className="flex items-center text-slate-500 font-medium hover:text-slate-800">
                  <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
                </button>
              )}
              
              {step < 3 ? (
                 <button 
                   onClick={handleNext}
                   disabled={(step === 1 && !selectedService) || (step === 2 && (!selectedDate || !selectedTime))}
                   className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-indigo-300 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                   Continue
                 </button>
              ) : (
                <button 
                  onClick={onClose}
                  className="w-full bg-green-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-green-300 hover:bg-green-700 transition-all"
                >
                  Done
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 2. Tab Views
const OverviewTab = ({ onBook }:{onBook: () => void}) => (
  <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
     {/* Stats Row */}
                 <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {STATS.map((stat, idx) => (
                     <div key={idx} className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-shadow group">
                       <div className="flex items-center justify-between mb-4">
                         <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                           <stat.icon className="w-6 h-6" />
                         </div>
                         <span className="text-slate-400 text-sm font-medium">Last 30 days</span>
                       </div>
                       <div>
                         <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                         <p className="text-slate-500 font-medium">{stat.label}</p>
                       </div>
                     </div>
                   ))}
                 </motion.div>
     
                 {/* Active Service Card (Hero) */}
                 <motion.div variants={itemVariants} className="relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 translate-y-2"></div>
                   <div className="relative bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 overflow-hidden">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                       <div>
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide mb-3">
                           <span className="relative flex h-2 w-2">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                           </span>
                           {ACTIVE_ORDER.status}
                         </span>
                         <h2 className="text-2xl font-bold text-slate-800">{ACTIVE_ORDER.service}</h2>
                         <p className="text-slate-500 flex items-center gap-2 mt-1">
                           <MapPinIcon className="w-4 h-4" /> {ACTIVE_ORDER.provider}
                         </p>
                       </div>
                       <div className="mt-4 md:mt-0 text-right">
                         <p className="text-sm text-slate-400">Estimated Completion</p>
                         <p className="text-xl font-semibold text-slate-700">{ACTIVE_ORDER.eta}</p>
                       </div>
                     </div>
     
                     {/* Progress Bar */}
                     <div className="space-y-2 mb-6">
                       <div className="flex justify-between text-sm font-medium">
                         <span className="text-slate-600">Progress</span>
                         <span className="text-blue-600">{ACTIVE_ORDER.progress}%</span>
                       </div>
                       <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${ACTIVE_ORDER.progress}%` }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                         />
                       </div>
                     </div>
     
                     {/* Items */}
                     <div className="flex flex-wrap gap-3">
                       {ACTIVE_ORDER.items.map((item, i) => (
                         <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
                           {item}
                         </span>
                       ))}
                     </div>
                   </div>
                 </motion.div>
     
                 {/* Recent History */}
                 <motion.div variants={itemVariants}>
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
                     <button className="text-indigo-600 font-semibold text-sm hover:underline">View All</button>
                   </div>
                   
                   <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm overflow-hidden">
                     <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                         <thead>
                           <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                             <th className="p-6 font-semibold">Service</th>
                             <th className="p-6 font-semibold">Date</th>
                             <th className="p-6 font-semibold">Amount</th>
                             <th className="p-6 font-semibold">Status</th>
                             <th className="p-6 font-semibold text-right">Rating</th>
                           </tr>
                         </thead>
                         <tbody className="text-sm">
                           {HISTORY.map((item) => (
                             <tr key={item.id} className="group hover:bg-white/50 transition-colors border-b border-slate-50 last:border-0">
                               <td className="p-6">
                                 <div className="font-bold text-slate-700">{item.service}</div>
                                 <div className="text-slate-400 text-xs mt-1">{item.provider}</div>
                               </td>
                               <td className="p-6 text-slate-500">{item.date}</td>
                               <td className="p-6 font-mono font-medium text-slate-700">{item.price}</td>
                               <td className="p-6">
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                   item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                 }`}>
                                   {item.status}
                                 </span>
                               </td>
                               <td className="p-6 text-right">
                                 <div className="flex justify-end gap-1">
                                     {[...Array(5)].map((_, i) => (
                                         <StarIcon key={i} className={`w-4 h-4 ${i < item.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                                     ))}
                                 </div>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 </motion.div>
  </motion.div>
);

const BookingsTab = () => (
  <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-2xl font-bold text-slate-800">My Bookings</h3>
      <div className="flex gap-2">
         {['All', 'Active', 'Completed'].map(f => (
           <button key={f} className={`px-4 py-2 rounded-full text-sm font-medium ${f === 'All' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{f}</button>
         ))}
      </div>
    </div>
    <div className="space-y-4">
      {[
        { title: 'Gentleman\'s Haircut', provider: 'Blade & Fade', date: 'Oct 24, 2023', price: '$45.00', status: 'Completed', rating: 5 },
        { title: 'House Deep Clean', provider: 'Urban Maid', date: 'Oct 10, 2023', price: '$120.00', status: 'Completed', rating: 4 },
        { title: 'Sneaker Restoration', provider: 'Kicks Fix', date: 'Sep 28, 2023', price: '$35.00', status: 'Cancelled', rating: 0 },
      ].map((item, i) => (
        <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 group hover:shadow-md transition-all">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
               <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{item.title}</h4>
              <p className="text-sm text-slate-500">{item.provider} • {item.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
             <span className="font-mono font-bold text-slate-700">{item.price}</span>
             <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const PaymentsTab = () => (
  <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
     <h3 className="text-2xl font-bold text-slate-800">Payment Methods</h3>
     
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-56 flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
           <div className="flex justify-between items-start">
             <div className="opacity-80">Primary Card</div>
             <CreditCardIcon className="w-8 h-8 opacity-80" />
           </div>
           <div>
             <div className="text-2xl font-mono tracking-widest mb-4">**** **** **** 4242</div>
             <div className="flex justify-between items-end">
               <div>
                 <div className="text-xs opacity-60 uppercase">Card Holder</div>
                 <div className="font-medium">ALEX STERLING</div>
               </div>
               <div className="text-right">
                 <div className="text-xs opacity-60 uppercase">Expires</div>
                 <div className="font-medium">12/25</div>
               </div>
             </div>
           </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-56 flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div className="opacity-80">Debit</div>
             <WalletIcon className="w-8 h-8 opacity-80" />
           </div>
           <div>
             <div className="text-2xl font-mono tracking-widest mb-4">**** **** **** 8899</div>
             <div className="flex justify-between items-end">
               <div>
                 <div className="text-xs opacity-60 uppercase">Card Holder</div>
                 <div className="font-medium">ALEX STERLING</div>
               </div>
               <div className="text-right">
                 <div className="text-xs opacity-60 uppercase">Expires</div>
                 <div className="font-medium">09/24</div>
               </div>
             </div>
           </div>
        </div>
     </div>
     
     <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-medium hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
       <span className="text-2xl">+</span> Add New Payment Method
     </button>
  </motion.div>
);

const SettingsTab = () => (
  <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="max-w-2xl space-y-8">
     <h3 className="text-2xl font-bold text-slate-800">Account Settings</h3>
     
     <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm space-y-6">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <FingerPrintIcon className="w-5 h-5 text-indigo-600" /> Security
        </h4>
        <div className="space-y-4">
           <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="font-medium text-slate-800">Two-Factor Authentication</div>
                <div className="text-xs text-slate-500">Add an extra layer of security</div>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
           </div>
           <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="font-medium text-slate-800">Face ID Login</div>
                <div className="text-xs text-slate-500">Use biometrics to sign in</div>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
           </div>
        </div>
     </div>

     <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm space-y-6">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-indigo-600" /> Notifications
        </h4>
        <div className="space-y-4">
           {['Order Updates', 'Promotions & Deals', 'New Services'].map((item, i) => (
             <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                <span className="text-slate-600 group-hover:text-slate-900">{item}</span>
             </label>
           ))}
        </div>
     </div>
  </motion.div>
);


// 3. Main Dashboard Container
export default function UserProfileDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tab Content Mapping
    const renderContent = () => {
      switch (activeTab) {
        case 'overview': return <OverviewTab onBook={() => setIsModalOpen(true)} />;
        case 'bookings': return <BookingsTab />;
        case 'payment methods': return <PaymentsTab />;
        case 'settings': return <SettingsTab />;
        default: return <OverviewTab onBook={() => setIsModalOpen(true)} />;
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-700 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-200/40 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* The Booking Modal */}
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Welcome back, {USER.name.split(' ')[0]}
            </h1>
            <p className="text-slate-500 mt-1">Manage your lifestyle services in one place.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-slate-200 hover:bg-white transition-colors">
              <BellIcon className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
              <img src={USER.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100" />
              <span className="font-medium text-sm text-slate-700">{USER.name}</span>
            </div>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-slate-200/50 sticky top-10">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img src={USER.avatar} alt="Large Profile" className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg" />
                  <span className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 border-4 border-white rounded-full"></span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-800">{USER.name}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide rounded-full">
                  {USER.membership}
                </span>
              </div>
              
              <nav className="space-y-2">
                {['Overview', 'Bookings', 'Payment Methods', 'Settings'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveTab(item.toLowerCase())}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                      activeTab === item.toLowerCase() 
                        ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20' 
                        : 'text-slate-600 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <span className="font-medium capitalize">{item}</span>
                    {activeTab === item.toLowerCase() && <ArrowRightIcon className="w-4 h-4" />}
                  </button>
                ))}
              </nav>

              {/* Promo / CTA */}
              <div className="mt-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                 <SparklesIcon className="w-32 h-32 absolute -right-6 -bottom-6 text-white/10 rotate-12" />
                 <h3 className="text-lg font-bold relative z-10">Fresh Look?</h3>
                 <p className="text-indigo-100 text-sm mt-1 relative z-10 mb-4">Book a new service today.</p>
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="relative z-10 w-full bg-white text-indigo-700 py-2 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
                 >
                   Book Now
                 </button>
              </div>
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}