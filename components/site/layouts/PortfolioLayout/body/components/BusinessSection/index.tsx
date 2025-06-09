import { StarIcon } from "@heroicons/react/24/outline";
import React from "react";

export default function BusinessSection() {
  return (
    <div className="bg-white">
      {/* Coaching Solutions Section */}
      <section className="bg-teal-50 py-16 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          Our Coaching <span className="text-teal-600">Solutions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Business Coaching",
              desc: "Business coaching has the ability to improve the performance of businesses. We offer top class business coaching from experienced experts who have succeeded in real life.",
            },
            {
              title: "Executive Coaching",
              desc: "In our executive coaching program, you will receive tailored, private consultations with founder Brittany and our team of expert executive coaches.",
            },
            {
              title: "Leadership Coaching",
              desc: "Our leadership coaching helps senior leaders put their best ideas forward and taking care of their teams. Gain personalized feedback and valuable leadership insights.",
            },
            {
              title: "Accountability Coaching",
              desc: "Our Accountability Coaches offer valuable guidance to help you establish and achieve your long-term goals effectively, without feeling burdened.",
              button: true,
            },
            {
              title: "Strategic Planning",
              desc: "We help business owners and leaders with strategic planning to achieve aligned goals. Our guidance includes creating a vision, setting goals, and managing risks.",
            },
            {
              title: "Career Coaching",
              desc: "Looking to enhance your career? Our career coaching service is the answer. With the help of a skilled coach, you can gain clarity and direction to achieve your career goal.",
            },
          ].map(({ title, desc, button }, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <div className="mb-4 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-700 font-bold text-lg">{title[0]}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 mb-4">{desc}</p>
              {button && (
                <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm">Learn More</button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
