// app/[slug]/layout.tsx

import UserNav from "../../components/UserNav";
import React, { ReactNode, useState } from 'react';
import AdminLayout from "../../components/AdminLayout";

export default async function StoreLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: ReactNode;
}) {
  
  return (
    <AdminLayout>
            <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
                <UserNav />
                <div className="container mx-auto">
                  {children}
                </div>
          </div>
          {/* <Suspense fallback={<>Loading...</>}>
              <AddExerciseSchedule exercisesData={props.exercisesData} session={props.session} />
          </Suspense> */}
      </AdminLayout >
  );
}
