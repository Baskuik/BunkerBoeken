import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function BookingPage() {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({ name: "", email: "", date: "", time: "", people: 1 });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable texts/images
  const [editableText, setEditableText] = useState({
    title: "Boek uw rondleiding",
    timesInfo: "Selecteer eerst een datum. Tijden zijn per uur van 10:00 t/m 17:00.",
    nameLabel: "Naam",
    emailLabel: "E-mail",
    peopleLabel: "Aantal personen",
    totalPriceLabel: "Totaal prijs: €10"
  });
  const [originalEditableText, setOriginalEditableText] = useState(editableText);

  // Opening hours
  const [openingHours, setOpeningHours] = useState({});
  const [originalOpeningHours, setOriginalOpeningHours] = useState({});

  // Max personen per datum
  const [maxPersonsPerDate, setMaxPersonsPerDate] = useState({});
  const [originalMaxPersonsPerDate, setOriginalMaxPersonsPerDate] = useState({});
  const [defaultMaxPersons, setDefaultMaxPersons] = useState(12); // default max personen

  // Standaard uren 10:00 t/m 17:00
  const standardSlots = Array.from({ length: 8 }, (_, i) => `${String(10 + i).padStart(2, "0")}:00`);

  const API_URL = "http://127.0.0.1:5000/api/settings";

  // Load settings from backend
  useEffect(() => {
    // Opening hours
    fetch(`${API_URL}/openingstijden`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setOpeningHours(data.value || {});
        setOriginalOpeningHours(data.value || {});
      })
      .catch(err => console.error("Kon openingstijden niet laden:", err));

    // Editable texts
    fetch(`${API_URL}/editableText`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          setEditableText(data.value);
          setOriginalEditableText(data.value);
        }
      })
      .catch(err => console.error("Kon editable texts niet laden:", err));

    // Max personen per datum
    fetch(`${API_URL}/maxpersonen`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          setMaxPersonsPerDate(data.value);
          setOriginalMaxPersonsPerDate(data.value);
        }
      })
      .catch(err => console.error("Kon max personen niet laden:", err));

    // Default max personen
    fetch(`${API_URL}/maxpersonen/default`, { credentials: "include" })
      .then(res => res.json())
      .then(data => { if (data.value) setDefaultMaxPersons(data.value); })
      .catch(() => setDefaultMaxPersons(12));
  }, []);

  // Check admin
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/me", { method: "GET", credentials: "include" })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => { if (form.date) setSelectedDate(form.date); }, [form.date]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "people") {
      const max = selectedDate ? (maxPersonsPerDate[selectedDate] || defaultMaxPersons) : defaultMaxPersons;
      setForm({ ...form, [name]: value === "" ? "" : Math.max(1, Math.min(max, Number(value))) });
    } else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const max = selectedDate ? (maxPersonsPerDate[selectedDate] || defaultMaxPersons) : defaultMaxPersons;
    const valid = form.name.trim() && emailValid && form.date && form.time && form.people >= 1 && form.people <= max;
    if (!valid) { setEmailTouched(true); return; }
    setSubmitting(true);

    try {
      const totalPrice = Number(form.people) * 10;
      const bookingData = { ...form, prijs: totalPrice };
      const res = await fetch("http://127.0.0.1:5000/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(bookingData)
      });

      const text = await res.text();
      let data; try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
      const bookingPayload = { id: data.id || null, ...bookingData, created_at: new Date().toISOString(), serverError: !res.ok ? data.error || data.raw : undefined };
      navigate(`/booking-confirm/${bookingPayload.id || "pending"}`, { state: { booking: bookingPayload } });
    } catch (err) {
      console.error(err);
      navigate(`/booking-confirm/pending`, { state: { booking: { ...form, prijs: Number(form.people) * 10, created_at: new Date().toISOString(), serverError: err.message || "network error" } } });
    } finally { setSubmitting(false); }
  };

  const isFormValid = () => {
    const max = selectedDate ? (maxPersonsPerDate[selectedDate] || defaultMaxPersons) : defaultMaxPersons;
    return form.name.trim() && emailValid && form.date && form.time && form.people >= 1 && form.people <= max;
  };

  // Kalender functies
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => new Date(y, m, 1).getDay();
  const buildCalendarGrid = (y, m) => { const d = []; const l = firstWeekday(y, m); for(let i=0;i<l;i++) d.push(null); for(let i=1;i<=daysInMonth(y,m);i++) d.push(new Date(y,m,i)); while(d.length%7!==0)d.push(null); return d; };
  const formatISO = date => date ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}` : "";
  const onSelectDate = date => {
    const iso = formatISO(date);
    setSelectedDate(iso);
    setForm({ ...form, date: iso, time: "", people: 1 });
  };
  const onSelectTime = time => setForm({ ...form, time });

  const days = buildCalendarGrid(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const monthName = calendarMonth.toLocaleString("default",{month:"long"});
  const yearNum = calendarMonth.getFullYear();
  const weekdayLabels = ["Su","Mo","Tue","We","Th","Fri","Sat"];
  const todayISO = formatISO(new Date());

  const currentTimeSlots = selectedDate
    ? standardSlots.filter(t => !(openingHours[selectedDate]?.removed||[]).includes(t)).concat(openingHours[selectedDate]?.extra||[]).sort()
    : [];

  // Admin functies
  const saveChanges = async () => {
    try {
      // Editable texts
      await fetch(`${API_URL}/editableText`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ value: editableText })
      });

      // Opening hours
      await fetch(`${API_URL}/openingstijden`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ value: openingHours })
      });

      // Max personen per datum
      await fetch(`${API_URL}/maxpersonen`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ value: maxPersonsPerDate })
      });

      setOriginalEditableText(editableText);
      setOriginalOpeningHours(openingHours);
      setOriginalMaxPersonsPerDate(maxPersonsPerDate);
      alert("Wijzigingen opgeslagen!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Fout bij opslaan wijzigingen");
    }
  };

  const cancelChanges = () => {
    setEditableText(originalEditableText);
    setOpeningHours(originalOpeningHours);
    setMaxPersonsPerDate(originalMaxPersonsPerDate);
    setIsEditing(false);
  };

  const toggleEditing = () => setIsEditing(true);

  const addTimeSlot = async () => {
    if (!selectedDate) return alert("Selecteer eerst een datum");
    const newTime = prompt("Nieuwe tijd (HH:MM) invoeren:", "18:00");
    if (!newTime) return;
    const dateTimes = openingHours[selectedDate]?.extra || [];
    if (!dateTimes.includes(newTime)) {
      const updatedSlots = [...dateTimes, newTime].sort();
      const updatedHours = { ...openingHours, [selectedDate]: { extra: updatedSlots, removed: openingHours[selectedDate]?.removed || [] } };
      setOpeningHours(updatedHours);
    } else alert("Deze tijd bestaat al!");
  };

  const removeTimeSlot = async time => {
    if (!isAdmin || !isEditing || !selectedDate) return;
    const dateData = openingHours[selectedDate] || { extra: [], removed: [] };
    let updatedExtra = dateData.extra || [], updatedRemoved = dateData.removed || [];
    if (standardSlots.includes(time)) {
      if (!updatedRemoved.includes(time)) updatedRemoved.push(time);
    } else updatedExtra = updatedExtra.filter(t => t !== time);
    const updatedHours = { ...openingHours, [selectedDate]: { extra: updatedExtra, removed: updatedRemoved } };
    setOpeningHours(updatedHours);
  };

  const resetTimeSlots = () => {
    if (!selectedDate) return;
    const updatedHours = { ...openingHours, [selectedDate]: { extra: [], removed: [] } };
    setOpeningHours(updatedHours);
  };

  return (
    <div className="font-sans min-h-screen bg-fixed" style={{ backgroundImage: "url('/images/BunkerfotoBuiten.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <div style={{ minHeight: "100vh", backgroundColor: "rgba(255,255,255,0.55)" }}>
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-4 bg-gray-500 shadow-sm">
          <div className="text-2xl font-bold text-white">Bunker rondleidingen</div>
          <ul className="flex space-x-6 text-gray-200 font-medium">
            <li><Link to="/" className="text-gray-200 hover:text-blue-300">home</Link></li>
            <li><a href="#overons" className="text-gray-200 hover:text-blue-300">over ons</a></li>
            <li><a href="#verhaal" className="text-gray-200 hover:text-blue-300">verhaal</a></li>
            <li><a href="#rondleiding" className="text-gray-200 hover:text-blue-300">rondleiding</a></li>
            <li><Link to="/boeken" className="text-gray-200 hover:text-blue-300">boeken</Link></li>
            <li><a href="#contact" className="text-gray-200 hover:text-blue-300">contact</a></li>
          </ul>
        </nav>

        {/* Admin buttons */}
        {isAdmin && (
          <div className="flex justify-end max-w-3xl mx-auto px-4 py-2 space-x-2">
            {!isEditing ? (
              <button onClick={toggleEditing} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Pagina bewerken</button>
            ) : (
              <>
                <button onClick={saveChanges} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Wijzigingen opslaan</button>
                <button onClick={cancelChanges} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Annuleren</button>
              </>
            )}
          </div>
        )}

        {/* Form + Calendar */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-4"
              contentEditable={isEditing} suppressContentEditableWarning
              onInput={(e) => setEditableText({ ...editableText, title: e.currentTarget.textContent })}>
            {editableText.title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-300 rounded shadow p-6">
            {/* Naam */}
            <div>
              <label className="block text-sm font-medium mb-1"
                     contentEditable={isEditing} suppressContentEditableWarning
                     onInput={(e) => setEditableText({ ...editableText, nameLabel: e.currentTarget.textContent })}>
                {editableText.nameLabel}
              </label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium mb-1"
                     contentEditable={isEditing} suppressContentEditableWarning
                     onInput={(e) => setEditableText({ ...editableText, emailLabel: e.currentTarget.textContent })}>
                {editableText.emailLabel}
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => setEmailTouched(true)}
                type="email"
                required
                className={`w-full border px-3 py-2 rounded ${emailTouched && !emailValid ? "border-red-500" : ""}`}
              />
            </div>

            {/* Kalender */}
            <div className="mt-4 p-4 border border-gray-100 rounded max-w-sm mx-auto bg-gray-400">
              <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="px-2 py-1 rounded hover:bg-gray-100">◀</button>
                <div className="text-sm font-medium text-gray-100">{monthName} {yearNum}</div>
                <button type="button" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="px-2 py-1 rounded hover:bg-gray-100">▶</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
                {weekdayLabels.map(d => <div key={d} className="font-semibold text-gray-100">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {days.map((day, idx) => {
                  const isSelected = day && formatISO(day) === selectedDate;
                  const isPast = day && formatISO(day) < todayISO;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => day && !isPast && onSelectDate(day)}
                      disabled={!day || isPast}
                      className={`w-full h-10 flex items-center justify-center rounded ${day ? (isSelected ? "bg-blue-600 text-white" : isPast ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-gray-100 hover:bg-gray-500") : ""}`}
                    >
                      {day ? day.getDate() : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tijden info */}
            <label className="block text-sm font-medium mb-2 text-center"
                   contentEditable={isEditing} suppressContentEditableWarning
                   onInput={(e) => setEditableText({ ...editableText, timesInfo: e.currentTarget.textContent })}>
              {editableText.timesInfo}
            </label>

            {/* Tijden */}
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-4 gap-2 max-w-sm">
                {currentTimeSlots.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { if(isAdmin && isEditing) removeTimeSlot(t); else onSelectTime(t); }}
                    className={`px-2 py-2 rounded border text-sm ${form.time === t ? "bg-blue-600 text-white" : "hover:bg-blue-50"}`}
                    title={isAdmin && isEditing ? "Klik om te verwijderen" : ""}
                  >
                    {t}
                  </button>
                ))}
                {isAdmin && isEditing && (
                  <button type="button" onClick={addTimeSlot} className="px-2 py-2 rounded border text-sm bg-green-500 text-white hover:bg-green-600">+</button>
                )}
              </div>
              {isAdmin && isEditing && selectedDate && (
                <button type="button" onClick={resetTimeSlots} className="mt-2 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm">
                  Reset tijden voor deze datum
                </button>
              )}
            </div>

            {/* Personen */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {`Aantal personen (max ${selectedDate ? (maxPersonsPerDate[selectedDate] || defaultMaxPersons) : defaultMaxPersons})`}
              </label>
              {isAdmin && isEditing && selectedDate && (
                <input
                  type="number"
                  value={maxPersonsPerDate[selectedDate] || defaultMaxPersons}
                  min="1"
                  onChange={(e) => setMaxPersonsPerDate({
                    ...maxPersonsPerDate,
                    [selectedDate]: Number(e.target.value)
                  })}
                  className="w-full border px-3 py-2 rounded mb-2"
                />
              )}
              <input
                name="people"
                value={form.people}
                onChange={handleChange}
                type="number"
                min="1"
                max={selectedDate ? (maxPersonsPerDate[selectedDate] || defaultMaxPersons) : defaultMaxPersons}
                className="w-full border px-3 py-2 rounded"
              />
              <div className="mt-2 text-sm font-medium text-gray-700">
                {editableText.totalPriceLabel.replace(/\d+/, form.people ? form.people * 10 : 0)}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={!isFormValid() || submitting}
                className={`px-6 py-3 rounded ${isFormValid() && !submitting ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-300 text-white cursor-not-allowed opacity-70"}`}
              >
                {submitting ? "Versturen..." : "Verstuur boeking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
