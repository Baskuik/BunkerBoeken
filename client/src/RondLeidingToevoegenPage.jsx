import React, { useEffect, useState } from "react";

export default function RondLeidingToevoegenPage() {
  const [rondleidingen, setRondleidingen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchRondleidingen() {
      const res = await fetch("/api/settings/rondleidingen");
      const data = await res.json();
      setRondleidingen(JSON.parse(data.value) || []);
      setLoading(false);
    }
    fetchRondleidingen();
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings/rondleidingen", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: JSON.stringify(rondleidingen) }),
    });
    setSaving(false);
    alert("Rondleidingen opgeslagen!");
  }

  function addRondleiding() {
    const nextId = rondleidingen.length ? Math.max(...rondleidingen.map(r => r.id)) + 1 : 1;
    setRondleidingen([...rondleidingen, { id: nextId, tijd: "10:00", naam: `Rondleiding ${nextId}` }]);
  }

  function removeRondleiding(id) {
    setRondleidingen(rondleidingen.filter(r => r.id !== id));
  }

  function updateRondleiding(id, field, value) {
    setRondleidingen(rondleidingen.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  if (loading) return <div className="p-6">Laden…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Rondleidingen beheren</h1>
      {rondleidingen.map(r => (
        <div key={r.id} className="flex items-center gap-2 mb-2">
          <input
            type="text"
            className="p-2 border rounded w-24"
            value={r.tijd}
            onChange={(e) => updateRondleiding(r.id, "tijd", e.target.value)}
          />
          <input
            type="text"
            className="p-2 border rounded flex-1"
            value={r.naam}
            onChange={(e) => updateRondleiding(r.id, "naam", e.target.value)}
          />
          <button
            className="px-2 py-1 bg-red-600 text-white rounded"
            onClick={() => removeRondleiding(r.id)}
          >
            Verwijderen
          </button>
        </div>
      ))}
      <button className="px-4 py-2 bg-green-600 text-white rounded mt-2" onClick={addRondleiding}>
        Toevoegen
      </button>
      <button
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded mt-2"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Opslaan…" : "Opslaan"}
      </button>
    </div>
  );
}
