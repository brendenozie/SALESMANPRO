import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";
import React, { useState } from "react";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

type Props = {
  session: Session;
};

const DeleteMyData = ({ session }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDeleteData = async () => {
    setIsLoading(true);
    try {
      // API call to delete the user's data
      const response = await fetch("/api/delete-my-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session?.user?.id }),
      });

      if (response.ok) {
        setIsDeleted(true);
      } else {
        alert("There was an issue deleting your data. Please try again later.");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <UserLayout>
        <div className="flex flex-col bg-gray-900 text-white w-full min-h-screen">
          <UserNav />
          <div className="container mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-20 mb-6">
              <h2 className="text-2xl font-bold text-red-500 dark:text-red-300 mb-2 text-center">
                Delete My Data
              </h2>
              {isDeleted ? (
                <p className="text-green-500 text-center">
                  Your data has been successfully deleted. We're sorry to see you go!
                </p>
              ) : (
                <>
                  <p className="font-normal text-gray-500 mb-4">
                    Deleting your data is permanent and cannot be undone. This will remove all
                    personal data associated with your account, including your email address, name,
                    exercise history, and progress data.
                  </p>
                  <h3 className="text-lg font-semibold text-black dark:text-white mt-6 mb-2">
                    What happens when you delete your data?
                  </h3>
                  <p className="font-normal text-gray-500 dark:text-gray-300">
                    All of your account information and activity will be permanently deleted from
                    our system. You will no longer be able to access your workout history, 
                    progress, or any other data related to your account. This action is irreversible.
                  </p>
                  <h3 className="text-lg font-semibold text-black dark:text-white mt-6 mb-2">
                    Are you sure you want to proceed?
                  </h3>
                  <p className="font-normal text-gray-500 dark:text-gray-300">
                    If you would like to delete your data, please confirm your request by clicking
                    the button below. If you change your mind, you can always reach out to our
                    support team to get help.
                  </p>
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleDeleteData}
                      className={`px-6 py-2 text-white font-semibold rounded-lg bg-red-600 hover:bg-red-700 ${
                        isLoading ? "cursor-not-allowed opacity-50" : ""
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? "Deleting..." : "Delete My Data"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </UserLayout>
    </>
  );
};

export default DeleteMyData;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
};
