import { useState } from 'react';

export default function AddNotificationForm() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = async (e :any) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, message, userId }), // Adjust to target multiple users if needed
      });
      if (response.ok) {
        alert('Notification added successfully');
        setTitle('');
        setMessage('');
        setUserId('');
      } else {
        alert('Failed to add notification');
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Message:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <div>
        <label>User ID:</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>
      <button type="submit">Add Notification</button>
    </form>
  );
}
