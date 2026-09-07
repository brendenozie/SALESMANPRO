// app/play/drawing/[promptId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
// import { getAuthSession } from '@/lib/auth';
// import { findCompanyCached } from '@/lib/company-fetcher';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";


// --- Sample Data (Used if API fails or prompt not found) ---
const sampleDrawingPromptsData = {
  'happy-sun': {
    title: 'Draw a Happy Sun! (Sample)',
    icon: '☀️',
    guidance: "Let's draw a bright, happy sun! Start with a big circle, then add some wavy rays and a big smile! (Sample Guidance)",
    audio: '/audio/sun-drawing-guidance.mp3',
    backgroundGradient: 'from-yellow-200 to-orange-300',
    promptImage: 'https://placehold.co/800x450/FFFFFF/000000?text=Sun+Outline', // Placeholder outline image
  },
  'favorite-animal': {
    title: 'Draw Your Favorite Animal! (Sample)',
    icon: '🦁',
    guidance: "Think of your favorite animal! Is it a fluffy cat, a mighty lion, or a playful dolphin? Draw its shape first, then add details! (Sample Guidance)",
    audio: '/audio/animal-drawing-guidance.mp3',
    backgroundGradient: 'from-green-200 to-teal-300',
    promptImage: null,
  },
  'rainbow': {
    title: 'Draw a Rainbow! (Sample)',
    icon: '🌈',
    guidance: "A rainbow has many colors! Red, orange, yellow, green, blue, indigo, violet. Draw big arcs across the sky! (Sample Guidance)",
    audio: '/audio/rainbow-drawing-guidance.mp3',
    backgroundGradient: 'from-purple-200 to-pink-300',
    promptImage: 'https://placehold.co/800x450/FFFFFF/000000?text=Rainbow+Outline', // Placeholder outline image
  },
  'free-draw': {
    title: 'Free Draw! (Sample)',
    icon: '🖍️',
    guidance: "Let your imagination soar! Draw anything you want. There are no rules, just fun! (Sample Guidance)",
    audio: '/audio/free-draw-guidance.mp3',
    backgroundGradient: 'from-gray-200 to-white-300',
    promptImage: null,
  },
};


interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DrawingCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const promptSlug = Array.isArray(params.promptId) ? params.promptId[0] : params.promptId;

  const [currentPromptData, setCurrentPromptData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000'); // Default to black
  const [brushSize, setBrushSize] = useState(5); // Default brush size

    // const { slug } = await params;
  
    // const session = await getAuthSession();
  
    // // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    // const identifier = params.slug || session?.user?.id || '';
  
    // // 2. Retrieve the memoized company data (no extra DB cost)
    // const company = await findCompanyCached(identifier, "page");
  
    // if (!company) {
    //   return <div>Company not found</div>;
    // }
  
    // // Use the actual database ID for your API calls, ensuring consistency
    // const companyId = company.id;

  // Fetch prompt data based on promptSlug (which maps to Course.code)
  useEffect(() => {
    const fetchPrompt = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentPromptData(null); // Clear previous data

      try {
        // Fetch all courses and find by 'code' (slug)
        const response = await fetch(`${apiBaseUrl}/student/courses`);

        if (response.ok) {
              const allCourses = await response.json();
              const courseData = allCourses.find((course: any) => course.code === promptSlug);

              if (courseData) {
                setCurrentPromptData({
                  title: courseData.title,
                  icon: courseData.imageUrl || '🎨', // Use imageUrl for icon, fallback to palette
                  guidance: courseData.description, // Map Course.description to guidance
                  audio: courseData.audioUrl,
                  // backgroundGradient and promptImage are UI-specific.
                  // If you want these dynamic, you'd need to add fields to your Course model (e.g., `themeGradient: String?`, `outlineImageUrl: String?`)
                  // For now, we'll use hardcoded values from sample data if not provided by API.
                  backgroundGradient: sampleDrawingPromptsData[promptSlug as keyof typeof sampleDrawingPromptsData]?.backgroundGradient || 'from-blue-200 to-cyan-300',
                  promptImage: sampleDrawingPromptsData[promptSlug as keyof typeof sampleDrawingPromptsData]?.promptImage || null,
                });
              } else {
                // No data from API, try to use specific sample data or generic fallback
                // console.warn(`No course found for slug: ${promptSlug}. Displaying sample data.`);
                setCurrentPromptData(sampleDrawingPromptsData[promptSlug as keyof typeof sampleDrawingPromptsData] || null);
                if (!sampleDrawingPromptsData[promptSlug as keyof typeof sampleDrawingPromptsData]) {
                  setError("Drawing prompt not found. Redirecting...");
                  router.replace('/play/drawing');
                  return;
                }
              }
          } else {
              // No data from API, try to use specific sample data or generic fallback
              // console.warn(`No course found for slug: ${promptSlug}. Displaying sample data.`);
              setCurrentPromptData(sampleDrawingPromptsData[promptSlug as keyof typeof sampleDrawingPromptsData] || null);
              if (!sampleDrawingPromptsData[promptSlug as keyof typeof sampleDrawingPromptsData]) {
                setError("Drawing prompt not found. Redirecting...");
                router.replace('/play/drawing');
                return;
              }
            }
      } catch (e: any) {
        // console.error("Failed to fetch drawing prompt:", e);
        setError("Failed to load drawing prompt. Displaying sample data.");
        setCurrentPromptData(sampleDrawingPromptsData[promptSlug as keyof typeof sampleDrawingPromptsData] || null);
        if (!sampleDrawingPromptsData[promptSlug as keyof typeof sampleDrawingPromptsData]) {
          router.replace('/play/drawing');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [promptSlug, router]); // Re-fetch if promptSlug changes

  // Play prompt-specific guidance audio when page loads or promptData changes
  useEffect(() => {
    if (audioRef.current && currentPromptData?.audio) {
      audioRef.current.src = currentPromptData.audio;
      audioRef.current.play().catch(e => console.error("Error playing drawing guidance audio:", e));
    }
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentPromptData]);

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions dynamically based on its container or a fixed ratio
    const resizeCanvas = () => {
      // For responsiveness, set internal resolution and then scale with CSS
      // Or, set canvas.width/height to match clientWidth/clientHeight of its parent
      // For simplicity, keeping fixed internal resolution for drawing quality
      // and letting CSS handle display size.
      // If you want pixel-perfect responsiveness, you'd adjust width/height here
      // and then clear/redraw content.
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial resize

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Optional: Load prompt image if available
    if (currentPromptData?.promptImage) {
      const img = new Image();
      img.src = currentPromptData.promptImage;
      img.onload = () => {
        // Clear canvas before drawing new image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw image stretched to fit canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.onerror = (e) => {
        // console.error("Error loading prompt image:", e);
        // Optionally display a fallback or error message on canvas
      };
    } else {
      // If no prompt image, ensure canvas is clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [currentPromptData]); // Depend on currentPromptData to redraw if prompt changes

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) { // Handle touch events
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else { // Handle mouse events
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // Scale coordinates from display size to internal canvas resolution
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault(); // Prevent scrolling on touch devices
    const { x, y } = getCanvasCoordinates(event);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault(); // Prevent scrolling on touch devices
    const { x, y } = getCanvasCoordinates(event);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
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
    if (currentPromptData?.promptImage) {
      const img = new Image();
      img.src = currentPromptData.promptImage;
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
    link.download = `${currentPromptData?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'my_drawing'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Replaced alert() with a console log for better practice in iframes
    // console.log('Your masterpiece is saved!');
  };

  if (isLoading || !currentPromptData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-200 to-red-300 text-white text-3xl font-bold">
        {isLoading ? "Loading drawing prompt..." : "Oops! Drawing prompt not found... heading back!"}
      </div>
    );
  }

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#FFFFFF'];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentPromptData.backgroundGradient} p-6 flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background Shapes */}
      <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-white rounded-full mix-blend-overlay opacity-30 animate-blob-slow animation-delay-500"></div>
      <div className="absolute bottom-1/4 right-1/4 w-52 h-52 bg-white rounded-full mix-blend-overlay opacity-30 animate-blob-slow animation-delay-1500"></div>

      {/* Back to Drawing Selection Button */}
      <Link href="/play/drawing" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back to drawing ideas">
        🎨
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-6 drop-shadow-lg animate-fadeInDown text-center px-4 z-10">
        {currentPromptData.title} {currentPromptData.icon}
      </h1>

      <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-6xl w-full flex flex-col items-center justify-center min-h-[70vh] z-10">
        <p className="text-3xl md:text-4xl font-semibold text-gray-700 text-center mb-6 animate-fadeInUp leading-relaxed">
          {currentPromptData.guidance}
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
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair bg-white touch-none" // Actual display size controlled by Tailwind
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
