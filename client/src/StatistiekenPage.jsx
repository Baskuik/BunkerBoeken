// StatistiekenPage.jsx
import React, { useEffect, useState } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StatistiekenPage() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("week");
  const [type, setType] = useState("geld");
  const [chartData, setChartData] = useState(null);

  const fetchStatistics = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/statistics?timeframe=${timeframe}&type=${type}`,
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
  }, [timeframe, type]);

  const data = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: type === "geld" ? "Omzet (€)" : "Tickets verkocht",
        data: chartData?.values || [],
        backgroundColor: type === "geld" ? "rgba(37, 99, 235, 0.7)" : "rgba(16, 185, 129, 0.7)",
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
        text: chartData
          ? type === "geld"
            ? `Omzet per ${timeframe}`
            : `Tickets verkocht per ${timeframe}`
          : "",
        font: { size: 20 },
      },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Bovenste info tekst
  const renderHeaderInfo = () => {
    if (!chartData) return null;

    const currentDate = dayjs();
    if (timeframe === "week") {
      return `Week: ${chartData.labels[0]} t/m ${chartData.labels[chartData.labels.length - 1]} (${chartData.year})`;
    }
    if (timeframe === "maand") {
      const monthName = currentDate.format("MMMM");
      return `Maand: ${monthName} ${chartData.year}`;
    }
    if (timeframe === "jaar") {
      return `Jaar: ${chartData.year}`;
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 p-6">
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Statistieken Dashboard</h1>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <label className="font-medium">Tijdframe:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border rounded px-3 py-1"
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
              className="border rounded px-3 py-1"
            >
              <option value="geld">Geld</option>
              <option value="tickets">Tickets</option>
            </select>
          </div>
        </div>

        {/* Header info */}
        <div className="text-center mb-4 font-medium text-gray-700 text-lg">
          {renderHeaderInfo()}
        </div>

        {/* Chart */}
        <div className="mb-8" style={{ height: 350 }}>
          {chartData ? (
            <Bar options={options} data={data} />
          ) : (
            <p className="text-gray-500 text-center">Geen data beschikbaar voor dit filter.</p>
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
      </div>
    </div>
  );
}
