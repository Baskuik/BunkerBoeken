import React, { useEffect, useState } from "react";

export default function BevestigingsmailPage() {
  const [template, setTemplate] = useState({ subject: "", text: "", html: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

        const res = await fetch(`${API_URL}/api/settings/booking_email_template`, {
          credentials: "include"
        });

        if (!res.ok) throw new Error(`Backend gaf geen geldige JSON terug (status ${res.status})`);

        const data = await res.json();

        // Veilig parsen: alleen als string
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

  if (loading) return <div className="p-6">Laden…</div>;
  if (error) return <div className="p-6 text-red-600">Fout: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Bevestigingsmail bewerken</h1>

      <div>
        <label className="block font-medium mb-1">Subject</label>
        <input
          className="w-full p-2 border rounded"
          value={template.subject}
          onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Text (plain text)</label>
        <textarea
          className="w-full h-32 p-2 border rounded"
          value={template.text}
          onChange={(e) => setTemplate({ ...template, text: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">HTML</label>
        <textarea
          className="w-full h-64 p-2 border rounded"
          value={template.html}
          onChange={(e) => setTemplate({ ...template, html: e.target.value })}
        />
      </div>

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