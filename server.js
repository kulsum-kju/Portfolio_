const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files explicitly (Secure against exposing .env)
const path = require('path');
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL successfully.'))
  .catch(err => console.error('Connection error', err.stack));

// Basic API Endpoint
app.get('/api/status', (req, res) => {
  res.json({ message: 'Backend is running and connected to PostgreSQL' });
});

// Example Data Route (Replace with your actual table and columns)
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
