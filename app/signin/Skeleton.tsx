export default function Skeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl space-y-4 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto" />
        <div className="h-12 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-300 rounded" />
      </div>
    </div>
  );
}