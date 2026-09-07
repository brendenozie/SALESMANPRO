import { useEffect, useState } from 'react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<any>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/notifications`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        } else {
          console.error('Failed to fetch notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <h2>Your Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications available</p>
      ) : (
        <ul>
          {notifications.map((notification:any) => (
            <li key={notification.id}>
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              <p><small>{new Date(notification.createdAt).toLocaleString()}</small></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
