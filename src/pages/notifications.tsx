// pages/403.tsx
import { NextPage } from "next";
import Link from "next/link";
import React from "react";
import AddNotificationForm from '../components/AddNotificationForm';
import NotificationsList from '../components/NotificationsList';

export default function Home() {
  const userId = '123'; // Replace with the actual user ID, e.g., from session or authentication context

  return (
    <div>
      <h1>Notifications Management</h1>
      <AddNotificationForm />
      <NotificationsList />
    </div>
  );
}
