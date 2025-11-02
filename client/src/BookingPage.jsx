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
  const [isAdmin] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Editable texts/images
  const [editableText, setEditableText] = useState({
    title: "Boek uw rondleiding",
    timesInfo: "Selecteer eerst een datum. Tijden zijn per uur van 10:00 t/m 17:00."
  });

  // Opening hours: extra tijden en verwijderde standaardtijden per datum
  const [openingHours, setOpeningHours] = useState({});

  // Standaard uren 10:00 t/m 17:00
  const standardSlots = Array.from({ length: 8 }, (_, i) => `${String(10 + i).padStart(2, "0")}:00`);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/settings/openingstijden")
      .then(res => res.json())
      .then(data => {
        setOpeningHours(data.value || {});
      })
      .catch(err => console.error("Kon openingstijden niet laden:", err));
  }, []);

  useEffect(() => {
    if (form.date) setSelectedDate(form.date);
  }, [form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "people") {
      const num = value === "" ? "" : Math.max(1, Math.min(12, Number(value)));
      setForm({ ...form, [name]: num });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid =
      form.name.trim() &&
      emailValid &&
      form.date &&
      form.time &&
      form.people &&
      Number(form.people) >= 1 &&
      Number(form.people) <= 12;

    if (!valid) {
      setEmailTouched(true);
      return;
    }

    setSubmitting(true);

    try {
      const totalPrice = Number(form.people) * 10;
      const bookingData = { ...form, prijs: totalPrice };

      const res = await fetch("http://127.0.0.1:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookingData),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }

      const bookingPayload = {
        id: data && data.id ? data.id : null,
        ...bookingData,
        created_at: new Date().toISOString(),
        serverError: !res.ok ? (data.error || data.raw || `status ${res.status}`) : undefined,
      };

      navigate(`/booking-confirm/${bookingPayload.id || "pending"}`, { state: { booking: bookingPayload } });
    } catch (err) {
      console.error(err);
      navigate(`/booking-confirm/pending`, {
        state: {
          booking: {
            ...form,
            prijs: Number(form.people) * 10,
            created_at: new Date().toISOString(),
            serverError: err.message || "network error",
          },
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    form.name.trim() &&
    emailValid &&
    form.date &&
    form.time &&
    form.people &&
    Number(form.people) >= 1 &&
    Number(form.people) <= 12;

  // Kalender logica
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstWeekday = (year, month) => new Date(year, month, 1).getDay();
  const buildCalendarGrid = (year, month) => {
    const days = [];
    const leading = firstWeekday(year, month);
    for (let i = 0; i < leading; i++) days.push(null);
    for (let d = 1; d <= daysInMonth(year, month); d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  };
  const prevMonth = () => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const formatISO = (date) =>
    date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
  const onSelectDate = (date) => {
    const iso = formatISO(date);
    setSelectedDate(iso);
    setForm({ ...form, date: iso, time: "" });
  };
  const onSelectTime = (time) => setForm({ ...form, time });

  const days = buildCalendarGrid(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const monthName = calendarMonth.toLocaleString("default", { month: "long" });
  const yearNum = calendarMonth.getFullYear();
  const weekdayLabels = ["Su", "Mo", "Tue", "We", "Th", "Fri", "Sat"];
  const todayISO = formatISO(new Date());
  const isSelectedDayPast = selectedDate && selectedDate < todayISO;

  // Voeg nieuwe tijd toe
  const addTimeSlot = async () => {
    if (!selectedDate) return alert("Selecteer eerst een datum");
    const newTime = prompt("Nieuwe tijd invoeren (HH:MM):", "18:00");
    if (!newTime) return;

    const dateTimes = openingHours[selectedDate]?.extra || [];
    if (!dateTimes.includes(newTime)) {
      const updatedSlots = [...dateTimes, newTime].sort();
      const updatedHours = {
        ...openingHours,
        [selectedDate]: { extra: updatedSlots, removed: openingHours[selectedDate]?.removed || [] }
      };
      setOpeningHours(updatedHours);

      try {
        await fetch("http://127.0.0.1:5000/api/settings/openingstijden", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: updatedHours }),
        });
        alert("Nieuwe tijd toegevoegd!");
      } catch (err) {
        console.error("Kon openingstijden niet opslaan:", err);
        alert("Fout bij opslaan openingstijden");
      }
    } else {
      alert("Deze tijd bestaat al voor deze datum!");
    }
  };

  // Verwijder tijd (standaard of extra)
  const removeTimeSlot = async (time) => {
    if (!isAdmin || !isEditing || !selectedDate) return;
    const dateData = openingHours[selectedDate] || { extra: [], removed: [] };
    let updatedExtra = dateData.extra || [];
    let updatedRemoved = dateData.removed || [];

    if (standardSlots.includes(time)) {
      if (!updatedRemoved.includes(time)) updatedRemoved.push(time);
    } else {
      updatedExtra = updatedExtra.filter(t => t !== time);
    }

    const updatedHours = {
      ...openingHours,
      [selectedDate]: { extra: updatedExtra, removed: updatedRemoved }
    };
    setOpeningHours(updatedHours);

    try {
      await fetch("http://127.0.0.1:5000/api/settings/openingstijden", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: updatedHours }),
      });
      alert(`Tijd ${time} verwijderd!`);
    } catch (err) {
      console.error("Kon openingstijden niet opslaan:", err);
      alert("Fout bij opslaan openingstijden");
    }
  };

  // Reset tijden voor geselecteerde datum
  const resetTimeSlots = async () => {
    if (!selectedDate) return;
    const updatedHours = {
      ...openingHours,
      [selectedDate]: { extra: [], removed: [] }
    };
    setOpeningHours(updatedHours);

    try {
      await fetch("http://127.0.0.1:5000/api/settings/openingstijden", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: updatedHours }),
      });
      alert("Tijden voor deze datum zijn gereset naar standaard!");
    } catch (err) {
      console.error("Kon openingstijden niet opslaan:", err);
      alert("Fout bij opslaan openingstijden");
    }
  };

  // Bereken huidige tijdslots voor geselecteerde datum
  const currentTimeSlots = selectedDate
    ? standardSlots.filter(t => !(openingHours[selectedDate]?.removed || []).includes(t))
        .concat(openingHours[selectedDate]?.extra || [])
        .sort()
    : [];

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

        {/* Admin bewerken knop */}
        {isAdmin && (
          <div className="flex justify-end max-w-3xl mx-auto px-4 py-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Pagina bewerken</button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Done</button>
            )}
          </div>
        )}

        {/* Form en kalender */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h2
            className="text-2xl font-bold mb-4"
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onInput={(e) => setEditableText({ ...editableText, title: e.currentTarget.textContent })}
          >
            {editableText.title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-300 rounded shadow p-6">
            {/* Naam, email */}
            <div>
              <label className="block text-sm font-medium mb-1">Naam</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => setEmailTouched(true)}
                type="email"
                required
                className={`w-full border px-3 py-2 rounded ${emailTouched && !emailValid ? "border-red-500" : ""}`}
              />
              {emailTouched && !emailValid && <p className="text-red-600 text-sm mt-1">Voer een geldig e-mailadres in.</p>}
            </div>

            {/* Kalender */}
            <div className="mt-4 p-4 border border-gray-100 rounded max-w-sm mx-auto bg-gray-400">
              <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-100">◀</button>
                <div className="text-sm font-medium text-gray-100">{monthName} {yearNum}</div>
                <button type="button" onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-100">▶</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
                {weekdayLabels.map((d) => <div key={d} className="font-semibold text-gray-100">{d}</div>)}
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
                      className={`w-full h-10 flex items-center justify-center rounded ${
                        day ? (isSelected ? "bg-blue-600 text-white" : isPast ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-gray-100 hover:bg-gray-500") : ""
                      }`}
                    >
                      {day ? day.getDate() : ""}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-gray-200">
                Klik een datum om te selecteren. Grijze datums zijn in het verleden of al geboekt.
              </div>
            </div>

            {/* Tijden */}
            <div className="mt-4">
              <label
                className="block text-sm font-medium mb-2 text-center"
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onInput={(e) => setEditableText({ ...editableText, timesInfo: e.currentTarget.textContent })}
              >
                {editableText.timesInfo}
              </label>
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-4 gap-2 max-w-sm">
                  {currentTimeSlots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        if (isAdmin && isEditing) removeTimeSlot(t);
                        else onSelectTime(t);
                      }}
                      className={`px-2 py-2 rounded border text-sm ${form.time === t ? "bg-blue-600 text-white" : "hover:bg-blue-50"}`}
                      title={isAdmin && isEditing ? "Klik om te verwijderen" : ""}
                    >
                      {t}
                    </button>
                  ))}
                  {isAdmin && isEditing && (
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="px-2 py-2 rounded border text-sm bg-green-500 text-white hover:bg-green-600"
                    >
                      +
                    </button>
                  )}
                </div>
                {isAdmin && isEditing && selectedDate && (
                  <button
                    type="button"
                    onClick={resetTimeSlots}
                    className="mt-2 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                  >
                    Reset tijden voor deze datum
                  </button>
                )}
              </div>
            </div>

            {/* Personen */}
            <div>
              <label className="block text-sm font-medium mb-1">Aantal personen (max 12)</label>
              <input name="people" value={form.people} onChange={handleChange} type="number" min="1" max="12" className="w-full border px-3 py-2 rounded" />
              <div className="mt-2 text-sm font-medium text-gray-700">
                Totaal prijs: €{form.people ? form.people * 10 : 0}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className={`px-6 py-3 rounded ${isFormValid && !submitting ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-300 text-white cursor-not-allowed opacity-70"}`}
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
