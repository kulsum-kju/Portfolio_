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
  ssl: process.env.DATABASE_URL.includes('onrender.com') || process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Real check for DB connection
pool.connect()
  .then(client => {
    console.log('Connected to PostgreSQL successfully.');
    client.release();
    // Create messages table automatically if it doesn't exist
    return pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  })
  .then(() => console.log('Messages table is ready.'))
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

// Real Status Endpoint
app.get('/api/status', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', message: 'Backend is running and connected to PostgreSQL' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed', error: err.message });
  }
});

// Handle Contact Form Submissions
app.post('/api/messages', async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    const query = 'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)';
    const values = [name, email, message];
    await pool.query(query, values);
    
    res.status(201).json({ success: true, message: 'Message saved successfully!' });
  } catch (err) {
    console.error('Database insert error:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
