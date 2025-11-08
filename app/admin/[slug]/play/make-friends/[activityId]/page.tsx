// app/play/friend-activity-view/[activityId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// --- Sample Data (Used if API fails or activity not found) ---
const sampleFriendActivitiesData = {
  'learn-sharing': {
    title: 'Learning About Sharing (Sample)',
    icon: '🍎',
    description: "Sharing makes everyone happy! Let's watch a story about it. (Sample Description)",
    // mainContent is JSX, so it cannot come directly from DB.
    // It will be rendered conditionally based on the slug.
    backgroundGradient: 'from-blue-200 to-green-300',
    audio: '/audio/sharing-story-audio.mp3'
  },
  'practice-hello': {
    title: 'Practice Saying Hello (Sample)',
    icon: '👋',
    description: "Saying hello is a great way to make a friend! Let's practice! (Sample Description)",
    backgroundGradient: 'from-purple-200 to-indigo-300',
    audio: '/audio/hello-song-audio.mp3'
  },
  'play-together': {
    title: 'Playing a Game Together (Sample)',
    icon: '🎲',
    description: "Games are more fun with friends! Let's play a simple one. (Sample Description)",
    backgroundGradient: 'from-orange-200 to-red-300',
    audio: '/audio/game-play-audio.mp3'
  },
};

