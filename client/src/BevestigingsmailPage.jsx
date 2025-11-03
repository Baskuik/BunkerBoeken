import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function BevestigingsmailPage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [template, setTemplate] = useState({ subject: "", text: "", html: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      // ignore errors
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

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

        const res = await fetch(`${API_URL}/api/settings/booking_email_template`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Backend gaf geen geldige JSON terug (status ${res.status})`);

        const data = await res.json();

        const val = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        setTemplate(val || { subject: "", text: "", html: "" });
      } catch (err) {
        console.error("Fout bij laden template:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings/booking_email_template", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: template }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Kon niet opslaan: ${text}`);
      }

      alert("Template opgeslagen!");
    } catch (err) {
      console.error("Fout bij opslaan:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <div className="p-6 text-white">Laden…</div>;
  if (error)
    return <div className="p-6 text-red-400">Fout: {error}</div>;

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
                  navigate("/account");
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
          Bevestigingsmail bewerken
        </h1>

        <button
          onClick={() => navigate("/bewerken")}
          className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 w-full"
        >
          Terug naar bewerken
        </button>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full flex flex-col gap-4 text-white">
          <div>
            <label className="block font-semibold mb-1">Subject</label>
            <input
              className="w-full p-2 rounded bg-white/20 border border-white/30 text-white"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Text (plain text)</label>
            <textarea
              className="w-full h-32 p-2 rounded bg-white/20 border border-white/30 text-white"
              value={template.text}
              onChange={(e) => setTemplate({ ...template, text: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">HTML</label>
            <textarea
              className="w-full h-64 p-2 rounded bg-white/20 border border-white/30 text-white"
              value={template.html}
              onChange={(e) => setTemplate({ ...template, html: e.target.value })}
            />
          </div>

          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Opslaan…" : "Opslaan"}
          </button>
        </div>
      </main>
    </div>
  );
}
