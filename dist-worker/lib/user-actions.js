"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.deactivateAccount = exports.updateNotificationPreferences = exports.changePassword = exports.updateUserProfile = void 0;
async function updateUserProfile(data) {
    const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok)
        throw new Error((await res.json()).message);
    return res.json();
}
exports.updateUserProfile = updateUserProfile;
async function changePassword(oldPassword, newPassword) {
    const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (!res.ok)
        throw new Error((await res.json()).message);
    return res.json();
}
exports.changePassword = changePassword;
async function updateNotificationPreferences(preferences) {
    const res = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
    });
    if (!res.ok)
        throw new Error((await res.json()).message);
    return res.json();
}
exports.updateNotificationPreferences = updateNotificationPreferences;
async function deactivateAccount() {
    const res = await fetch("/api/user/soft-delete", {
        method: "DELETE",
    });
    if (!res.ok)
        throw new Error((await res.json()).message);
    return res.json();
}
exports.deactivateAccount = deactivateAccount;
async function logoutUser() {
    const res = await fetch("/api/auth/logout", {
        method: "POST",
    });
    if (!res.ok)
        throw new Error((await res.json()).message);
    return res.json();
}
exports.logoutUser = logoutUser;
