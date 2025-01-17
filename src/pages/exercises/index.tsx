import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserLayout from '@/components/UserLayout';
import UserNav from '@/components/UserNav';
import { IExercise } from '@/types/typings';

export default function ExercisesList() {
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchExercises = async () => {
      const res = await fetch(`/api/get-exercise?page=${currentPage}`);
      const data = await res.json();
      setExercises(data.results);
      setTotalPages(data.InfoResponse.pages);
    };
    fetchExercises();
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto p-6">
          <h1 className="text-5xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
            Exercise List
          </h1>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {exercises.map((exercise) => (
              <Link href={`/exercises/${exercise.id}`} key={exercise.id}>
                <div className="relative bg-gradient-to-br from-white to-gray-100 h-80 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                  {/* Image Section */}
                  {exercise.exPic && (
                    <img
                      src={exercise.exPic}
                      alt={exercise.exName}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-6">
                    {/* Decorative background accent */}
                    <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-lg"></div>

                    {/* Exercise Name */}
                    <h2 className="text-2xl font-semibold h-20 text-gray-900 mb-3 relative z-10 transition-transform duration-300 hover:scale-110">
                      {exercise.exName}
                    </h2>

                    {/* Exercise Description */}
                    <p className="text-gray-700 mb-4 truncate relative z-10">
                      {exercise.exDesc}
                    </p>

                    {/* Edit Link */}
                    <div className="text-blue-600 font-medium hover:underline relative z-10">
                      Edit Exercise
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-8">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-l hover:bg-blue-500 disabled:bg-gray-500"
            >
              Previous
            </button>
            <span className="px-4">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-500 disabled:bg-gray-500"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

