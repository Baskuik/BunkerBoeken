import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Inloggen mislukt");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-200"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 rounded-lg bg-white/20 border border-white/30 w-full text-white placeholder-gray-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-300"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-lg ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>

          {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
        </form>

        {/* Terug naar home knop */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-blue-400 hover:text-blue-600 underline"
          >
            Terug naar home
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
