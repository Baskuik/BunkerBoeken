const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000" })); // your React app URL
app.use(bodyParser.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // your DB username
  password: "",       // if using XAMPP default, leave empty
  database: "bookings"
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");

  // Ensure table exists
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(10) NOT NULL,
      people INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_date_time (date, time)
    )
  `;
  db.query(createTableQuery, (err) => {
    if (err) console.error("❌ Error creating table:", err);
    else console.log("✅ bookings table ready");
  });
});

// ✅ GET endpoint — fetch booked times for a date
app.get("/api/bookings", (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing date parameter" });
  }

  const query = "SELECT time FROM bookings WHERE date = ?";
  db.query(query, [date], (err, results) => {
    if (err) {
      console.error("❌ Error fetching booked times:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results); // e.g. [{time: "10:00"}, {time: "13:00"}]
  });
});

// ✅ POST endpoint — save a booking
app.post("/api/bookings", (req, res) => {
  const { name, email, date, time, people } = req.body;

  if (!name || !email || !date || !time || !people) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO bookings (name, email, date, time, people)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [name, email, date, time, people], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Time slot already booked" });
      }
      console.error("❌ Error saving booking:", err);
      return res.status(500).json({ error: "Database insert failed" });
    }

    console.log("✅ Booking added:", result.insertId);
    res.json({ id: result.insertId, success: true });
  });
});

// Start server
app.listen(PORT, "127.0.0.1", () => {
  console.log(`🚀 Server listening on http://127.0.0.1:${PORT}`);
});
