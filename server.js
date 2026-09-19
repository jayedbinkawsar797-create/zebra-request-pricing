import express from 'express';
import cors from 'cors';
import pg from 'pg';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // We will use native fetch or install node-fetch if needed (Node 18+ has native fetch)

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

const upload = multer();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS zebra_leads (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone_number VARCHAR(50),
      email VARCHAR(255),
      zip_code VARCHAR(20),
      model_interest VARCHAR(100),
      buying_timeline VARCHAR(100),
      budget_preference VARCHAR(100),
      utm_source VARCHAR(255),
      utm_campaign VARCHAR(255),
      fbclid VARCHAR(255),
      landing_page_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
  }
}
initDb();

app.post('/api/leads', upload.none(), async (req, res) => {
  try {
    const data = req.body;
    
    if (data._honey) {
      return res.status(200).json({ success: true, message: "Honeypot triggered" });
    }

    const insertQuery = `
      INSERT INTO zebra_leads (
        first_name, last_name, phone_number, email, zip_code, 
        model_interest, buying_timeline, budget_preference, 
        utm_source, utm_campaign, fbclid, landing_page_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id;
    `;

    const values = [
      data.first_name || '',
      data.last_name || '',
      data.phone_number || '',
      data.email || '',
      data.zip_code || '',
      data.model_interest || '',
      data.buying_timeline || '',
      data.budget_preference || '',
      data.utm_source || '',
      data.utm_campaign || '',
      data.fbclid || '',
      data['landing-page-url'] || ''
    ];

    const result = await pool.query(insertQuery, values);
    console.log(`🎉 New Lead saved to database! ID: ${result.rows[0].id}`);

    // 🔥 NEW: Trigger the AI Assistant to send the first text message!
    try {
        const aiPayload = {
            first_name: data.first_name || 'there',
            phone_number: data.phone_number || '',
            model_interest: data.model_interest || 'Zebra Golf Cart'
        };
        
        // This hits the Python AI app you deployed on Railway
        await fetch('https://zebra-ai-assistant-production.up.railway.app/api/new-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aiPayload)
        });
        console.log(`🤖 Triggered AI Outreach for ${data.phone_number}`);
    } catch (aiErr) {
        console.error("❌ Failed to trigger AI outreach:", aiErr);
    }

    if (req.headers.accept === 'application/json') {
      return res.status(200).json({ success: true, lead_id: result.rows[0].id });
    }
    
    res.redirect('/thank-you.html');
  } catch (err) {
    console.error("❌ Error saving lead:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
