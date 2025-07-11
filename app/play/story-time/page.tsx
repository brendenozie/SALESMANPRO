import React, { useState } from 'react';
import Link from 'next/link';

// You'd replace these with actual image paths for your stories
const stories = [
  { id: 1, title: 'The Little Bear Who Lost His Roar', cover: '/images/story-bear.png', audio: '/audio/bear-roar.mp3' },
  { id: 2, title: 'Brave Princess Lily', cover: '/images/story-princess.png', audio: '/audio/princess-lily.mp3' },
  { id: 3, title: 'The Giggle Monster', cover: '/images/story-monster.png', audio: '/audio/giggle-monster.mp3' },
];

export default function StoryTimePage() {
  const [currentStory, setCurrentStory] = useState(null); // To hold the currently playing story
  const [isPlaying, setIsPlaying] = useState(false);

  const playStory = (story) => {
    if (currentStory && currentStory.id === story.id && isPlaying) {
      // Pause if the same story is playing
      setIsPlaying(false);
      // Logic to pause actual audio
    } else {
      setCurrentStory(story);
      setIsPlaying(true);
      // Logic to play actual audio (e.g., using new Audio(story.audio))
      console.log(`Playing story: ${story.title}`);
      alert(`Imagine "${story.title}" is playing!`); // For demo
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-indigo-300 p-6 flex flex-col items-center justify-center">
      <Link href="/play" className="absolute top-6 left-6 text-5xl animate-bounce" aria-label="Go back home">
        🏠
      </Link>

      <h1 className="text-5xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown">
        📖 Story Time Adventures! 📖
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => playStory(story)}
            className={`relative rounded-3xl p-4 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center group
                        ${currentStory && currentStory.id === story.id && isPlaying ? 'ring-8 ring-yellow-400' : ''}`}
          >
            <img
              src={story.cover}
              alt={story.title}
              className="w-full h-auto rounded-2xl mb-4 shadow-md group-hover:shadow-lg transition-shadow"
            />
            <p className="text-2xl font-bold text-purple-800 text-center group-hover:text-purple-600 transition-colors">
              {story.title}
            </p>
            {currentStory && currentStory.id === story.id && isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-3xl">
                <span className="text-6xl animate-pulse">▶️</span> {/* Or a pause icon */}
              </div>
            )}
          </button>
        ))}
      </div>

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp">
        Tap a book to listen to a story! ✨
      </p>
    </div>
  );
}