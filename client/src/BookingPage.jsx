import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function BookingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", date: "", time: "", people: 1 });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [bookedTimesByDate, setBookedTimesByDate] = useState({}); // { '2025-10-31': ['10:00','11:00'] }
  const [bookedTimesLoading, setBookedTimesLoading] = useState(false);
  const [bookedTimesError, setBookedTimesError] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState([]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  // Helpers
  const formatISO = (date) =>
    date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";

  const today = new Date();
  const todayISO = formatISO(today);

  const isDayPast = (date) => (date ? formatISO(date) < todayISO : false);

  const isTimePast = (dateISO, time) => {
    if (!dateISO || !time) return false;
    const [year, month, day] = dateISO.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const slotDate = new Date(year, month - 1, day, hours, minutes);
    return slotDate < new Date();
  };

  const timeSlots = Array.from({ length: 8 }, (_, i) => `${String(10 + i).padStart(2, "0")}:00`);

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

  // Check if a date is fully booked
  const isDateFullyBooked = (date) => {
    if (!date) return false;
    const iso = formatISO(date);
    return fullyBookedDates.includes(iso);
  };

  // Fetch booked times when a date is selected
  useEffect(() => {
  if (!selectedDate) return;

  const fetchBookedTimes = async () => {
    try {
      setBookedTimesLoading(true);
      setBookedTimesError(false);

      const res = await fetch(`http://localhost:5000/api/bookings?date=${selectedDate}`);
      if (!res.ok) {
        if (res.status === 404) {
          setBookedTimesByDate(prev => ({ ...prev, [selectedDate]: [] }));
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const times = Array.isArray(data)
        ? data.map((b) => b?.time).filter(Boolean)
        : [];

      // Store booked times for this specific date
      setBookedTimesByDate(prev => ({ ...prev, [selectedDate]: times }));

      // Mark fully booked if all slots taken
      if (times.length >= timeSlots.length && !fullyBookedDates.includes(selectedDate)) {
        setFullyBookedDates(prev => [...prev, selectedDate]);
      }
    } catch (err) {
      console.error("Error fetching booked times:", err);
      setBookedTimesByDate(prev => ({ ...prev, [selectedDate]: [] }));
      setBookedTimesError(true);
    } finally {
      setBookedTimesLoading(false);
    }
  };

  fetchBookedTimes();
}, [selectedDate, timeSlots.length, fullyBookedDates]); // removed fullyBookedDates
  const bookedTimes = bookedTimesByDate[selectedDate] || [];

{timeSlots.map((t) => {
  const isBooked = bookedTimes.some(bt => bt.slice(0, 5) === t);
  const disableTime =
    !selectedDate || bookedTimesLoading || bookedTimesError || isBooked || isTimePast(selectedDate, t);
  const isSelected = form.time === t;
  return (
    <button
      key={t}
      type="button"
      onClick={() => !disableTime && onSelectTime(t)}
      disabled={disableTime}
      className={`px-2 py-2 rounded border text-sm ${
        isSelected
          ? "bg-blue-600 text-white"
          : disableTime
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "hover:bg-blue-50"
      }`}
    >
      {t}
    </button>
  );
})}


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
      const bookingData = { ...form }; // do not send prijs to backend if DB doesn't have it

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      let data = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const bookingPayload = { id: data.id || "pending", ...bookingData, prijs: totalPrice, created_at: new Date().toISOString() };

      navigate(`/booking-confirm/${bookingPayload.id}`, { state: { booking: bookingPayload } });
    } catch (err) {
      console.error("Submit booking error:", err);
      navigate(`/booking-confirm/pending`, {
        state: {
          booking: { ...form, prijs: Number(form.people) * 10, created_at: new Date().toISOString(), serverError: err.message || "Network error" },
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

  const prevMonth = () => {
    const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    if (prev.getFullYear() < today.getFullYear() || (prev.getFullYear() === today.getFullYear() && prev.getMonth() < today.getMonth())) return;
    setCalendarMonth(prev);
  };

  const nextMonth = () => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const onSelectDate = (date) => {
  const iso = formatISO(date);
  setSelectedDate(iso);
  setForm({ ...form, date: iso, time: "" });
  // Clear previously selected times for this UI update
  if (!bookedTimesByDate[iso]) {
    setBookedTimesByDate(prev => ({ ...prev, [iso]: [] }));
  }
};  
  const onSelectTime = (time) => setForm({ ...form, time });

  const days = buildCalendarGrid(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const monthName = calendarMonth.toLocaleString("default", { month: "long" });
  const yearNum = calendarMonth.getFullYear();
  const weekdayLabels = ["Su", "Mo", "Tue", "We", "Th", "Fr", "Sa"];

  

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
      <div style={{ minHeight: "100vh", backgroundColor: "rgba(255,255,255,0.55)" }}>
        {/* Navbar */}
        <nav className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-gray-500 shadow-sm space-y-2 sm:space-y-0">
          <div className="text-xl sm:text-2xl font-bold text-white">Bunker rondleidingen</div>
          <ul className="flex flex-wrap justify-center gap-3 sm:space-x-6 text-gray-200 font-medium text-sm sm:text-base">
            <li><Link to="/" className="hover:text-blue-300">home</Link></li>
            <li><a href="verhaal" className="hover:text-blue-300">verhaal</a></li>
            <li><Link to="/boeken" className="hover:text-blue-300">boeken</Link></li>
            <li><a href="contact" className="hover:text-blue-300">contact</a></li>
          </ul>
        </nav>

        {/* Booking Form */}
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">Boek uw rondleiding</h2>

          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-300 rounded shadow p-4 sm:p-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Naam</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
            </div>

            {/* Email */}
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

            {/* Date and Time Display */}
            <div>
              <label className="block text-sm font-medium mb-1 text-center">Gekozen datum</label>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:space-x-3">
                <input name="date" value={form.date} readOnly placeholder="Kies een datum" className="w-48 border px-3 py-2 rounded text-center bg-gray-50" />
                <input name="time" value={form.time} readOnly placeholder="Kies een tijd" className="w-32 border px-3 py-2 rounded text-center bg-gray-50" />
                <button
                  type="button"
                  onClick={() => { setSelectedDate(""); setForm({ ...form, date: "", time: "" }); }}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="mt-4 p-3 sm:p-4 border border-gray-100 rounded w-full max-w-sm mx-auto bg-gray-400">
              <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-100">←</button>
                <div className="text-sm font-medium text-gray-100">{monthName} {yearNum}</div>
                <button type="button" onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-100">→</button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
                {weekdayLabels.map((d) => <div key={d} className="font-semibold text-gray-100">{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                {days.map((day, idx) => {
                  const isSelected = day && formatISO(day) === selectedDate;
                  const isPast = day && isDayPast(day);
                  const isFull = day && isDateFullyBooked(day);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => day && !isPast && !isFull && onSelectDate(day)}
                      disabled={!day || isPast || isFull}
                      className={`w-full h-10 flex items-center justify-center rounded ${
                        day
                          ? isSelected
                            ? "bg-blue-600 text-white"
                            : isPast || isFull
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "text-gray-100 hover:bg-gray-500"
                          : ""
                      }`}
                    >
                      {day ? day.getDate() : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-center">Kies tijd (per uur)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-sm mx-auto">
                {timeSlots.map((t) => {
                  const isBooked = bookedTimes.some((bt) => bt.slice(0, 5) === t);
                  const disableTime =
                    !selectedDate ||
                    bookedTimesLoading ||
                    bookedTimesError ||
                    isBooked ||
                    isTimePast(selectedDate, t);
                  const isSelected = form.time === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => !disableTime && onSelectTime(t)}
                      disabled={disableTime}
                      className={`px-2 py-2 rounded border text-sm ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : disableTime
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {bookedTimesLoading && <div className="text-gray-600 text-sm text-center mt-2">Tijden laden...</div>}
              {bookedTimesError && <div className="text-red-600 text-sm text-center mt-2">Kan geboekte tijden niet ophalen. Probeer het later opnieuw.</div>}
            </div>

            {/* People */}
            <div>
              <label className="block text-sm font-medium mb-1">Aantal personen (max 12)</label>
              <input name="people" value={form.people} onChange={handleChange} type="number" min="1" max="12" className="w-full border px-3 py-2 rounded" />
              <div className="mt-2 text-sm font-medium text-gray-700 text-center sm:text-left">
                Totaal prijs: €{form.people ? form.people * 10 : 0}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className={`px-6 py-3 rounded text-sm sm:text-base ${
                  isFormValid && !submitting ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-300 text-white cursor-not-allowed opacity-70"
                }`}
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

