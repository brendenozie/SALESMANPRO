import React from 'react';
import Link from 'next/link';

export default function DrawingPage() {
  const drawingPrompts = [
    { id: 1, title: 'Draw a Happy Sun!', icon: '☀️' },
    { id: 2, title: 'Draw Your Favorite Animal!', icon: '🦁' },
    { id: 3, title: 'Draw a Rainbow!', icon: '🌈' },
  ];

  const handleStartDrawing = (prompt) => {
    console.log(`Starting drawing with prompt: ${prompt.title}`);
    alert(`Imagine a drawing canvas appears for: ${prompt.title}!`); // For demo
    // In a real app, you'd navigate to a drawing canvas component
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-cyan-300 p-6 flex flex-col items-center justify-center">
      <Link href="/play" className="absolute top-6 left-6 text-5xl animate-bounce" aria-label="Go back home">
        🏠
      </Link>

      <h1 className="text-5xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown">
        🎨 Time to Draw and Create! 🎨
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {drawingPrompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => handleStartDrawing(prompt)}
            className="rounded-3xl p-6 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center group"
          >
            <div className={`text-7xl mb-4 group-hover:animate-jiggle`}>
              {prompt.icon}
            </div>
            <p className="text-2xl font-bold text-blue-800 text-center group-hover:text-blue-600 transition-colors">
              {prompt.title}
            </p>
          </button>
        ))}
      </div>

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp">
        Pick an idea or draw anything you like! 🖌️
      </p>
    </div>
  );
}