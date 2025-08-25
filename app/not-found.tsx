import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center p-8">
        {/* Whimsical Image or Illustration */}
        <div className="mb-8">
          {/* You would replace this div with an <Image> component from Next.js */}
          {/* For example: <Image src="/path/to/your-404-illustration.svg" alt="Lost Page Illustration" width={400} height={400} /> */}
          <div className="w-64 h-64 md:w-80 md:h-80 mx-auto rounded-full bg-blue-500 flex items-center justify-center">
            <span role="img" aria-label="emoji" className="text-8xl">
              🤷‍♂️
            </span>
          </div>
        </div>

        {/* The 404 number, styled as a central design element */}
        <h1 className="text-9xl md:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse">
          404
        </h1>
        
        {/* More engaging headline */}
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-4">
          Lost in the Digital Cosmos?
        </h2>

        {/* More personal and empathetic message */}
        <p className="mt-4 text-lg md:text-xl text-gray-400 max-w-lg mx-auto">
          Oops! It looks like you've ventured into uncharted territory. The page you're looking for seems to have vanished.
        </p>
        
        {/* A clear and inviting call-to-action button */}
        <Link href="/" className="mt-8 inline-block px-8 py-4 text-lg font-medium rounded-full bg-purple-600 hover:bg-purple-700 transition-colors duration-300 shadow-lg transform hover:scale-105">
            Take Me Home
        </Link>
      </div>
    </div>
  );
}