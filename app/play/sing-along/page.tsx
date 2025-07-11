import React, { useState } from 'react';
import Link from 'next/link';

const songs = [
  { id: 1, title: 'Twinkle, Twinkle Little Star', icon: '🌟', audio: '/audio/twinkle.mp3' },
  { id: 2, title: 'Wheels on the Bus', icon: '🚌', audio: '/audio/wheels.mp3' },
  { id: 3, title: 'Old MacDonald', icon: '🐷', audio: '/audio/macdonald.mp3' },
];

export default function SingAlongPage() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song) => {
    if (currentSong && currentSong.id === song.id && isPlaying) {
      setIsPlaying(false);
      // Logic to pause audio
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      // Logic to play audio
      console.log(`Playing song: ${song.title}`);
      alert(`Imagine "${song.title}" is playing!`); // For demo
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-orange-300 p-6 flex flex-col items-center justify-center">
      <Link href="/play" className="absolute top-6 left-6 text-5xl animate-bounce" aria-label="Go back home">
        🏠
      </Link>

      <h1 className="text-5xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown">
        🎶 Let's Sing Together! 🎶
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        {songs.map((song) => (
          <button
            key={song.id}
            onClick={() => playSong(song)}
            className={`rounded-3xl p-6 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center group
                        ${currentSong && currentSong.id === song.id && isPlaying ? 'ring-8 ring-blue-400' : ''}`}
          >
            <div className={`text-7xl mb-4 group-hover:animate-spin-slow`}> {/* Custom animation */}
              {song.icon}
            </div>
            <p className="text-2xl font-bold text-orange-800 text-center group-hover:text-orange-600 transition-colors">
              {song.title}
            </p>
            {currentSong && currentSong.id === song.id && isPlaying && (
              <div className="mt-4 text-4xl animate-pulse">🎵 Singing Now! 🎵</div>
            )}
          </button>
        ))}
      </div>

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp">
        Tap a song and let's make some music! 🎤
      </p>
    </div>
  );
}