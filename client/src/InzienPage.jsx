import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function InzienPage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {} finally {
      navigate("/adminlogin");
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/bookings", { credentials: "include" });
      if (!res.ok) throw new Error("Kon reserveringen niet ophalen");
      const data = await res.json();
      setList(data);
    } catch (err) {
      setError(err.message || "Fout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Header dropdown click outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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
            <i className="fa-solid fa-circle-user text-xl" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={() => { setMenuOpen(false); navigate("/account"); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-t-lg"
              >
                Account
              </button>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-b-lg"
              >
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center w-full max-w-5xl gap-6">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Wat wilt u bekijken?
        </h1>

        {/* Terug naar dashboard knop */}
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition w-full"
        >
          Terug naar dashboard
        </button>

        {/* Actie-kaarten */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() => alert("Statistieken pagina komt hier")}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition hover:bg-white/20 text-white"
          >
            <h2 className="text-lg font-semibold mb-2">Statistieken inzien</h2>
            <p className="text-sm text-gray-200">
              Bekijk de statistieken van de website.
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate("/reserveringen")}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition hover:bg-white/20 text-white"
          >
            <h2 className="text-lg font-semibold mb-2">Reserveringen inzien</h2>
            <p className="text-sm text-gray-200">
              Bekijk oude en toekomstige reserveringen.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
