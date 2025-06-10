"use client";

export default function PopularBlogsSection() {
  const events = [
    {
      id: 1,
      title: "Sport Management Information Webinar",
      date: "20 Oct 2021",
      time: "2:00 pm",
      image: "/images/event1.jpg",
    },
    {
      id: 2,
      title: "Sport Management Information Webinar",
      date: "20 Oct 2021",
      time: "2:00 pm",
      image: "/images/event2.jpg",
    },
    {
      id: 3,
      title: "Sport Management Information Webinar",
      date: "20 Oct 2021",
      time: "2:00 pm",
      image: "/images/event3.jpg",
    },
    {
      id: 4,
      title: "Sport Management Information Webinar",
      date: "20 Oct 2021",
      time: "2:00 pm",
      image: "/images/event4.jpg",
    },
  ];

  return (
    <section className="bg-[#09234F] text-white py-16 px-4 md:px-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold">Our Latest Events</h2>
        <p className="mt-2 text-gray-300 max-w-xl mx-auto text-sm md:text-base">
          It the of about everything was at anyone out report first at hired sublime
          ability what infinity, or your rational andmagazine it
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Event */}
        <div className="md:col-span-2">
          <img
            src="/images/featured-event.jpg"
            alt="Main Event"
            className="rounded-lg w-full h-64 object-cover"
          />
          <div className="mt-4">
            <p className="text-sm text-gray-300">20 Oct 2021 &nbsp; | &nbsp; 2:00 pm</p>
            <h3 className="text-xl font-semibold mt-1">
              Sport Management Information Webinar
            </h3>
            <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md text-sm font-medium">
              Read More
            </button>
          </div>
        </div>

        {/* Side Events */}
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start space-x-4">
              <img
                src={event.image}
                alt={event.title}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div>
                <h4 className="text-sm font-semibold">{event.title}</h4>
                <p className="text-xs text-gray-300">
                  {event.date} &nbsp; | &nbsp; {event.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
