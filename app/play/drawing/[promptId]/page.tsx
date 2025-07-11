// app/play/drawing-canvas/[promptId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Mock Drawing Prompt Data (In a real app, you'd fetch this or use a more robust data structure)
const allDrawingPromptsData = {
  'happy-sun': {
    title: 'Draw a Happy Sun!',
    icon: '☀️',
    guidance: "Let's draw a bright, happy sun! Start with a big circle, then add some wavy rays and a big smile!",
    audio: '/audio/sun-drawing-guidance.mp3', // Audio for guidance on this specific prompt
    backgroundGradient: 'from-yellow-200 to-orange-300',
    promptImage: '/images/sun-outline.png' // Optional: an outline image to draw over
  },
  'favorite-animal': {
    title: 'Draw Your Favorite Animal!',
    icon: '🦁',
    guidance: "Think of your favorite animal! Is it a fluffy cat, a mighty lion, or a playful dolphin? Draw its shape first, then add details!",
    audio: '/audio/animal-drawing-guidance.mp3',
    backgroundGradient: 'from-green-200 to-teal-300',
    promptImage: null // No specific outline for this one
  },
  'rainbow': {
    title: 'Draw a Rainbow!',
    icon: '🌈',
    guidance: "A rainbow has many colors! Red, orange, yellow, green, blue, indigo, violet. Draw big arcs across the sky!",
    audio: '/audio/rainbow-drawing-guidance.mp3',
    backgroundGradient: 'from-purple-200 to-pink-300',
    promptImage: '/images/rainbow-outline.png'
  },
  'free-draw': {
    title: 'Free Draw!',
    icon: '🖍️',
    guidance: "Let your imagination soar! Draw anything you want. There are no rules, just fun!",
    audio: '/audio/free-draw-guidance.mp3',
    backgroundGradient: 'from-gray-200 to-white-300', // A more neutral background for free draw
    promptImage: null
  },
};

export default function DrawingCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const promptSlug = Array.isArray(params.promptId) ? params.promptId[0] : params.promptId;
  const promptData = allDrawingPromptsData[promptSlug as keyof typeof allDrawingPromptsData];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000'); // Default to black
  const [brushSize, setBrushSize] = useState(5); // Default brush size

  // Redirect if prompt data not found
  useEffect(() => {
    if (!promptData) {
      router.replace('/play/drawing'); // Redirect to drawing selection if slug is invalid
    }
  }, [promptData, router]);

  // Play prompt-specific guidance audio when page loads
  useEffect(() => {
    if (audioRef.current && promptData?.audio) {
      audioRef.current.src = promptData.audio;
      audioRef.current.play().catch(e => console.error("Error playing drawing guidance audio:", e));
    }
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [promptData]);

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Add null check for canvas

    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Add null check for context

    // Set initial canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Optional: Load prompt image if available
    if (promptData?.promptImage) {
      const img = new Image();
      img.src = promptData.promptImage;
      img.onload = () => {
        // Draw image stretched to fit canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [promptData]); // Depend on promptData to redraw if prompt changes

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Re-draw prompt image after clearing if applicable
    if (promptData?.promptImage) {
      const img = new Image();
      img.src = promptData.promptImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${promptData?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'my_drawing'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Your masterpiece is saved!'); // Fun confirmation
  };

  if (!promptData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-200 to-red-300 text-white text-3xl font-bold">
        Oops! Drawing prompt not found... heading back!
      </div>
    );
  }

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#FFFFFF'];

  return (
    <div className={`min-h-screen ${promptData.backgroundGradient} p-6 flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background Shapes */}
      <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-white rounded-full mix-blend-overlay opacity-30 animate-blob-slow animation-delay-500"></div>
      <div className="absolute bottom-1/4 right-1/4 w-52 h-52 bg-white rounded-full mix-blend-overlay opacity-30 animate-blob-slow animation-delay-1500"></div>

      {/* Back to Drawing Selection Button */}
      <Link href="/play/drawing" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back to drawing ideas">
        🎨
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-6 drop-shadow-lg animate-fadeInDown text-center px-4 z-10">
        {promptData.title} {promptData.icon}
      </h1>

      <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-6xl w-full flex flex-col items-center justify-center min-h-[70vh] z-10">
        <p className="text-3xl md:text-4xl font-semibold text-gray-700 text-center mb-6 animate-fadeInUp leading-relaxed">
          {promptData.guidance}
        </p>

        {/* Drawing Canvas */}
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border-4 border-dashed border-gray-300 shadow-inner flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={800} // Set a fixed internal resolution for better quality
              height={450}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing} // Stop drawing if mouse leaves canvas
              className="w-full h-full cursor-crosshair bg-white" // Actual display size controlled by Tailwind
            ></canvas>
        </div>

        {/* Drawing Tools */}
        <div className="mt-6 w-full flex flex-wrap justify-center items-center gap-4 p-4 bg-blue-50 rounded-2xl shadow-inner">
          {/* Color Palette */}
          <div className="flex flex-wrap gap-2 mr-4">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-10 h-10 rounded-full border-2 border-gray-300 transform hover:scale-110 transition-transform ${brushColor === color ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color} color`}
              ></button>
            ))}
          </div>

          {/* Brush Size Slider */}
          <div className="flex items-center gap-2">
            <span className="text-2xl text-gray-700">Brush Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-32 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer range-lg"
            />
            <span className="text-2xl text-gray-700">{brushSize}</span>
          </div>

          {/* Action Buttons */}
          <button
            onClick={clearCanvas}
            className="px-6 py-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors text-3xl font-bold transform active:scale-95 flex items-center gap-2"
          >
            <span className="text-4xl">🗑️</span> Erase All
          </button>
          <button
            onClick={downloadDrawing}
            className="px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors text-3xl font-bold transform active:scale-95 flex items-center gap-2"
          >
            <span className="text-4xl">💾</span> Save Art
          </button>
        </div>

        {/* Encouraging Message */}
        <p className="mt-8 text-3xl font-bold text-cyan-700 animate-pop">
          Let your creativity shine! ✨
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
      `}</style>
    </div>
  );
}