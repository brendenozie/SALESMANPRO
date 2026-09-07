import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
  import { signIn } from "next-auth/react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e:any) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (res.ok) {
        await signIn("credentials", { email, password, redirect: false });
        if(role === "STUDENT") {
          router.push("/student");
        } else {
          router.push("/lecturer");
        }
      } else {
        setError("Signup failed. Try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md text-center"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Join as a {role === "STUDENT" ? "STUDENT" : "LECTURER"}!</h2>
        <p className="text-gray-500 mb-6">Create an account to get started</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Role Toggle */}
        <div className="flex mb-6 justify-center gap-4">
          <button
            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${role === "STUDENT" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setRole("STUDENT")}
          >
            Student
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${role === "LECTURER" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setRole("LECTURER")}
          >
            Lecturer
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="password"
              required
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-4">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
        </p>
      </motion.div>
    </div>
  );
}
