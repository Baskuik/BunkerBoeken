const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const port = 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// --- MySQL pool ---
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",          // replace with your MySQL root password
  database: "bookings",  // database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test server
app.get("/", (req, res) => res.send("Server is running"));

// --- POST: add new booking ---
app.post("/api/bookings", async (req, res) => {
  const { name, email, date, time, people } = req.body;

  if (!name || !email || !date || !time || !people)
    return res.status(400).json({ error: "Missing fields" });

  try {
    // Check if this slot is already booked
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM bookings WHERE date = ? AND time = ?",
      [date, time]
    );
    if (rows[0].count > 0)
      return res.status(400).json({ error: "Tijdslot al geboekt" });

    const [result] = await pool.execute(
      "INSERT INTO bookings (name, email, date, time, people) VALUES (?, ?, ?, ?, ?)",
      [name, email, date, time, people]
    );

    res.json({
      id: result.insertId,
      name,
      email,
      date,
      time,
      people,
      created_at: new Date().toISOString()
    });

  } catch (err) {
    console.error("Error inserting booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET: fetch a booking by ID ---
app.get("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute("SELECT * FROM bookings WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Booking not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET: fetch booked times for a specific date ---
app.get("/api/bookings", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Missing date" });

  try {
    const [rows] = await pool.execute("SELECT time FROM bookings WHERE date = ?", [date]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Start server ---
app.listen(port, () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});
