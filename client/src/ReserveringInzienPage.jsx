import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReserveringInzienPage() {
  const navigate = useNavigate();

  // Reservations & loading
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sorting & Pagination
  const [sortOption, setSortOption] = useState("alphabetical"); // alphabetical | price | datetime | people
  const [limit, setLimit] = useState(25);

  // Modal for add/edit
  const [modalType, setModalType] = useState(""); // "" | "add" | "edit"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    people: 1,
    prijsPerPerson: 0,
    maxPersons: 12,
    id: null,
  });

  // Calendar/time logic
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [standardSlots] = useState(
    Array.from({ length: 8 }, (_, i) => `${String(10 + i).padStart(2, "0")}:00`)
  );

  // Settings
  const [openingHours, setOpeningHours] = useState({});
  const [pricePerDate, setPricePerDate] = useState({});
  const [maxPersonsPerDate, setMaxPersonsPerDate] = useState({});
  const [defaultPrice, setDefaultPrice] = useState(10);
  const [defaultMaxPersons, setDefaultMaxPersons] = useState(12);

  const API_BOOKINGS = "http://127.0.0.1:5000/api/bookings";
  const API_SETTINGS = "http://127.0.0.1:5000/api/settings";

  // Fetch reservations
  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BOOKINGS}`, { credentials: "include" });
      if (!res.ok) throw new Error("Kon reserveringen niet ophalen");
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      setError(err.message || "Fout bij laden");
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const [oh, ppd, mpd, defPriceRes, defMaxRes] = await Promise.all([
        fetch(`${API_SETTINGS}/openingstijden`, { credentials: "include" }).then(r => r.json()),
        fetch(`${API_SETTINGS}/pricePerDate`, { credentials: "include" }).then(r => r.json()),
        fetch(`${API_SETTINGS}/maxpersonen`, { credentials: "include" }).then(r => r.json()),
        fetch(`${API_SETTINGS}/pricePerDate/default`, { credentials: "include" }).then(r => r.json()),
        fetch(`${API_SETTINGS}/maxpersonen/default`, { credentials: "include" }).then(r => r.json()),
      ]);

      setOpeningHours(oh.value || {});
      setPricePerDate(ppd.value || {});
      setMaxPersonsPerDate(mpd.value || {});
      setDefaultPrice(defPriceRes.value || 10);
      setDefaultMaxPersons(defMaxRes.value || 12);
    } catch (err) {
      console.error("Kon instellingen niet laden", err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchSettings();
  }, []);

  // Helper: combine date+time
  const parseDateTime = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}:00`);

  // Calendar helpers
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => new Date(y, m, 1).getDay();
  const buildCalendarGrid = (y, m) => {
    const d = [];
    const l = firstWeekday(y, m);
    for (let i = 0; i < l; i++) d.push(null);
    for (let i = 1; i <= daysInMonth(y, m); i++) d.push(new Date(y, m, i));
    while (d.length % 7 !== 0) d.push(null);
    return d;
  };
  const formatISO = (date) =>
    date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
  const todayISO = formatISO(new Date());

  // Datum-specifieke instellingen helper
  const getDatumSpecifiekeInstellingen = (date) => {
    const prijsPerPerson = pricePerDate[date] ?? defaultPrice;
    const maxPersons = maxPersonsPerDate[date] ?? defaultMaxPersons;
    const slots = ((openingHours[date]?.extra || standardSlots)
      .filter((t) => !(openingHours[date]?.removed || []).includes(t))
      .sort());
    return { prijsPerPerson, maxPersons, slots };
  };

  // Select date
  const onSelectDate = (date) => {
    const iso = formatISO(date);
    const { prijsPerPerson, maxPersons } = getDatumSpecifiekeInstellingen(iso);
    setSelectedDate(iso);
    setFormData(f => ({
      ...f,
      date: iso,
      time: "",
      people: 1,
      prijsPerPerson,
      maxPersons,
    }));
  };

  // Select time
  const onSelectTime = (time) => setFormData(f => ({ ...f, time }));

  // Add / Edit
  const handleAddOrUpdate = async () => {
    const { id, name, email, date, time, people, prijsPerPerson } = formData;
    if (!name || !email || !date || !time || !people) return alert("Vul alle velden in.");
    const prijs = people * (prijsPerPerson ?? defaultPrice);
    const payload = { name, email, date, time, people, prijs };
    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `${API_BOOKINGS}/${id}` : API_BOOKINGS;
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      fetchReservations();
      setModalType("");
    } catch (err) {
      alert("Fout bij opslaan: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Weet je zeker dat je deze boeking wilt verwijderen?")) return;
    try {
      const res = await fetch(`${API_BOOKINGS}/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      fetchReservations();
    } catch (err) {
      alert("Fout bij verwijderen: " + err.message);
    }
  };

  // Edit reservation
  const onEditReservation = (reservation) => {
    const { prijsPerPerson, maxPersons, slots } = getDatumSpecifiekeInstellingen(reservation.date);
    const time = slots.includes(reservation.time) ? reservation.time : "";
    setSelectedDate(reservation.date);
    setFormData({
      ...reservation,
      prijsPerPerson,
      maxPersons,
      time,
    });
    setModalType("edit");
  };

  const currentTimeSlots = selectedDate ? getDatumSpecifiekeInstellingen(selectedDate).slots : [];

  // Sorting & Pagination
  const sortedReservations = [...reservations]
    .sort((a, b) => {
      if (sortOption === "alphabetical") return a.name.localeCompare(b.name);
      if (sortOption === "price") return b.prijs - a.prijs;
      if (sortOption === "datetime") return parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time);
      if (sortOption === "people") return b.people - a.people;
      return 0;
    })
    .slice(0, limit);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Reserveringen Inzien</h1>

      {/* Terug naar inzien knop */}
      <button
        onClick={() => navigate("/inzien")}
        className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition w-full mb-4"
      >
        Terug naar inzien
      </button>

      <div className="flex gap-3 mb-4">
        <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="px-3 py-2 rounded text-gray-800">
          <option value="alphabetical">Alfabetisch (Naam)</option>
          <option value="price">Prijs (hoog → laag)</option>
          <option value="datetime">Datum/Tijd</option>
          <option value="people">Aantal personen</option>
        </select>
        <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="px-3 py-2 rounded text-gray-800">
          <option value={25}>Eerste 25</option>
          <option value={50}>Eerste 50</option>
          <option value={100}>Eerste 100</option>
          <option value={250}>Eerste 250</option>
          <option value={500}>Eerste 500</option>
        </select>
        <button onClick={() => setModalType("add")} className="px-3 py-2 bg-green-600 rounded hover:bg-green-700">Nieuwe boeking</button>
        <button onClick={fetchReservations} className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700">Vernieuwen</button>
      </div>

      {loading ? <p>Laden…</p> : error ? <p className="text-red-400">{error}</p> : (
        <div className="overflow-x-auto w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-2 text-left">Naam</th>
                <th>E-mail</th>
                <th>Datum</th>
                <th>Tijd</th>
                <th>Aantal</th>
                <th>Prijs</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {sortedReservations.map(r => (
                <tr key={r.id} className="border-b border-white/20 hover:bg-white/10">
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td>{r.people}</td>
                  <td>€{Number(r.prijs).toFixed(2)}</td>
                  <td className="flex gap-1">
                    <button onClick={() => onEditReservation(r)} className="px-2 py-1 bg-yellow-500 rounded hover:bg-yellow-600">Bewerken</button>
                    <button onClick={() => handleDelete(r.id)} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700">Verwijderen</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-96 text-white">
            <h2 className="text-xl font-bold mb-4">{modalType === "add" ? "Nieuwe boeking" : "Bewerk boeking"}</h2>

            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Naam" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-3 py-2 rounded text-gray-800"/>
              <input type="email" placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-3 py-2 rounded text-gray-800"/>

              {/* Kalender */}
              <div className="p-2 border rounded bg-gray-400">
                <div className="flex justify-between items-center mb-2">
                  <button type="button" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth()-1,1))} className="px-2 py-1 rounded hover:bg-gray-100">◀</button>
                  <div>{calendarMonth.toLocaleString("default",{month:"long"})} {calendarMonth.getFullYear()}</div>
                  <button type="button" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth()+1,1))} className="px-2 py-1 rounded hover:bg-gray-100">▶</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {buildCalendarGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()).map((day, idx) => {
                    const iso = day ? formatISO(day) : "";
                    const isSelected = iso === selectedDate;
                    const isPast = iso && iso < todayISO;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!day || isPast}
                        onClick={() => day && onSelectDate(day)}
                        className={`w-full h-10 flex items-center justify-center rounded ${isSelected ? "bg-blue-600 text-white" : isPast ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-500"}`}
                      >
                        {day ? day.getDate() : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tijden */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {currentTimeSlots.map(t => (
                  <button key={t} type="button" onClick={() => onSelectTime(t)} className={`px-2 py-2 rounded border ${formData.time === t ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Personen en prijs */}
              <input type="number" min="1" max={formData.maxPersons} value={formData.people} onChange={e => setFormData({...formData, people: Number(e.target.value)})} className="px-3 py-2 rounded text-gray-800"/>
              <div>Totaal prijs: €{(formData.people*(formData.prijsPerPerson??defaultPrice)).toFixed(2)}</div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalType("")} className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-700">Annuleren</button>
              <button onClick={handleAddOrUpdate} className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700">{modalType==="add"?"Toevoegen":"Opslaan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
