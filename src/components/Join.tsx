import React, { useRef } from "react";

const Join = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleJoin = ({ e }: any) => {
    e.preventDefault();
    // Uncomment and configure emailjs when ready
    // emailjs.sendForm(
    //   'service_extzqa9',
    //   'template_5fbt3fr',
    //   formRef.current,
    //   'VLwg1ltOWvnCYAiK_'
    // )
    // .then((result) => {
    //   console.log('done');
    // },
    // (error) => {
    //   console.log(error);
    // });
  };

  return (
    <section
      className="relative bg-gradient-to-b from-[#fdfdfd] to-[#f3f4f6] px-8 sm:px-16 lg:px-24 py-20 rounded-lg shadow-lg"
      id="join-us"
    >
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-96 h-96 bg-[#ffe4c4] rounded-full opacity-50 -top-20 -left-32 blur-[150px] animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-[#ffcc80] rounded-full opacity-40 top-16 right-[-60px] blur-[120px] animate-pulse delay-500"></div>
      </div>

      <div className="text-gray-900 flex flex-col lg:flex-row gap-12 items-center justify-between relative z-10">
        {/* Text Section */}
        <div className="relative max-w-lg text-center lg:text-left">
          {/* Decorative Line */}
          <div className="absolute inset-x-0 bottom-0 lg:inset-x-auto lg:left-0 lg:bottom-auto lg:top-0 w-24 lg:w-40 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full" />

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl font-extrabold uppercase leading-tight">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              Ready to
            </span>
            <span className="text-gray-800">Level Up</span>
            <span className="block mt-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              Your Body
            </span>
            <span className="text-gray-800">With Us?</span>
          </h2>
        </div>

        {/* Form Section */}
        <div className="w-full max-w-xl lg:w-1/2">
          <form
            ref={formRef}
            onSubmit={handleJoin}
            className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-lg"
          >
            <input
              type="email"
              name="user_email"
              placeholder="Enter your email address..."
              required
              className="w-full px-4 py-3 text-gray-800 placeholder-gray-500 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="w-full py-3 font-bold text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-transform duration-300 transform hover:scale-105"
            >
              Join Now
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Join;
