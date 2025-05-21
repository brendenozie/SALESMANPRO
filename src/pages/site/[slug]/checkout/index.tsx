import React, { useState } from 'react';
import { useStateContext } from '../../../../contexts/ContextProvider';
import Header from '@/components/site/header/Header';
import Footer from '@/components/site/footer/Footer';
import { motion } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { CreditCardIcon, MapPinIcon, CheckIcon } from '@heroicons/react/24/outline';


// Type definitions
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  themeSettings:any;
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface CheckoutProps {
  store: Store;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


const CheckoutPage: React.FC<CheckoutProps> = ({ store }) => {
  const { cart, addToCart, removeFromCart } = useStateContext();
  const [step, setStep] = useState(1);

  // Form state
  const [address, setAddress] = useState({ fullName: '', street: '', city: '', postal: '' });
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '' });

  const total = 100;//cart.reduce(({sum, item}:any) => sum + item.price * item.quantity, 0);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <Header store={store}/>
      <Section title="Checkout" background="none">
        {/* Stepper */}
        <div className="flex justify-center space-x-4 mb-8">
          {[1,2,3].map((s) => (
            <div key={s} className="flex items-center">
              <motion.div
                animate={{ scale: step === s ? 1.2 : 1 }}
                className={
                  `w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ` +
                  (step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600')
                }
              >{s}</motion.div>
              {s < 3 && <div className="w-12 h-px bg-gray-300"></div>}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {step === 1 && (
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center"><MapPinIcon className="w-6 h-6 mr-2"/> Shipping Address</h2>
              <div className="space-y-4">
                {['fullName','street','city','postal'].map((field) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                    value={(address as any)[field]}
                    onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center"><CreditCardIcon className="w-6 h-6 mr-2"/> Payment Details</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={payment.cardNumber}
                  onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={payment.expiry}
                    onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                    className="flex-1 border border-gray-300 rounded px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={payment.cvv}
                    onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
                    className="w-24 border border-gray-300 rounded px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center"><CheckIcon className="w-6 h-6 mr-2"/> Review & Confirm</h2>
              <div className="space-y-4">
                {cart.map((item : any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button onClick={() => setStep(step-1)} className="px-4 py-2 border rounded">Back</button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => setStep(step+1)} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
            ) : (
              <button className="px-4 py-2 bg-green-600 text-white rounded">Place Order</button>
            )}
          </div>
        </div>
      </Section>
      <NewsletterSection />
      <Footer  store={store}/>
    </div>
  );
}

export default CheckoutPage;