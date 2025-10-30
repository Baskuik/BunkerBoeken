// src/BevestigingsmailPage.jsx
import React, { useEffect, useState } from "react";

export default function BevestigingsmailPage() {
  const [mail, setMail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  async function fetchMail() {
    try {
      // 👇 Hier vervang je de huidige fetch door dit
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

      const res = await fetch(`${API_URL}/api/settings/bevestigingsmail`, {
        credentials: "include" // stuurt de admin sessie cookie mee
      });

      if (!res.ok) {
        throw new Error(`Backend gaf geen geldige JSON terug (status ${res.status})`);
      }

      const data = await res.json();
      setMail(data.value || "");
    } catch (err) {
      console.error("Fout bij laden bevestigingsmail:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  fetchMail();
}, []);


  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings/bevestigingsmail", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: mail }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Kon niet opslaan: ${text}`);
      }

      alert("Bevestigingsmail opgeslagen!");
    } catch (err) {
      console.error("Fout bij opslaan:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Laden…</div>;
  if (error) return <div className="p-6 text-red-600">Fout: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Bevestigingsmail bewerken</h1>
      <textarea
        className="w-full h-64 p-2 border rounded"
        value={mail}
        onChange={(e) => setMail(e.target.value)}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Opslaan…" : "Opslaan"}
      </button>
    </div>
  );
}
