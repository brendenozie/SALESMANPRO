import React from 'react';

const testimonials = [
  {
    name: 'Jane Doe',
    role: 'Homeowner',
    message:
      "Their cleaning service exceeded my expectations! My apartment looked spotless and smelled amazing. Highly recommend!",
    image: '/images/user1.jpg', // Replace with your image path or use a placeholder
  },
  {
    name: 'Michael Smith',
    role: 'Office Manager',
    message:
      "We’ve been using their commercial service monthly. The staff is professional, and everything is cleaned to perfection.",
    image: '/images/user2.jpg',
  },
  {
    name: 'Linda Johnson',
    role: 'Landlord',
    message:
      "Great value for the price. The booking process was easy, and the team was punctual and thorough.",
    image: '/images/user3.jpg',
  },
];

export default function TestimonialSection() {
  return (
    <section className="bg-white py-20 px-4 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          What Our Clients Say
        </h2>
        <p className="text-gray-600 mb-12">Real feedback from our happy customers</p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-md transition"
            >
              <div className="flex justify-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              <p className="text-gray-700 italic mb-4">"{testimonial.message}"</p>
              <h4 className="text-lg font-semibold">{testimonial.name}</h4>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


 {/* Testimonials Carousel */}
//  {testimonials && testimonials.length > 0 && (
//   <Testimonials
//     testimonials={testimonials.map((t, idx) => ({
//       id: idx,//t.id ?? 
//       quote: t.quote,
//       author: t.author,
//       role: "user",//t.role
//       avatarUrl: t.avatarUrl,
//     }))}
//   />
// )}


type TestimonialsProps = {
  testimonials: Array<{
    id: string | number;
    quote: string;
    author: string;
    role?: string;
    avatarUrl?: string;
  }>;
};

// const Testimonials = ({ testimonials }: TestimonialsProps) => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % testimonials.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [testimonials.length]);

//   return (
//     <section className="py-28 bg-gradient-to-r from-pink-50 via-indigo-50 to-purple-50 relative overflow-hidden">
//       <div className="container mx-auto px-6 text-center relative z-10">
//         <motion.h2
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           viewport={{ once: true }}
//           className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-16"
//         >
//           What Our Clients Say
//         </motion.h2>

//         <div className="relative max-w-4xl mx-auto">
//           <motion.div
//             key={currentIndex}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-8 shadow-xl max-w-xl mx-auto"
//           >
//             <div className="text-5xl text-indigo-400 mb-4 leading-none">“</div>
//             <p className="text-gray-700 text-lg leading-relaxed italic mb-6">
//               {testimonials[currentIndex].quote}
//             </p>
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-full bg-indigo-200 overflow-hidden">
//                 <Image
//                   src={testimonials[currentIndex].avatarUrl ?? "/default-avatar.png"}
//                   loader={loader}
//                   alt={testimonials[currentIndex].author}
//                   width={48}
//                   height={48}
//                   className="object-cover w-full h-full"
//                 />
//               </div>
//               <div className="text-left">
//                 <p className="text-gray-900 font-semibold">
//                   {testimonials[currentIndex].author}
//                 </p>
//                 {testimonials[currentIndex].role && (
//                   <p className="text-sm text-gray-500">
//                     {testimonials[currentIndex].role}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </motion.div>

//           {/* Navigation dots */}
//           <div className="flex justify-center mt-8 space-x-2">
//             {testimonials.map((_, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => setCurrentIndex(idx)}
//                 className={`w-3 h-3 rounded-full transition-all ${
//                   idx === currentIndex
//                     ? "bg-indigo-600 scale-110"
//                     : "bg-indigo-300"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Decorative blurred blobs */}
//       <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl z-0" />
//       <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-pink-300/20 rounded-full blur-3xl z-0" />
//     </section>
//   );
// };