
// 5. Help Center (help-center.tsx)
import React from 'react';
import Header from '@/components/site/header/Header';
import Footer from '@/components/site/footer/Footer';
import Section from '@/components/site/Section/Section';
import Link from 'next/link';

const HelpCenter: React.FC = () => (
  <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
    <Header />
    <Section title="Help Center" background="none">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { title: 'Returns', href: '/returns' },
          { title: 'Shipping', href: '/shipping' },
          { title: 'Track Order', href: '/track-order' }
        ].map(link => (
          <Link key={link.href} href={link.href} className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-blue-600">{link.title}</h3>
            <p className="mt-2 text-sm text-gray-600">Learn more about {link.title.toLowerCase()}.</p>
          </Link>
        ))}
      </div>
    </Section>
    <Footer />
  </div>
);
export default HelpCenter;