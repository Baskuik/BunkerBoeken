import React, { useEffect, useState } from "react";

export default function KostenPage() {
  const [kosten, setKosten] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchKosten() {
      const res = await fetch("/api/settings/kosten");
      const data = await res.json();
      setKosten(Number(data.value));
      setLoading(false);
    }
    fetchKosten();
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings/kosten", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: kosten }),
    });
    setSaving(false);
    alert("Kosten opgeslagen!");
  }

  if (loading) return <div className="p-6">Laden…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Prijs per persoon</h1>
      <input
        type="number"
        className="w-32 p-2 border rounded"
        value={kosten}
        onChange={(e) => setKosten(Number(e.target.value))}
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
