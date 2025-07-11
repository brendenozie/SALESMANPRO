import React from 'react';
import Link from 'next/link';

const puzzles = [
  { id: 1, type: 'Shape Match', icon: '🔺', link: '/play/puzzle-play/shape-match' },
  { id: 2, type: 'Animal Shadows', icon: '🦊', link: '/play/puzzle-play/animal-shadows' },
  { id: 3, type: 'Number Order', icon: '🔢', link: '/play/puzzle-play/number-order' },
];

export default function PuzzlePlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-teal-300 p-6 flex flex-col items-center justify-center">
      <Link href="/play" className="absolute top-6 left-6 text-5xl animate-bounce" aria-label="Go back home">
        🏠
      </Link>

      <h1 className="text-5xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown">
        🧩 Puzzle Fun Time! 🧩
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {puzzles.map((puzzle) => (
          <Link
            key={puzzle.id}
            href={puzzle.link}
            className="rounded-3xl p-6 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center group"
          >
            <div className={`text-7xl mb-4 group-hover:animate-wiggle`}>
              {puzzle.icon}
            </div>
            <p className="text-2xl font-bold text-green-800 text-center group-hover:text-green-600 transition-colors">
              {puzzle.type}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp">
        Pick a puzzle and let's think! 🤔
      </p>
    </div>
  );
}