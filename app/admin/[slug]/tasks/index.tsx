import AddExerciseSchedule from "../../../../components/AddExerciseSchedule";
import UserLayout from "../../../../components/UserLayout";
import UserNav from "../../../../components/UserNav";
import { Suspense, useState } from "react";
import { GetServerSidePropsContext } from "next";
import { IDailyPlan, IExercise } from "../../../../types/typings";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import Link from "next/link";
// import dayjs from "dayjs"; {dayjs(task.dueDate).format("MMMM DD")}
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";



type Task = {
  id: string;
  taskName: string;
  dueDate: string;
  dueTime: string;
  description: string;
  icon: string;
  status: string ; //"pending" | "completed" | "ongoing";
};

type Props = {
  tasksData?: Task[];
};

type GroupedTasks = {
  [status: string]: Task[];
};

const groupTasksByStatus = (tasks: Task[]): GroupedTasks => {
  const groupedTasks: GroupedTasks = tasks.reduce((acc, task) => {
    const status = task.status || "pending";
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {} as GroupedTasks);

  // Object.keys(groupedTasks).forEach((status) => {
  //   groupedTasks[status].sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)));
  // });

  return groupedTasks;
};

const DashNativeDND = (props: Props) => {
  const [tasks, setTasks] = useState(props.tasksData || []);
  const groupedTasks = groupTasksByStatus(tasks);
  const statuses = ["pending", "ongoing", "completed"] as const;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <UserNav />
        <div className="container mx-auto p-4">
          <h1 className="text-4xl font-bold mb-8 text-center">Task Dashboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {statuses.map((status) => (
              <div
                key={status}
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={handleDragOver}
                className="bg-gray-100 rounded-lg shadow-md p-4 min-h-[200px]"
              >
                <h2
                  className={`text-xl font-bold mb-4 text-center ${
                    status === "pending"
                      ? "text-yellow-500"
                      : status === "ongoing"
                      ? "text-blue-500"
                      : "text-green-500"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} Tasks
                </h2>

                {groupedTasks[status]?.length > 0 ? (
                  groupedTasks[status].map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white shadow-md rounded-lg p-4 mb-4 hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gray-200 flex justify-center items-center text-xl text-gray-700">
                          {task.icon}
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-bold text-gray-800 mb-1">
                            {task.taskName}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Due: 00:00:00 at {task.dueTime}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                      <Link href={`/tasks/${task.id}`}>
                                  <button className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-all duration-300">
                                    View Details
                                  </button>
                                </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center">
                    No tasks in this category.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>  
  );
};

export default DashNativeDND;


export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context);
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const tasksData = await fetch(`${url}/admin/tasks`)
    .then((res) => res.json())
    .catch(() => []);
  return { props: { session, tasksData } };
};
