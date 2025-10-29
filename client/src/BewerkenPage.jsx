import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function BewerkenPage() {
  const [activeTab, setActiveTab] = useState("email");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailTemplate: "",
    prices: [],
    capacity: {},
    tours: [],
    hours: {},
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await axios.get(`${API_URL}/api/settings/all`);
      setSettings(res.data);
    } catch (err) {
      console.error("Fout bij ophalen settings:", err);
    }
  }

  async function saveKey(key, value) {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/settings/${key}`, value);
      alert("Opgeslagen!");
    } catch (err) {
      alert("Opslaan mislukt!");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Rondleidingen bewerken</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          ["email", "Bevestigingsemail"],
          ["prices", "Kosten"],
          ["capacity", "Max personen"],
          ["tours", "Rondleidingen"],
          ["hours", "Openingstijden"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`px-4 py-2 rounded ${
              activeTab === key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Email Template */}
      {activeTab === "email" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Bevestigingsemail</h2>
          <textarea
            rows="12"
            value={settings.emailTemplate || ""}
            onChange={(e) =>
              setSettings({ ...settings, emailTemplate: e.target.value })
            }
            className="w-full border p-3 rounded font-mono text-sm"
            placeholder="HTML e-mailtemplate met {{name}}, {{date}}, {{time}}, {{people}}, {{price}}"
          />
          <button
            disabled={saving}
            onClick={() => saveKey("emailTemplate", settings.emailTemplate)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      )}

      {/* Prices */}
      {activeTab === "prices" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Kosten (JSON)</h2>
          <textarea
            rows="10"
            value={JSON.stringify(settings.prices, null, 2)}
            onChange={(e) =>
              setSettings({ ...settings, prices: JSON.parse(e.target.value) })
            }
            className="w-full border p-3 rounded font-mono text-sm"
          />
          <button
            disabled={saving}
            onClick={() => saveKey("prices", settings.prices)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      )}

      {/* Capacity */}
      {activeTab === "capacity" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Max personen</h2>
          <textarea
            rows="6"
            value={JSON.stringify(settings.capacity, null, 2)}
            onChange={(e) =>
              setSettings({
                ...settings,
                capacity: JSON.parse(e.target.value),
              })
            }
            className="w-full border p-3 rounded font-mono text-sm"
          />
          <button
            disabled={saving}
            onClick={() => saveKey("capacity", settings.capacity)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      )}

      {/* Tours */}
      {activeTab === "tours" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Rondleidingen</h2>
          <textarea
            rows="10"
            value={JSON.stringify(settings.tours, null, 2)}
            onChange={(e) =>
              setSettings({ ...settings, tours: JSON.parse(e.target.value) })
            }
            className="w-full border p-3 rounded font-mono text-sm"
          />
          <button
            disabled={saving}
            onClick={() => saveKey("tours", settings.tours)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      )}

      {/* Hours */}
      {activeTab === "hours" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Openingstijden</h2>
          <textarea
            rows="10"
            value={JSON.stringify(settings.hours, null, 2)}
            onChange={(e) =>
              setSettings({ ...settings, hours: JSON.parse(e.target.value) })
            }
            className="w-full border p-3 rounded font-mono text-sm"
          />
          <button
            disabled={saving}
            onClick={() => saveKey("hours", settings.hours)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      )}
    </div>
  );
}
