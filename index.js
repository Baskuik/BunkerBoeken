
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// zeg tegen express dat we statische bestanden (zoals React) gaan serveren
app.use(express.static(path.join(__dirname, 'client', 'build')));

// API route voorbeeld
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

// Alle andere routes sturen naar React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
