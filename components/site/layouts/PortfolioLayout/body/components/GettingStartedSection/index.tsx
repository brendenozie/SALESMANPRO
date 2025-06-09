import { CalendarIcon, ClipboardDocumentListIcon, HandRaisedIcon } from '@heroicons/react/24/outline';

const GettingStartedSection = () => {
  return (
    <section className="bg-[#0d675c] text-white py-16 px-6 rounded-[2rem]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Getting Started is <br className="md:hidden" /> Extremely Simple and Easy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="bg-white/10 p-4 rounded-full mb-4">
              <CalendarIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Step 1: Schedule a Call</h3>
            <p className="text-sm text-white/80 max-w-xs">
              Schedule your Discovery Session with our team of business consultants and ensure your presence during the call.
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center relative">
            <div className="absolute w-full h-1 top-1/2 border-t-2 border-dashed border-white/40"></div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="bg-white/10 p-4 rounded-full mb-4">
              <ClipboardDocumentListIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Step 2: Pinpoint the Obstacles</h3>
            <p className="text-sm text-white/80 max-w-xs">
              Pinpoint the obstacles hindering your business progress and develop a strategic plan to overcome them.
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center relative">
            <div className="absolute w-full h-1 top-1/2 border-t-2 border-dashed border-white/40"></div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center md:col-span-1">
            <div className="bg-white/10 p-4 rounded-full mb-4">
              <HandRaisedIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Step 3: Grow Your Business</h3>
            <p className="text-sm text-white/80 max-w-xs">
              Grow your business with a reliable partner who possesses an optimistic mindset and good-natured sense of humor.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GettingStartedSection;
