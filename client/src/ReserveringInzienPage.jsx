import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function ReserveringInzienPage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Reservations & loading
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sorting & Pagination
  const [sortOption, setSortOption] = useState("alphabetical");
  const [limit, setLimit] = useState(25);

  // Modal for add/edit
  const [modalType, setModalType] = useState("");
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

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {} finally {
      navigate("/adminlogin");
    }
  };

  // Fetch data
  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_BOOKINGS, { credentials: "include" });
      if (!res.ok) throw new Error("Kon reserveringen niet ophalen");
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      setError(err.message || "Fout bij laden");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(API_SETTINGS, { credentials: "include" });
      if (!res.ok) throw new Error("Kon instellingen niet ophalen");
      const data = await res.json();
      setOpeningHours(data.openingstijden || {});
      setPricePerDate(data.pricePerDate || {});
      setMaxPersonsPerDate(data.maxpersonen || {});
      setDefaultPrice(data.pricePerDate?.default ?? 10);
      setDefaultMaxPersons(data.maxpersonen?.default ?? 12);
    } catch (err) {
      console.error("Kon instellingen niet laden", err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchSettings();
  }, []);

  // Header dropdown click outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Helpers
  const parseDateTime = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}:00`);
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

  const getDatumSpecifiekeInstellingen = (date) => {
    const prijsPerPerson = pricePerDate[date] ?? defaultPrice;
    const maxPersons = maxPersonsPerDate[date] ?? defaultMaxPersons;
    let slots = [...standardSlots];
    const dateSetting = openingHours[date];
    if (dateSetting && typeof dateSetting === "object" && Array.isArray(dateSetting.extra)) {
      dateSetting.extra.forEach((t) => {
        if (!slots.includes(t)) slots.push(t);
      });
    }
    slots.sort((a, b) => {
      const [ah, am] = a.split(":").map(Number);
      const [bh, bm] = b.split(":").map(Number);
      return ah - bh || am - bm;
    });
    return { prijsPerPerson, maxPersons, slots };
  };

  const onSelectDate = async (date) => {
    const iso = formatISO(date);
    await fetchSettings();
    const { prijsPerPerson, maxPersons } = getDatumSpecifiekeInstellingen(iso);
    setSelectedDate(iso);
    setFormData((f) => ({
      ...f,
      date: iso,
      time: "",
      people: 1,
      prijsPerPerson,
      maxPersons,
    }));
  };

  const onSelectTime = (time) => setFormData((f) => ({ ...f, time }));

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

  const onEditReservation = async (reservation) => {
    await fetchSettings();
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
            <i className="fa-solid fa-circle-user text-xl" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={() => { setMenuOpen(false); navigate("/account"); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-t-lg"
              >
                Account
              </button>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-b-lg"
              >
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Reserveringen Inzien</h1>

        {/* Terug naar inzien knop */}
        <button
          onClick={() => navigate("/inzien")}
          className="w-full mb-6 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Terug naar inzien
        </button>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 justify-center">
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="px-3 py-2 rounded text-gray-800">
            <option value="alphabetical">Alfabetisch (Naam)</option>
            <option value="price">Prijs (hoog → laag)</option>
            <option value="datetime">Datum/Tijd</option>
            <option value="people">Aantal personen</option>
          </select>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="px-3 py-2 rounded text-gray-800">
            <option value={25}>Eerste 25</option>
            <option value={50}>Eerste 50</option>
            <option value={100}>Eerste 100</option>
            <option value={250}>Eerste 250</option>
            <option value={500}>Eerste 500</option>
          </select>
          <button onClick={() => setModalType("add")} className="px-3 py-2 bg-green-600 rounded hover:bg-green-700">Nieuwe boeking</button>
          <button onClick={fetchReservations} className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700">Vernieuwen</button>
        </div>

        {/* Tabel */}
        {loading ? (
          <p className="text-center">Laden…</p>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : (
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
                {sortedReservations.map((r) => (
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
      </main>
    </div>
  );
}
