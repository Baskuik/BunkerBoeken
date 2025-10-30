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
  const [bookedTimes, setBookedTimes] = useState([]);
  const [bookedTimesLoading, setBookedTimesLoading] = useState(false);
  const [bookedTimesError, setBookedTimesError] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  // Helpers
  const formatISO = (date) =>
    date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";

  const today = new Date();
  const todayISO = formatISO(today);

  const isDayPast = (date) => {
    if (!date) return false;
    return formatISO(date) < todayISO;
  };

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
            setBookedTimes([]); // no bookings
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setBookedTimes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching booked times:", err);
        setBookedTimes([]);
        setBookedTimesError(true);
      } finally {
        setBookedTimesLoading(false);
      }
    };

    fetchBookedTimes();
  }, [selectedDate]);

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

      const bookingPayload = { id: data.id || "pending", ...bookingData, created_at: new Date().toISOString() };

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
  };
  const onSelectTime = (time) => setForm({ ...form, time });

  const days = buildCalendarGrid(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const monthName = calendarMonth.toLocaleString("default", { month: "long" });
  const yearNum = calendarMonth.getFullYear();
  const weekdayLabels = ["Su", "Mo", "Tue", "We", "Th", "Fri", "Sat"];
  const isSelectedDayPast = selectedDate && selectedDate < todayISO;

  return (
    <div className="font-sans min-h-screen bg-fixed" style={{ backgroundImage: "url('/images/BunkerfotoBuiten.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <div style={{ minHeight: "100vh", backgroundColor: "rgba(255,255,255,0.55)" }}>
        <nav className="flex justify-between items-center px-8 py-4 bg-gray-500 shadow-sm">
          <div className="text-2xl font-bold text-white">Bunker rondleidingen</div>
          <ul className="flex space-x-6 text-gray-200 font-medium">
            <li><Link to="/" className="hover:text-blue-300">home</Link></li>
            <li><a href="#overons" className="hover:text-blue-300">over ons</a></li>
            <li><a href="#verhaal" className="hover:text-blue-300">verhaal</a></li>
            <li><a href="#rondleiding" className="hover:text-blue-300">rondleiding</a></li>
            <li><Link to="/boeken" className="hover:text-blue-300">boeken</Link></li>
            <li><a href="#contact" className="hover:text-blue-300">contact</a></li>
          </ul>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-4">Boek uw rondleiding</h2>

          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-300 rounded shadow p-6">
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

            {/* Date and Time */}
            <div>
              <label className="block text-sm font-medium mb-1 text-center">Gekozen datum</label>
              <div className="flex items-center justify-center space-x-3">
                <input name="date" value={form.date} readOnly placeholder="Kies een datum" className="w-48 border px-3 py-2 rounded text-center bg-gray-50" />
                <input name="time" value={form.time} readOnly placeholder="Kies een tijd" className="w-32 border px-3 py-2 rounded text-center bg-gray-50" />
                <button type="button" onClick={() => { setSelectedDate(""); setForm({ ...form, date: "", time: "" }); }} className="px-3 py-1 border rounded text-sm">Clear</button>
              </div>
            </div>

            {/* Calendar */}
            <div className="mt-4 p-4 border border-gray-100 rounded max-w-sm mx-auto bg-gray-400">
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

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => day && !isPast && onSelectDate(day)}
                      disabled={!day || isPast}
                      className={`w-full h-10 flex items-center justify-center rounded ${
                        day
                          ? isSelected
                            ? "bg-blue-600 text-white"
                            : isPast
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
              <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
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
              <div className="mt-2 text-sm font-medium text-gray-700">Totaal prijs: €{form.people ? form.people * 10 : 0}</div>
            </div>

            {/* Submit */}
            <div className="flex justify-center mt-6">
              <button type="submit" disabled={!isFormValid || submitting} className={`px-6 py-3 rounded ${isFormValid && !submitting ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-300 text-white cursor-not-allowed opacity-70"}`}>
                {submitting ? "Versturen..." : "Verstuur boeking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
