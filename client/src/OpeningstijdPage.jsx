import React, { useEffect, useState } from "react";

export default function OpeningstijdPage() {
  const [openings, setOpenings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchOpening() {
      const res = await fetch("/api/settings/openingstijden");
      const data = await res.json();
      setOpenings(JSON.parse(data.value));
      setLoading(false);
    }
    fetchOpening();
  }, []);

  function updateDag(dag, value) {
    setOpenings({ ...openings, [dag]: value });
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings/openingstijden", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: JSON.stringify(openings) }),
    });
    setSaving(false);
    alert("Openingstijden opgeslagen!");
  }

  if (loading) return <div className="p-6">Laden…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Openingstijden aanpassen</h1>
      {Object.keys(openings).map(dag => (
        <div key={dag} className="flex items-center gap-2 mb-2">
          <span className="w-24">{dag}</span>
          <input
            type="text"
            className="p-2 border rounded flex-1"
            value={openings[dag]}
            onChange={(e) => updateDag(dag, e.target.value)}
          />
        </div>
      ))}
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
