import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function BookingPage() {
  const [form, setForm] = useState({ name: "", email: "", date: "", time: "", people: 1 });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // safety: re-check validity before submitting
    const valid =
      form.name.trim() &&
      form.email.trim() &&
      form.date &&
      form.time &&
      form.people &&
      Number(form.people) >= 1 &&
      Number(form.people) <= 12;
    if (!valid) return;
    console.log("Booking submitted:", form);
    alert("Boeking verzonden (demo): " + JSON.stringify(form));
  };
  
  // form validity used for button state
  const isFormValid =
    form.name.trim() &&
    form.email.trim() &&
    form.date &&
    form.time &&
    form.people &&
    Number(form.people) >= 1 &&
    Number(form.people) <= 12;

  const timeSlots = Array.from({ length: 8 }, (_, i) => {
    const hour = 10 + i;
    return `${String(hour).padStart(2, "0")}:00`;
  });

  const onSelectTime = (time) => {
    setForm({ ...form, time });
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstWeekday = (year, month) => new Date(year, month, 1).getDay();

  const buildCalendarGrid = (year, month) => {
    const days = [];
    const leading = firstWeekday(year, month);
    for (let i = 0; i < leading; i++) days.push(null);
    const total = daysInMonth(year, month);
    for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  };

  const prevMonth = () =>
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const formatISO = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const onSelectDate = (date) => {
    const iso = formatISO(date);
    setSelectedDate(iso);
    setForm({ ...form, date: iso, time: "" });
  };

  const days = buildCalendarGrid(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const monthName = calendarMonth.toLocaleString("default", { month: "long" });
  const yearNum = calendarMonth.getFullYear();
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  const todayISO = formatISO(new Date());
  const isSelectedDayPast = selectedDate && selectedDate < todayISO;

  return (
    <div
      className="font-sans min-h-screen bg-fixed"
      style={{
        backgroundImage: "url('/images/BunkerfotoBuiten.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* semi-transparent overlay so content stays readable */}
      {/* lower alpha so background image shows through more */}
      <div style={{ minHeight: "100vh", backgroundColor: "rgba(255,255,255,0.55)" }}>
        {/* Navbar (copied from HomePage) */}
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

        <div className="max-w-3xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-4">Boek uw rondleiding</h2>

          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-300 rounded shadow">
            <div>
              <label className="block text-sm font-medium mb-1">Naam</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" required className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              {/* centered label for chosen date */}
              <label className="block text-sm font-medium mb-1 text-center">Gekozen datum</label>
              <div className="flex items-center justify-center space-x-3">
                <input
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  type="text"
                  placeholder="Kies een datum in de kalender"
                  readOnly
                  className="w-48 border px-3 py-2 rounded bg-gray-50 text-center"
                />
                <input
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  type="text"
                  placeholder="Kies een tijd"
                  readOnly
                  className="w-32 border px-3 py-2 rounded bg-gray-50 text-center"
                />
                <button
                  type="button"
                  onClick={() => { setSelectedDate(""); setForm({ ...form, date: "", time: "" }); }}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Clear
                </button>
              </div>

              {/* Inline calendar */}
              <div className="mt-4 p-4 border border-gray-100 rounded max-w-sm mx-auto bg-gray-400">
                <div className="flex justify-between items-center mb-2">
                  <button type="button" onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-100">◀</button>
                  <div className="text-sm font-medium text-gray-100">{monthName} {yearNum}</div>
                  <button type="button" onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-100">▶</button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
                  {weekdayLabels.map((d) => (
                    <div key={d} className="font-semibold text-gray-100">{d}</div>
                  ))}
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
                        className={
                          "w-full h-10 flex items-center justify-center rounded " +
                          (day
                            ? isSelected
                              ? "bg-blue-600 text-white"
                              : isPast
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "text-gray-100 hover:bg-gray-500"
                            : "")
                        }
                        aria-pressed={isSelected}
                      >
                        {day ? day.getDate() : ""}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs text-gray-200">
                  Klik een datum om te selecteren. Grijze datums zijn in het verleden.
                </div>
              </div>

              {/* Time selection */}
              <div className="mt-4">
                {/* centered label for time selection */}
                <label className="block text-sm font-medium mb-2 text-center">Kies tijd (per uur)</label>
                <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
                  {timeSlots.map((t) => {
                    const isSelected = form.time === t;
                    const disableTimes = !selectedDate || isSelectedDayPast;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => !disableTimes && onSelectTime(t)}
                        disabled={disableTimes}
                        className={
                          "px-2 py-2 rounded border text-sm " +
                          (isSelected ? "bg-blue-600 text-white" : disableTimes ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-blue-50")
                        }
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Selecteer eerst een datum. Tijden zijn per uur van 10:00 t/m 17:00.
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Aantal personen (max 12)</label>
              <input
                name="people"
                value={form.people}
                onChange={handleChange}
                type="number"
                min="1"
                max="12"
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={
                    "px-6 py-3 rounded " +
                    (isFormValid
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-300 text-white cursor-not-allowed opacity-70")
                  }
                >
                  Verstuur boeking
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}