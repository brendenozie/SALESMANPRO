// app/play/story-view/[storyId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
// import { getAuthSession } from '@/lib/auth';
// import { findCompanyCached } from '@/lib/company-fetcher';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";


// --- Sample Data (Used if API fails or story not found) ---
// This structure mimics what we'd map from your Course and CourseMaterial models
const sampleStoryData = {
  'the-little-bear': {
    title: 'The Little Bear Who Lost His Roar (Sample)',
    pages: [
      { id: 'page-1', image: 'https://placehold.co/800x600/FFD700/000000?text=Bear+Page+1', text: 'Once upon a time, in a big green forest, lived a little bear named Barnaby. But Barnaby had a secret...' },
      { id: 'page-2', image: 'https://placehold.co/800x600/FFA07A/000000?text=Bear+Page+2', text: 'He had lost his ROAR! All the other bears roared loudly, but Barnaby\'s roar was just a tiny squeak.' },
      { id: 'page-3', image: 'https://placehold.co/800x600/98FB98/000000?text=Bear+Page+3', text: 'He asked his friend, the wise old owl, "How can I find my roar?"' },
      { id: 'page-4', image: 'https://placehold.co/800x600/ADD8E6/000000?text=Bear+Page+4', text: 'The owl hooted, "Look inside, brave Barnaby!" And with a deep breath, Barnaby found his BIGGEST roar yet!' },
    ],
    audio: {
      fullStory: '/audio/bear-roar-full.mp3', // Sample full story audio
      // pageAudios: { /* ... */ } // Can be implemented if CourseMaterial has individual audio links
    }
  },
  'brave-princess-lily': {
    title: 'Brave Princess Lily (Sample)',
    pages: [
      { id: 'page-1', image: 'https://placehold.co/800x600/FFB6C1/000000?text=Princess+Page+1', text: 'In a land of sparkling castles, lived Princess Lily. She loved adventures more than gowns!' },
      { id: 'page-2', image: 'https://placehold.co/800x600/DA70D6/000000?text=Princess+Page+2', text: 'One day, a tiny dragon cried for help. His sparkle had gone missing!' },
      { id: 'page-3', image: 'https://placehold.co/800x600/BA55D3/000000?text=Princess+Page+3', text: 'Lily bravely followed clues through the whispering woods.' },
      { id: 'page-4', image: 'https://placehold.co/800x600/8A2BE2/000000?text=Princess+Page+4', text: 'She found the sparkle, deep inside a gloomy cave. Lily cheered, and the dragon sparkled brighter than ever!' },
    ],
    audio: {
      fullStory: '/audio/princess-lily-full.mp3',
    }
  },
  'the-giggle-monster': {
    title: 'The Giggle Monster (Sample)',
    pages: [
      { id: 'page-1', image: 'https://placehold.co/800x600/40E0D0/000000?text=Monster+Page+1', text: 'Meet Giggles, the silliest monster! He loved to make everyone giggle.' },
      { id: 'page-2', image: 'https://placehold.co/800x600/48D1CC/000000?text=Monster+Page+2', text: 'He tickled toes, told funny jokes, and made funny faces.' },
      { id: 'page-3', image: 'https://placehold.co/800x600/20B2AA/000000?text=Monster+Page+3', text: 'But sometimes, Giggles felt sad when he was all alone.' },
      { id: 'page-4', image: 'https://placehold.co/800x600/008B8B/000000?text=Monster+Page+4', text: 'Then he learned, sharing giggles with friends makes everyone happy!' },
    ],
    audio: {
      fullStory: '/audio/giggle-monster-full.mp3',
    }
  },
};

