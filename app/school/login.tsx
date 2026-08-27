import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Toggle between student/lecturer
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      router.push(session.user.role === "student" ? "/student" : "/lecturer");
    }
  }, [session, router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      role,
    });

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push(role === "student" ? "/student" : "/lecturer");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md text-center"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome {role === "student" ? "Student" : "Lecturer"}!</h2>
        <p className="text-gray-500 mb-6">Sign in to continue</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {/* Role Toggle */}
        <div className="flex mb-6 justify-center gap-4">
          <button 
            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${role === "student" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setRole("student")}
          >
            Student
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${role === "lecturer" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setRole("lecturer")}
          >
            Lecturer
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        {/* Additional Options */}
        <p className="text-gray-500 text-sm mt-4">
          Don't have an account? <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
        </p>
      </motion.div>
    </div>
  );
}
