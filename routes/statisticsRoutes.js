// routes/statisticsRoutes.js
import express from "express";
import { db } from "../index.js";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import weekday from "dayjs/plugin/weekday.js";

dayjs.extend(isoWeek);
dayjs.extend(weekday);

const router = express.Router();

router.get("/", async (req, res) => {
  const { timeframe, type } = req.query;

  try {
    let labels = [];
    let values = [];
    const now = dayjs();
    let year = now.year();

    if (timeframe === "week") {
      const startOfWeek = now.startOf("week");
      const endOfWeek = now.endOf("week");

      labels = Array.from({ length: 7 }, (_, i) =>
        startOfWeek.add(i, "day").format("dddd")
      );

      for (let i = 0; i < 7; i++) {
        const day = startOfWeek.add(i, "day").format("YYYY-MM-DD");
        const [rows] = await db.execute(
          `SELECT SUM(prijs) AS omzet, SUM(people) AS tickets FROM bookings WHERE DATE(date) = ?`,
          [day]
        );
        values.push(type === "geld" ? rows[0].omzet || 0 : rows[0].tickets || 0);
      }
    } else if (timeframe === "maand") {
      const startOfMonth = now.startOf("month");
      const endOfMonth = now.endOf("month");
      const weeksInMonth = Math.ceil(endOfMonth.date() / 7);

      labels = Array.from({ length: weeksInMonth }, (_, i) => `Week ${i + 1}`);

      for (let i = 0; i < weeksInMonth; i++) {
        const start = startOfMonth.add(i * 7, "day");
        const end = start.add(6, "day").isAfter(endOfMonth) ? endOfMonth : start.add(6, "day");

        const [rows] = await db.execute(
          `SELECT SUM(prijs) AS omzet, SUM(people) AS tickets FROM bookings WHERE DATE(date) BETWEEN ? AND ?`,
          [start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD")]
        );
        values.push(type === "geld" ? rows[0].omzet || 0 : rows[0].tickets || 0);
      }
    } else if (timeframe === "jaar") {
      labels = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      for (let i = 0; i < 12; i++) {
        const start = now.month(i).startOf("month");
        const end = now.month(i).endOf("month");

        const [rows] = await db.execute(
          `SELECT SUM(prijs) AS omzet, SUM(people) AS tickets FROM bookings WHERE DATE(date) BETWEEN ? AND ?`,
          [start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD")]
        );
        values.push(type === "geld" ? rows[0].omzet || 0 : rows[0].tickets || 0);
      }
    }

    res.json({ labels, values, year });

  } catch (err) {
    console.error("❌ Fout bij ophalen statistieken:", err);
    res.status(500).json({ error: "Fout bij ophalen statistieken" });
  }
});

export default router;
