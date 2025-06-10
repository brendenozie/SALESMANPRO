import { PlayCircleIcon } from "@heroicons/react/24/outline";


export default function AboutSection() {
  return (
    <section className="bg-gray-100">
      <div className="relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/path/to/your/bg-image.jpg')" }}>
        <div className="bg-black bg-opacity-60">
          <div className="max-w-6xl mx-auto text-center py-20 px-4">
            <h1 className="text-white text-4xl font-bold mb-4">The Smarter Way to Learn</h1>
            <p className="text-white max-w-xl mx-auto">
              It the of about everything was at anyone out report first at hired sublime ability what infinity, or your rational andmagazine it
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 -bottom-20 flex justify-center">
          <div className="relative w-full max-w-4xl">
            <img
              src="/path/to/your/video-thumbnail.jpg"
              alt="Video thumbnail"
              className="rounded-lg shadow-lg w-full"
            />
            <button className="absolute inset-0 flex items-center justify-center">
              <div className="bg-orange-500 text-white rounded-full p-3 shadow-lg">
                <PlayCircleIcon className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-32 pb-16 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-2xl font-bold text-orange-500">120+</h3>
            <p className="text-sm text-gray-600">Student Campuses</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-orange-500">5000+</h3>
            <p className="text-sm text-gray-600">Student Enrolled</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-orange-500">100+</h3>
            <p className="text-sm text-gray-600">Certified Teachers</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-orange-500">60+</h3>
            <p className="text-sm text-gray-600">Countrywide Award</p>
          </div>
        </div>
      </div>
    </section>
  );
}
