// StatistiekenPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs";
import "dayjs/locale/nl.js";
import isoWeek from "dayjs/plugin/isoWeek.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
dayjs.locale("nl");
dayjs.extend(isoWeek);

export default function StatistiekenPage() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("week");
  const [type, setType] = useState("geld");
  const [chartData, setChartData] = useState(null);
  const [calendarDate, setCalendarDate] = useState(dayjs());
  const [showCalendar, setShowCalendar] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const fetchStatistics = async (date = calendarDate) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/statistics?timeframe=${timeframe}&type=${type}&date=${date.format("YYYY-MM-DD")}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Kon statistieken niet ophalen");
      const data = await res.json();
      setChartData(data);
    } catch (err) {
      console.error(err);
      setChartData(null);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [timeframe, type, calendarDate]);

  // Klik buiten dropdown sluit menu
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const data = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: type === "geld" ? "Omzet (€)" : "Tickets verkocht",
        data: chartData?.values || [],
        backgroundColor:
          type === "geld"
            ? "rgba(37, 99, 235, 0.7)"
            : "rgba(16, 185, 129, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text:
          chartData &&
          (type === "geld"
            ? `Omzet per ${timeframe}`
            : `Tickets verkocht per ${timeframe}`),
        font: { size: 20 },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const renderHeaderInfo = () => {
    if (!chartData) return "Laden...";
    if (timeframe === "week") {
      const { weekRange } = chartData;
      if (!weekRange) return "Week";
      return `Week van ${weekRange.start} t/m ${weekRange.end}`;
    }
    if (timeframe === "maand") {
      return `Maand: ${calendarDate.format("MMMM")} ${calendarDate.year()}`;
    }
    if (timeframe === "jaar") {
      return `Jaar: ${calendarDate.year()}`;
    }
  };

  // Kalender functies
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7;
  const buildCalendarGrid = (y, m) => {
    const d = [];
    const l = firstWeekday(y, m);
    for (let i = 0; i < l; i++) d.push(null);
    for (let i = 1; i <= daysInMonth(y, m); i++) d.push(new Date(y, m, i));
    while (d.length % 7 !== 0) d.push(null);
    return d;
  };
  const formatISO = (date) =>
    date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      : "";
  const onSelectDate = (date) => {
    setCalendarDate(dayjs(date));
    setShowCalendar(false);
  };

  const calendarMonth = calendarDate.toDate();
  const days = buildCalendarGrid(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth()
  );
  const monthName = calendarDate.format("MMMM");
  const yearNum = calendarDate.year();
  const weekdayLabels = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const todayISO = formatISO(new Date());

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-6 text-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-4 mb-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-white font-semibold text-lg">
          <div className="w-8 h-8 bg-gray-300 rounded" />
          Admin
        </div>

        {/* User icon + dropdown */}
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
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/account");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-t-lg"
              >
                Account
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-b-lg"
              >
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-col items-center w-full max-w-5xl gap-6">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Statistieken Dashboard
        </h1>

        {/* Terug naar inzien knop — zelfde styling als terug naar dashboard */}
        <button
          onClick={() => navigate("/inzien")}
          className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition w-full"
        >
          Terug naar inzien
        </button>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <label className="font-medium">Tijdframe:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border rounded px-3 py-1 text-gray-800"
            >
              <option value="week">Week</option>
              <option value="maand">Maand</option>
              <option value="jaar">Jaar</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium">Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border rounded px-3 py-1 text-gray-800"
            >
              <option value="geld">Geld</option>
              <option value="tickets">Tickets</option>
            </select>
          </div>
        </div>

        {/* Week info */}
        <div
          className="text-center mb-4 font-medium text-lg cursor-pointer select-none"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          {renderHeaderInfo()} {showCalendar ? "▲" : "▼"}
        </div>

        {/* Kalender */}
        {showCalendar && (
          <div className="border border-white/20 rounded-2xl p-4 mb-6 max-w-xs mx-auto bg-white/10 backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <button
                type="button"
                onClick={() => setCalendarDate(calendarDate.subtract(1, "month"))}
                className="px-2 py-1 rounded hover:bg-white/20"
              >
                ◀
              </button>
              <div className="font-medium">
                {monthName} {yearNum}
              </div>
              <button
                type="button"
                onClick={() => setCalendarDate(calendarDate.add(1, "month"))}
                className="px-2 py-1 rounded hover:bg-white/20"
              >
                ▶
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
              {weekdayLabels.map((d) => (
                <div key={d} className="font-semibold">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
              {days.map((day, idx) => {
                const isSelected =
                  day && formatISO(day) === calendarDate.format("YYYY-MM-DD");
                const isPast = day && formatISO(day) < todayISO;
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
                          : "hover:bg-blue-100"
                        : ""
                    }`}
                  >
                    {day ? day.getDate() : ""}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="mb-8 w-full" style={{ height: 400 }}>
          {chartData ? (
            <Bar options={options} data={data} />
          ) : (
            <p className="text-gray-400 text-center">
              Geen data beschikbaar voor dit filter.
            </p>
          )}
        </div>

        {/* Terug naar dashboard */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
          >
            Terug naar dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
