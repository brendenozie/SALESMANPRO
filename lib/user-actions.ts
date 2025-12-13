export async function updateUserProfile(data: {
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}) {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const res = await fetch("/api/user/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function updateNotificationPreferences(preferences: {
  emailAlerts: boolean; 
  smsAlerts: boolean;
  inAppNotifications: boolean;
}) {
  const res = await fetch("/api/user/notifications", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });

  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function deactivateAccount() {
  const res = await fetch("/api/user/soft-delete", {
    method: "DELETE",
  });

  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function logoutUser() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}