import TaskDetails from "./TaskDetails";

export default async function TaskPage({ params }: { params: { id: string } }) {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const task = await fetch(`${url}/get-tasks/${params.id}`, {
    cache: "no-store", // ensures fresh data (similar to getServerSideProps)
  }).then((res) => res.json());

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Task not found.
      </div>
    );
  }

  // The client component handles updates and interactivity
  return <TaskDetails task={task} />;
}