export default function FriendActivityViewPage() {
  const params = useParams();
  const router = useRouter();
  const activitySlug = Array.isArray(params.activityId) ? params.activityId[0] : params.activityId;

  const [currentActivityData, setCurrentActivityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch activity data based on activitySlug (which maps to Course.code)
  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentActivityData(null); // Clear previous data

      try {
        // Fetch all courses and find by 'code' (slug)
        const response = await fetch(`${apiBaseUrl}/student/courses`);

        if (response.ok) {
          // throw new Error(`HTTP error! status: ${response.status}`);

            const allCourses = await response.json();
            const courseData = allCourses.find((course: any) => course.code === activitySlug);

            if (courseData) {
              setCurrentActivityData({
                title: courseData.title,
                icon: courseData.imageUrl || '🤝', // Use imageUrl for icon, fallback to handshake
                description: courseData.description,
                audio: courseData.audioUrl,
                // backgroundGradient is UI-specific. Use hardcoded from sample or add to Course model.
                backgroundGradient: sampleFriendActivitiesData[activitySlug as keyof typeof sampleFriendActivitiesData]?.backgroundGradient || 'from-pink-200 to-red-300',
              });
            } else {
              // No data from API, try to use specific sample data or generic fallback
              console.warn(`No course found for slug: ${activitySlug}. Displaying sample data.`);
              setCurrentActivityData(sampleFriendActivitiesData[activitySlug as keyof typeof sampleFriendActivitiesData] || null);
              if (!sampleFriendActivitiesData[activitySlug as keyof typeof sampleFriendActivitiesData]) {
                setError("Activity not found. Redirecting...");
                router.replace('/play/make-friends');
                return;
              }
            }
          } else {
            // No data from API, try to use specific sample data or generic fallback
            console.warn(`No course found for slug: ${activitySlug}. Displaying sample data.`);
            setCurrentActivityData(sampleFriendActivitiesData[activitySlug as keyof typeof sampleFriendActivitiesData] || null);
            if (!sampleFriendActivitiesData[activitySlug as keyof typeof sampleFriendActivitiesData]) {
              setError("Activity not found. Redirecting...");
              router.replace('/play/make-friends');
              return;
            }
          }
          
      } catch (e: any) {
        console.error("Failed to fetch activity:", e);
        setError("Failed to load activity. Displaying sample data.");
        setCurrentActivityData(sampleFriendActivitiesData[activitySlug as keyof typeof sampleFriendActivitiesData] || null);
        if (!sampleFriendActivitiesData[activitySlug as keyof typeof sampleFriendActivitiesData]) {
          router.replace('/play/make-friends');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [activitySlug, router]); // Re-fetch if activitySlug changes

  // Play activity-specific intro audio when page loads
  useEffect(() => {
    if (audioRef.current && currentActivityData?.audio) {
      audioRef.current.src = currentActivityData.audio;
      audioRef.current.play().catch(e => console.error("Error playing activity intro audio:", e));
    }
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentActivityData]);

  // Conditional rendering for mainContent based on slug
  const renderMainContent = (slug: string) => {
    switch (slug) {
      case 'learn-sharing':
        return (
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-4xl mb-6 text-center text-blue-700 font-bold animate-pop">
              The Sharing Story!
            </p>
            {/* Placeholder for an embedded video or interactive story component */}
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-3xl font-semibold border-4 border-dashed border-gray-300">
              [Video or Interactive Story about Sharing]
            </div>
            <p className="mt-6 text-3xl text-gray-600 animate-fadeInUp">
              "Sharing your toys means more fun for everyone!"
            </p>
            <button className="mt-8 px-8 py-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors text-4xl font-bold animate-bounce-subtle">
              Practice Sharing!
            </button>
          </div>
        );
      case 'practice-hello':
        return (
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-4xl mb-6 text-center text-purple-700 font-bold animate-pop">
              Hello Song & Practice!
            </p>
            {/* Placeholder for an interactive "hello" game or song */}
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-3xl font-semibold border-4 border-dashed border-gray-300">
              [Interactive "Hello" Game / Song Lyrics]
            </div>
            <p className="mt-6 text-3xl text-gray-600 animate-fadeInUp">
              "Can you wave hello? 👋"
            </p>
            <button className="mt-8 px-8 py-4 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-colors text-4xl font-bold animate-bounce-subtle">
              Say Hello!
            </button>
          </div>
        );
      case 'play-together':
        return (
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-4xl mb-6 text-center text-orange-700 font-bold animate-pop">
              Friendship Matching Game!
            </p>
            {/* Placeholder for a simple game children can play */}
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-3xl font-semibold border-4 border-dashed border-gray-300">
              [Simple Matching Game UI]
            </div>
            <p className="mt-6 text-3xl text-gray-600 animate-fadeInUp">
              "It's more fun when we play together!"
            </p>
            <button className="mt-8 px-8 py-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors text-4xl font-bold animate-bounce-subtle">
              Play Again!
            </button>
          </div>
        );
      default:
        return (
          <div className="text-center text-gray-500 text-3xl font-semibold">
            Content for this activity is not available.
          </div>
        );
    }
  };

  if (isLoading || !currentActivityData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-200 to-red-300 text-white text-3xl font-bold">
        {isLoading ? "Loading activity..." : "Oops! Activity not found... heading back!"}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentActivityData.backgroundGradient} p-6 flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background Shapes */}
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-white rounded-full mix-blend-overlay opacity-30 animate-blob-slow animation-delay-500"></div>
      <div className="absolute bottom-1/4 left-1/4 w-52 h-52 bg-white rounded-full mix-blend-overlay opacity-30 animate-blob-slow animation-delay-1500"></div>

      {/* Back to Make Friends Selection Button */}
      <Link href="/play/make-friends" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back to friend activities">
        💖
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-6 drop-shadow-lg animate-fadeInDown text-center px-4 z-10">
        {currentActivityData.title} {currentActivityData.icon}
      </h1>

      <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl w-full flex flex-col items-center justify-center min-h-[65vh] z-10">
        <p className="text-3xl md:text-4xl font-semibold text-gray-700 text-center mb-8 animate-fadeInUp leading-relaxed">
          {currentActivityData.description}
        </p>

        {/* Main interactive content for the activity */}
        <div className="w-full flex-grow flex items-center justify-center">
          {renderMainContent(activitySlug!)}
        </div>

        {/* "Great job" or encouraging message */}
        <p className="mt-8 text-3xl font-bold text-pink-700 animate-pop">
          You're doing great! Keep learning! ✨
        </p>
      </div>

      {/* Hidden Audio Player */}
      <audio ref={audioRef} className="hidden"></audio>

      {/* Custom Tailwind CSS animations */}
      <style jsx>{`
        @keyframes blob-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(0, 20px) scale(0.9); }
          75% { transform: translate(-20px, -10px) scale(1.05); }
        }
        .animate-blob-slow {
          animation: blob-slow 10s infinite ease-in-out;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
