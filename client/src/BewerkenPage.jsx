// src/BewerkenPage.jsx
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
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    loadSettings();
    loadBookings();
  }, []);

  async function loadSettings() {
    try {
      const res = await axios.get(`${API_URL}/api/settings/all`, { withCredentials: true });
      setSettings({
        emailTemplate: res.data.emailTemplate || "",
        prices: res.data.prices || [],
        capacity: res.data.capacity || {},
        tours: res.data.tours || [],
        hours: res.data.hours || {},
      });
    } catch (err) {
      console.error("Fout bij ophalen settings:", err);
    }
  }

  async function saveKey(key, value) {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/settings/${key}`, { value }, { withCredentials: true });
      alert("Opgeslagen!");
    } catch (err) {
      alert("Opslaan mislukt!");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  /* -------------------- BOOKINGS -------------------- */
  async function loadBookings() {
    try {
      const res = await axios.get(`${API_URL}/api/bookings`, { withCredentials: true });
      setBookings(res.data);
    } catch (err) {
      console.error("Fout bij ophalen boekingen:", err);
    }
  }

  const handleBookingChange = (field, value) => {
    setEditingBooking({ ...editingBooking, [field]: value });
  };

  const saveBooking = async () => {
    if (!editingBooking || !editingBooking.id) return;
    try {
      await axios.put(`${API_URL}/api/bookings/${editingBooking.id}`, editingBooking, { withCredentials: true });
      alert("Boeking opgeslagen!");
      setEditingBooking(null);
      loadBookings();
    } catch (err) {
      alert("Opslaan mislukt!");
      console.error(err);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Weet je zeker dat je deze boeking wilt verwijderen?")) return;
    try {
      await axios.delete(`${API_URL}/api/bookings/${id}`, { withCredentials: true });
      alert("Boeking verwijderd!");
      loadBookings();
    } catch (err) {
      alert("Verwijderen mislukt!");
      console.error(err);
    }
  };

  /* -------------------- HELPERS -------------------- */
  const updateArrayItem = (tab, index, field, value) => {
    const arr = [...settings[tab]];
    arr[index][field] = value;
    setSettings({ ...settings, [tab]: arr });
  };

  const addArrayItem = (tab, newItem) => {
    const arr = [...settings[tab], newItem];
    setSettings({ ...settings, [tab]: arr });
  };

  const removeArrayItem = (tab, index) => {
    const arr = settings[tab].filter((_, i) => i !== index);
    setSettings({ ...settings, [tab]: arr });
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Rondleidingen bewerken</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          ["email", "Bevestigingsemail"],
          ["prices", "Kosten"],
          ["capacity", "Max personen"],
          ["tours", "Rondleidingen"],
          ["hours", "Openingstijden"],
          ["bookings", "Boekingen"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`px-4 py-2 rounded ${activeTab === key ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* -------------------- BOOKINGS TAB -------------------- */}
      {activeTab === "bookings" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Boekingen</h2>
          {editingBooking ? (
            <div className="mb-4 p-4 border rounded bg-gray-100">
              <h3 className="font-semibold mb-2">Bewerk boeking ID {editingBooking.id}</h3>
              <div className="grid gap-2">
                {["name", "email", "date", "time", "people", "prijs"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium">{field}</label>
                    <input
                      type={field === "people" || field === "prijs" ? "number" : "text"}
                      value={editingBooking[field] || ""}
                      onChange={(e) => handleBookingChange(field, field === "people" || field === "prijs" ? Number(e.target.value) : e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={saveBooking} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Opslaan</button>
                <button onClick={() => setEditingBooking(null)} className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">Annuleren</button>
              </div>
            </div>
          ) : (
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Naam</th>
                  <th className="border px-2 py-1">Email</th>
                  <th className="border px-2 py-1">Datum</th>
                  <th className="border px-2 py-1">Tijd</th>
                  <th className="border px-2 py-1">Personen</th>
                  <th className="border px-2 py-1">Prijs</th>
                  <th className="border px-2 py-1">Acties</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="border px-2 py-1">{b.id}</td>
                    <td className="border px-2 py-1">{b.name}</td>
                    <td className="border px-2 py-1">{b.email}</td>
                    <td className="border px-2 py-1">{b.date}</td>
                    <td className="border px-2 py-1">{b.time}</td>
                    <td className="border px-2 py-1">{b.people}</td>
                    <td className="border px-2 py-1">{b.prijs}</td>
                    <td className="border px-2 py-1 text-center">
                      <button onClick={() => setEditingBooking(b)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-1">Bewerk</button>
                      <button onClick={() => deleteBooking(b.id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Verwijder</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* -------------------- JE BESTAANDE TABS (email, prices, capacity, tours, hours) -------------------- */}
      {/* ...de rest van je bestaande code blijft hetzelfde */}
    </div>
  );
}
