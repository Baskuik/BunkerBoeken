import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function AdminAccountPage() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setAdmin(data);
        } else if (res.status === 401) {
          navigate("/adminlogin");
        } else {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.message || "Kon gegevens niet laden");
        }
      } catch (err) {
        if (mounted) setError(err.message || "Fout bij laden");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMe();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      // ignore
    } finally {
      navigate("/adminlogin");
    }
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (loading) return <div className="p-6 text-white">Laden…</div>;
  if (error) return <div className="p-6 text-red-400">Fout: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-6">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-4 mb-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-white font-semibold text-lg">
          <div className="w-8 h-8 bg-gray-300 rounded" />
          Admin
        </div>

        {/* user icon + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            title="Account menu"
          >
            <i className="fa-solid fa-circle-user text-xl" aria-hidden="true"></i>
            <span className="sr-only">Open account menu</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={() => {
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-t-lg"
              >
                Account
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-b-lg"
              >
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center w-full max-w-4xl gap-6">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Accountgegevens
        </h1>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full flex flex-col gap-4 text-white">
          <div>
            <label className="block font-semibold mb-1">Admin ID</label>
            <div className="p-3 bg-white/20 rounded">{admin?.adminId ?? "Onbekend"}</div>
          </div>

          <div>
            <label className="block font-semibold mb-1">E-mailadres</label>
            <div className="p-3 bg-white/20 rounded">{admin?.email ?? "Onbekend"}</div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Terug naar dashboard
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-gray-800 rounded hover:bg-gray-50 transition"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
