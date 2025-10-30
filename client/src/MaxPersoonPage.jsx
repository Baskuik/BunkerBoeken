import React, { useEffect, useState } from "react";

export default function MaxpersoonPage() {
  const [max, setMax] = useState(12);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchMax() {
      const res = await fetch("/api/settings/maxpersonen");
      const data = await res.json();
      setMax(Number(data.value) || 12);
      setLoading(false);
    }
    fetchMax();
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings/maxpersonen", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: max }),
    });
    setSaving(false);
    alert("Max personen opgeslagen!");
  }

  if (loading) return <div className="p-6">Laden…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Max personen per rondleiding</h1>
      <input
        type="number"
        className="w-32 p-2 border rounded"
        value={max}
        onChange={(e) => setMax(Number(e.target.value))}
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
