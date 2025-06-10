export default function AboutSection() {
  return (
    <section className="bg-[#f4f4f4] py-16 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-md px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Text Content */}
          <div>
            <p className="text-sm font-medium text-orange-500 mb-2">Unlock Your Potential</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Smarter Way to Learn
            </h1>
            <p className="text-gray-600">
              It the of about everything was at anyone out report first at hired sublime ability what
              infinity, or your rational and magazine it.
            </p>
          </div>

          {/* Right Image with Play Icon */}
          <div className="relative">
            <img
              src="/video-thumbnail.jpg"
              alt="Video thumbnail"
              className="rounded-2xl w-full"
            />
            <button className="absolute inset-0 flex items-center justify-center">
              <div className="bg-orange-500 hover:bg-orange-600 transition rounded-full p-4 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 text-center">
          {[
            { count: "120+", label: "Student Campuses" },
            { count: "5000+", label: "Students Enrolled" },
            { count: "100+", label: "Certified Teachers" },
            { count: "60+", label: "Countrywide Awards" },
          ].map((stat, idx) => (
            <div key={idx}>
              <h3 className="text-2xl font-bold text-orange-500">{stat.count}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
