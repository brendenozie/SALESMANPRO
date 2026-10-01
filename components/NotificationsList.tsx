import { useEffect, useState } from 'react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/notifications`);
        if (response.ok) {
          const resData = await response.json();
          const items = Array.isArray(resData.data) ? resData.data : Array.isArray(resData) ? resData : [];
          setNotifications(items);
        } else {
          console.error('Failed to fetch notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications available</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.map((notification: any) => (
            <li key={notification.id} className="py-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
