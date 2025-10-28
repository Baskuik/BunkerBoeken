const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const port = 5000;

// --- Middleware ---
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// --- MySQL connection pool ---
const pool = mysql.createPool({
  host: "localhost",
  user: "root",               // your MySQL user
  password: "your_root_password", // replace with your root password
  database: "bookings",       // your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- Test route ---
app.get("/", (req, res) => res.send("Server is running"));

// --- POST /api/bookings ---
app.post("/api/bookings", async (req, res) => {
  const { name, email, date, time, people } = req.body;

  if (!name || !email || !date || !time || !people) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // --- Option B: check for duplicate date/time ---
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM bookings WHERE date = ? AND time = ?",
      [date, time]
    );

    if (rows[0].count > 0) {
      return res.status(400).json({ error: "Tijdslot al geboekt" });
    }

    // --- Insert booking ---
    const [result] = await pool.execute(
      `INSERT INTO bookings (name, email, date, time, people)
       VALUES (?, ?, ?, ?, ?)`,
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

// --- GET /api/bookings/:id ---
app.get("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM bookings WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Start server ---
app.listen(port, () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});

