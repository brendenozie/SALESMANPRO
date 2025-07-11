// app/play/drawing/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Sample Data (Used if API fails or returns no data) ---
const sampleDrawingPrompts = [
  { id: 'sample-1', slug: 'happy-sun', title: 'Draw a Happy Sun! (Sample)', icon: '☀️', introAudio: '/audio/sun-drawing-intro.mp3', description: "Start with a big circle and a smile!" },
  { id: 'sample-2', slug: 'favorite-animal', title: 'Draw Your Favorite Animal! (Sample)', icon: '🦁', introAudio: '/audio/animal-drawing-intro.mp3', description: "What animal do you love the most?" },
  { id: 'sample-3', slug: 'rainbow', title: 'Draw a Rainbow! (Sample)', icon: '🌈', introAudio: '/audio/rainbow-drawing-intro.mp3', description: "Red, orange, yellow, green, blue, indigo, violet!" },
  { id: 'sample-4', slug: 'free-draw', title: 'Free Draw! (Sample)', icon: '🖍️', introAudio: '/audio/free-draw-intro.mp3', description: "Draw anything your imagination can dream up!" },
];

// --- IMPORTANT: Replace this with the actual ID of your "Playgroup" AcademicLevel from your database ---
// Or create a specific "Drawing" AcademicLevel if you want to categorize them separately.
const PLAYGROUP_ACADEMIC_LEVEL_ID = 'YOUR_PLAYGROUP_ACADEMIC_LEVEL_ID'; // e.g., '65e7b2f3a4c5d6e7f8a9b0c1'

export default function DrawingPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [drawingPrompts, setDrawingPrompts] = useState<typeof sampleDrawingPrompts>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrawingPrompts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch courses from your API, filtering by the playgroup academic level
        const response = await fetch(`/api/courses?academicLevelId=${PLAYGROUP_ACADEMIC_LEVEL_ID}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          // Filter for courses that are likely drawing prompts (e.g., based on audioUrl or description content)
          // You might want to add a 'type' field (e.g., 'STORY', 'SONG', 'PUZZLE', 'DRAWING') to your Course model
          // to make this filtering more robust. For now, we'll assume any course with an audioUrl and description
          // could be a drawing prompt.
          const mappedPrompts = data
            .filter((course: any) => course.audioUrl && course.description) // Ensure it has audio and description for guidance
            .map((course: any) => ({
              id: course.id,
              slug: course.code, // Assuming 'code' can be used as a unique slug for prompts
              title: course.title,
              icon: course.imageUrl || '🎨', // Use imageUrl for icon, fallback to palette emoji
              introAudio: course.audioUrl,
              description: course.description, // Map Course.description to prompt.description
            }));
          setDrawingPrompts(mappedPrompts);
        } else {
          console.warn("No courses with drawing-related content found for Playgroup academic level. Displaying sample data.");
          setDrawingPrompts(sampleDrawingPrompts);
        }
      } catch (e: any) {
        console.error("Failed to fetch drawing prompts:", e);
        setError("Failed to load drawing prompts. Displaying sample data.");
        setDrawingPrompts(sampleDrawingPrompts); // Fallback to sample data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrawingPrompts();
  }, []); // Empty dependency array means this runs once on mount

  const handleStartDrawing = (prompt: any) => {
    // Play a sound effect before navigating
    if (audioRef.current) {
      audioRef.current.src = prompt.introAudio || '/audio/drawing-click.mp3'; // Fallback to generic click
      audioRef.current.play().catch(e => console.error("Error playing drawing sound:", e));
    }
    // Navigate to the dynamic drawing canvas page
    router.push(`/play/drawing/${prompt.slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-cyan-300 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements for playfulness */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-1000"></div>

      {/* Back to Home Button */}
      <Link href="/play" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back home">
        🏡
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown text-center px-4">
        🎨 Time to Draw and Create! 🎨
      </h1>

      {isLoading ? (
        <div className="text-white text-4xl font-bold animate-pulse">Loading drawing ideas...</div>
      ) : error ? (
        <div className="text-red-700 text-3xl font-bold mb-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full relative z-10">
          {drawingPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleStartDrawing(prompt)}
              className="rounded-3xl p-5 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center justify-between border-4 border-white border-opacity-50 group"
            >
              <div className={`text-7xl mb-4 group-hover:animate-jiggle-strong animate-pop`}>
                {prompt.icon}
              </div>
              <p className="text-3xl font-bold text-blue-800 text-center leading-tight group-hover:text-blue-600 transition-colors px-2">
                {prompt.title}
              </p>
              {prompt.description && (
                <p className="text-xl text-gray-500 mt-2 px-2 text-center">{prompt.description}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Audio Element for optional selection sound */}
      <audio ref={audioRef} className="hidden"></audio>

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp text-center px-4">
        Pick an idea or draw anything you like! 🖌️
      </p>

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

        @keyframes jiggle-strong {
          0%, 100% { transform: rotate(-3deg); }
          25% { transform: rotate(3deg); }
          50% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        .animate-jiggle-strong {
          animation: jiggle-strong 0.2s infinite alternate;
        }

        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
