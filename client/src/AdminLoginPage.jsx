import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // cookies meesturen
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Inloggen mislukt");
      }

      // Login gelukt → dashboard openen
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 p-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md text-white">
        <img
          src="/placeholder.png"
          alt="Bunker Logo"
          className="mx-auto mb-4 w-20 h-20 rounded-full shadow-md"
        />
        <h1 className="text-3xl font-bold mb-6 text-center tracking-wide">Admin Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-200">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/30 transition"
            />
          </div>

          <div className="relative">
            <label className="block mb-1 text-sm font-medium text-gray-200">Wachtwoord</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/30 transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-300 hover:text-white transition"
              aria-label="Toggle wachtwoord zichtbaar"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"} text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-blue-500/30`}
          >
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-400 text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-400/30">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminLoginPage;
