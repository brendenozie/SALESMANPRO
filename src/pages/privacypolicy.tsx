import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";
import React from "react";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

type Props = {
  session: Session;
};

const PrivacyPolicy = ({ session }: Props) => {
  return (
    <>
      <UserLayout>
        <div className="flex flex-col bg-gray-900 text-white w-full min-h-screen">
          <UserNav />
          <div className="container mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-20 mb-6">
              <h2 className="text-2xl font-bold text-purple-500 dark:text-purple-300 mb-2 text-center">
                Privacy Policy
              </h2>
              <p className="font-normal text-gray-500 mb-4">
                Welcome to our workout app. Your privacy is important to us. This
                Privacy Policy outlines how we handle your personal data and ensure your information remains secure.
              </p>
              <h3 className="text-lg font-semibold text-black dark:text-white mt-6 mb-2">
                Data Collection
              </h3>
              <p className="font-normal text-gray-500 dark:text-gray-300">
                We collect personal information, including your email address, name, and exercise data. This data helps improve the user experience and enables tracking of workout progress.
              </p>
              <h3 className="text-lg font-semibold text-black dark:text-white mt-6 mb-2">
                How We Use Your Data
              </h3>
              <p className="font-normal text-gray-500 dark:text-gray-300">
                Your data is used to personalize your workout recommendations, improve app features, and provide customer support. We may also use anonymized data for research and statistical analysis.
              </p>
              <h3 className="text-lg font-semibold text-black dark:text-white mt-6 mb-2">
                Data Sharing and Security
              </h3>
              <p className="font-normal text-gray-500 dark:text-gray-300">
                We do not share your personal data with third parties, except as required by law. Our app uses industry-standard security measures to protect your data from unauthorized access.
              </p>
              <h3 className="text-lg font-semibold text-black dark:text-white mt-6 mb-2">
                Your Rights
              </h3>
              <p className="font-normal text-gray-500 dark:text-gray-300">
                You have the right to access, correct, or delete your personal information. You can manage your data preferences in the app settings or by contacting our support team.
              </p>
              <h3 className="text-lg font-semibold text-black dark:text-white mt-6 mb-2">
                Changes to This Policy
              </h3>
              <p className="font-normal text-gray-500 dark:text-gray-300">
                We may update this Privacy Policy from time to time. Any changes will be posted here, and we encourage you to review the policy periodically.
              </p>
              <p className="font-normal text-gray-500 dark:text-gray-300 mt-6">
                If you have any questions about our privacy practices, please contact us at support@workoutapp.com.
              </p>
            </div>
          </div>
        </div>
      </UserLayout>
    </>
  );
};

export default PrivacyPolicy;

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