export default function StoryViewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string) || '';
  const storyId = Array.isArray(params.storyId) ? params.storyId[0] : (params.storyId as string) || '';

  const [currentStoryData, setCurrentStoryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [completedSaved, setCompletedSaved] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch story data based on storyId
  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      setError(null);

      // Check sample stories first
      const sample = sampleStoryData[storyId as keyof typeof sampleStoryData];
      if (sample) {
        setCurrentStoryData(sample);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/activities?companySlug=${slug}&type=story-time`);
        if (response.ok) {
          const resData = await response.json();
          const found = (resData?.data?.activities || []).find((a: any) => a.id === storyId);
          if (found && found.content?.pages?.length > 0) {
            setCurrentStoryData({
              title: found.title,
              pages: found.content.pages.map((p: any, idx: number) => ({
                id: `p-${idx}`,
                image: p.imageUrl || found.mediaAsset?.url || `https://placehold.co/800x600/FFD700/000000?text=Page+${idx + 1}`,
                text: p.text || found.description || '',
              })),
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (e: any) {
        console.error("Failed to fetch custom story:", e);
      }

      // Fallback to first sample story if not matched
      setCurrentStoryData(sampleStoryData['the-little-bear']);
      setIsLoading(false);
    };

    fetchStory();
  }, [storyId, slug]);

  // Speech synthesis for reading aloud
  useEffect(() => {
    if (!isReadingAloud) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && currentStoryData?.pages?.[currentPageIndex]?.text) {
      window.speechSynthesis.cancel();
      const text = currentStoryData.pages[currentPageIndex].text;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onend = () => {
        // Can optionally auto advance or wait for child
      };
      window.speechSynthesis.speak(utterance);
    }
  }, [isReadingAloud, currentPageIndex, currentStoryData]);

  // Reset current page when story changes
  useEffect(() => {
    setCurrentPageIndex(0);
    setIsReadingAloud(false);
    setCompletedSaved(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [storyId]);

  // Record attempt when last page is reached
  useEffect(() => {
    if (currentStoryData?.pages?.length && currentPageIndex === currentStoryData.pages.length - 1 && !completedSaved) {
      setCompletedSaved(true);
      fetch('/api/admin/activity-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companySlug: slug,
          activityId: storyId,
          isCompleted: true,
          data: {
            title: currentStoryData.title,
            pagesRead: currentStoryData.pages.length,
            completedAt: new Date().toISOString(),
          },
        }),
      }).catch(err => console.warn("Could not save attempt:", err));
    }
  }, [currentPageIndex, currentStoryData, completedSaved, slug, storyId]);

  // Reset current page when storyData changes (e.g., if a user manually changes URL storyId)
  useEffect(() => {
    setCurrentPageIndex(0);
    setIsReadingAloud(false); // Stop reading aloud if story changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentStoryData]); // Depend on currentStoryData to reset when a new story is loaded

  if (isLoading || !currentStoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-green-300 text-white text-3xl font-bold">
        {isLoading ? "Loading story..." : "Oops! Story not found... heading back!"}
      </div>
    );
  }

  const currentPage = currentStoryData.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === currentStoryData.pages.length - 1;

  const goToNextPage = () => {
    if (!isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
      // If reading aloud, you might want to restart audio for the new page if page-specific audios exist
      // For now, it will continue playing the full story audio or stop if it ends.
    } else {
      // console.log("Story finished!");
      setIsReadingAloud(false); // Stop reading when done
      if (audioRef.current) audioRef.current.pause();
    }
  };

  const goToPreviousPage = () => {
    if (!isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const toggleReadAloud = () => {
    setIsReadingAloud(!isReadingAloud);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-green-300 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-500"></div>
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-1500"></div>

      {/* Back to Stories Button */}
      <Link href={`/admin/${slug}/play/story-time`} className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back to stories">
        📖
      </Link>

      <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg animate-fadeInDown text-center px-4 z-10">
        {currentStoryData.title}
      </h1>

      <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl w-full flex flex-col items-center justify-center min-h-[60vh] z-10">
        {/* Story Image */}
        <img
          src={currentPage.image}
          alt={`Page ${currentPageIndex + 1} of ${currentStoryData.title}`}
          className="w-full h-auto max-h-[40vh] object-contain rounded-2xl shadow-lg mb-6 animate-scaleIn"
        />

        {/* Story Text */}
        <p className="text-3xl md:text-4xl font-semibold text-gray-700 text-center mb-6 animate-fadeInUp leading-relaxed">
          {currentPage.text}
        </p>

        {/* Navigation Buttons */}
        <div className="flex justify-between w-full max-w-xl space-x-4 mb-4">
          <button
            onClick={goToPreviousPage}
            disabled={isFirstPage}
            className={`p-4 md:p-5 rounded-full shadow-lg transition-all text-5xl md:text-6xl
              ${isFirstPage ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-400 text-white hover:bg-orange-500 transform active:scale-95'}`}
            aria-label="Previous page"
          >
            ◀️
          </button>
          <button
            onClick={toggleReadAloud}
            className="p-4 md:p-5 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all text-5xl md:text-6xl transform active:scale-95"
            aria-label={isReadingAloud ? "Pause reading aloud" : "Read aloud"}
          >
            {isReadingAloud ? '🔇' : '🔊'} {/* Mute/Unmute icon for read-aloud */}
          </button>
          <button
            onClick={goToNextPage}
            disabled={isLastPage}
            className={`p-4 md:p-5 rounded-full shadow-lg transition-all text-5xl md:text-6xl
              ${isLastPage ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-400 text-white hover:bg-orange-500 transform active:scale-95'}`}
            aria-label="Next page"
          >
            ▶️
          </button>
        </div>

        {/* "Story Finished" Message/Button */}
        {isLastPage && !isReadingAloud && (
          <div className="mt-8 animate-pop">
            <p className="text-4xl font-bold text-green-700 mb-4 animate-pulse">
              🎉 The End! Great Job! 🎉
            </p>
            <Link
              href={`/admin/${slug}/play/story-time`}
              className="px-8 py-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors text-3xl font-bold transform hover:scale-105 active:scale-95"
            >
              Read Another Story!
            </Link>
          </div>
        )}
      </div>

      {/* Hidden Audio Player */}
      <audio ref={audioRef} onEnded={() => setIsReadingAloud(false)}></audio>

      {/* Custom Tailwind CSS animations */}
      <style jsx>{`
        @keyframes blob-slow { /* Same as previous, but included for completeness */
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(0, 20px) scale(0.9); }
          75% { transform: translate(-20px, -10px) scale(1.05); }
        }
        .animate-blob-slow {
          animation: blob-slow 10s infinite ease-in-out;
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes pop { /* Already defined, but for clarity */
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }

        @keyframes fadeInDown { /* Already defined */
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        @keyframes fadeInUp { /* Already defined */
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
